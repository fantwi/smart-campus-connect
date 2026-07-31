<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        $request->validate(['code' => ['required', 'string']]);

        $token = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'client_id' => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'code' => $request->query('code'),
            'grant_type' => 'authorization_code',
            'redirect_uri' => route('oauth.google.callback'),
        ])->throw()->json();

        $identity = Http::withToken($token['access_token'])
            ->get('https://openidconnect.googleapis.com/v1/userinfo')
            ->throw()
            ->json();

        abort_unless(($identity['email_verified'] ?? false) && filled($identity['email'] ?? null), 403, 'Google did not provide a verified email address.');

        $user = User::firstOrCreate(
            ['email' => strtolower($identity['email'])],
            ['name' => $identity['name'] ?? Str::before($identity['email'], '@'), 'password' => Hash::make(Str::random(48))],
        );

        Auth::login($user, true);
        $request->session()->regenerate();

        return redirect('/');
    }

    private function googleIsConfigured(): bool
    {
        return filled(config('services.google.client_id')) && filled(config('services.google.client_secret'));
    }
}
