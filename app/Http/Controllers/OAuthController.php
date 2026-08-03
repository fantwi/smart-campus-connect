<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class OAuthController extends Controller
{
    public function redirectToGoogle(Request $request): RedirectResponse
    {
        abort_unless($this->googleIsConfigured(), 404);

        $state = Str::random(40);
        $request->session()->put('google_oauth_state', $state);

        return redirect()->away('https://accounts.google.com/o/oauth2/v2/auth?'.http_build_query([
            'client_id' => config('services.google.client_id'),
            'redirect_uri' => route('oauth.google.callback'),
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'state' => $state,
            'prompt' => 'select_account',
        ]));
    }

    public function handleGoogleCallback(Request $request): RedirectResponse
    {
        abort_unless($this->googleIsConfigured(), 404);

        $expectedState = $request->session()->pull('google_oauth_state');
        if (! $expectedState || ! hash_equals($expectedState, (string) $request->query('state'))) {
            return redirect('/login')->withErrors(['oauth' => 'The Google sign-in request expired. Please try again.']);
        }

        $request->validate(['code' => ['required', 'string', 'max:2048']]);

        try {
            $tokenResponse = Http::asForm()
                ->acceptJson()
                ->connectTimeout(3)
                ->timeout(10)
                ->post('https://oauth2.googleapis.com/token', [
                    'client_id' => config('services.google.client_id'),
                    'client_secret' => config('services.google.client_secret'),
                    'code' => $request->query('code'),
                    'grant_type' => 'authorization_code',
                    'redirect_uri' => route('oauth.google.callback'),
                ])
                ->throw();

            $accessToken = $tokenResponse->json('access_token');
            if (! is_string($accessToken) || $accessToken === '' || strlen($accessToken) > 4096) {
                return $this->providerFailure();
            }

            $identityResponse = Http::withToken($accessToken)
                ->acceptJson()
                ->connectTimeout(3)
                ->timeout(10)
                ->get('https://openidconnect.googleapis.com/v1/userinfo')
                ->throw();

            $identity = $identityResponse->json();
            if (! is_array($identity)) {
                return $this->providerFailure();
            }
        } catch (ConnectionException|RequestException) {
            return $this->providerFailure();
        }

        abort_unless(($identity['email_verified'] ?? false) && filled($identity['email'] ?? null), 403, 'Google did not provide a verified email address.');
        abort_unless(filled($identity['sub'] ?? null), 403, 'Google did not provide a stable account identifier.');

        $email = strtolower($identity['email']);
        $subject = (string) $identity['sub'];
        $user = User::where('google_sub', $subject)->first();

        if (! $user) {
            $user = User::where('email', $email)->first();

            if ($user && filled($user->google_sub) && ! hash_equals($user->google_sub, $subject)) {
                abort(409, 'This email address is already linked to another Google account.');
            }

            if (! $user) {
                $user = User::create([
                    'name' => $identity['name'] ?? Str::before($email, '@'),
                    'email' => $email,
                    'password' => Hash::make(Str::random(48)),
                    'google_sub' => $subject,
                    'email_verified_at' => now(),
                ]);
            } elseif (! $user->hasVerifiedEmail()) {
                // A verified Google identity may claim a matching unverified
                // registration, but the old password and sessions must not survive.
                DB::table('sessions')->where('user_id', $user->id)->delete();
                $user->forceFill([
                    'name' => $identity['name'] ?? $user->name,
                    'password' => Hash::make(Str::random(48)),
                    'remember_token' => Str::random(60),
                    'google_sub' => $subject,
                    'email_verified_at' => now(),
                ])->save();
            } else {
                $user->forceFill(['google_sub' => $subject])->save();
            }
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        Auth::login($user, true);
        $request->session()->regenerate();

        return redirect('/');
    }

    private function googleIsConfigured(): bool
    {
        return filled(config('services.google.client_id')) && filled(config('services.google.client_secret'));
    }

    private function providerFailure(): RedirectResponse
    {
        return redirect('/login')->withErrors([
            'oauth' => 'Google sign-in is temporarily unavailable. Please try again or use your Campus Connect account.',
        ]);
    }
}
