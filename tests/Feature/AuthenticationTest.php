<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_create_an_in_app_account(): void
    {
        Notification::fake();

        $response = $this->post('/register', [
            'name' => 'Campus Student',
            'email' => 'student@example.com',
            'password' => 'secure-password',
            'password_confirmation' => 'secure-password',
        ]);

        $response->assertRedirect(route('verification.notice'));
        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', ['email' => 'student@example.com']);
        $this->assertFalse(User::where('email', 'student@example.com')->firstOrFail()->hasVerifiedEmail());
        Notification::assertSentTo(User::where('email', 'student@example.com')->firstOrFail(), VerifyEmail::class);
    }

    public function test_a_local_account_can_sign_in_without_an_external_provider(): void
    {
        $user = User::factory()->create(['password' => 'secure-password']);

        $this->post('/login', ['email' => $user->email, 'password' => 'secure-password'])
            ->assertRedirect('/');

        $this->assertAuthenticatedAs($user);
    }

    public function test_optional_provider_buttons_are_hidden_when_not_configured(): void
    {
        $this->get('/login')
            ->assertOk()
            ->assertSee('Sign in with your Campus Connect account.')
            ->assertDontSee('Continue with Google')
            ->assertDontSee('Continue with ChatGPT');

        $this->get('/auth/google')->assertNotFound();
    }

    public function test_chatgpt_sign_in_only_accepts_https_urls_on_allowed_hosts(): void
    {
        config()->set('services.chatgpt.allowed_hosts', ['chatgpt.com', 'openai.com']);

        foreach (['javascript:alert(1)', 'http://chatgpt.com/login', 'https://chatgpt.com@evil.example/login', 'https://openai.com.evil.example/login'] as $unsafeUrl) {
            config()->set('services.chatgpt.sign_in_url', $unsafeUrl);
            $this->get('/login')->assertOk()->assertDontSee($unsafeUrl, false)->assertDontSee('Continue with ChatGPT');
        }

        config()->set('services.chatgpt.sign_in_url', 'https://auth.openai.com/sign-in');
        $this->get('/login')
            ->assertOk()
            ->assertSee('Continue with ChatGPT')
            ->assertSee('https://auth.openai.com/sign-in', false);
    }

    public function test_logout_requires_a_post_request_and_ends_the_session(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/logout')->assertMethodNotAllowed();
        $this->assertAuthenticatedAs($user);

        $this->post('/logout')->assertRedirect('/');
        $this->assertGuest();
    }

    public function test_login_attempts_are_rate_limited_by_email_and_ip(): void
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->post('/login', [
                'email' => 'target@example.com',
                'password' => 'incorrect-password',
            ])->assertSessionHasErrors('email');
        }

        $this->post('/login', [
            'email' => 'target@example.com',
            'password' => 'incorrect-password',
        ])->assertTooManyRequests();
    }

    public function test_issue_submissions_are_rate_limited_per_user(): void
    {
        $user = User::factory()->create();
        $payload = [
            'category' => 'Other',
            'description' => 'A test issue report.',
            'locationText' => 'Science area',
        ];

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->actingAs($user)->postJson('/api/issues', $payload)->assertOk();
        }

        $this->actingAs($user)->postJson('/api/issues', $payload)->assertTooManyRequests();
    }

    public function test_unverified_accounts_cannot_write_personal_data(): void
    {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)->postJson('/api/account', [
            'fullName' => 'Unverified Student',
            'studentId' => 'MS/ITE/25/9999',
            'programme' => 'MSc Information Technology',
            'level' => 'Graduate',
        ])->assertForbidden();
    }

    public function test_verified_google_identity_safely_claims_a_matching_unverified_registration(): void
    {
        config()->set('services.google.client_id', 'client-id');
        config()->set('services.google.client_secret', 'client-secret');

        $user = User::factory()->unverified()->create([
            'email' => 'owner@example.com',
            'password' => Hash::make('attacker-password'),
        ]);

        Http::fake([
            'https://oauth2.googleapis.com/token' => Http::response(['access_token' => 'token']),
            'https://openidconnect.googleapis.com/v1/userinfo' => Http::response([
                'sub' => 'google-subject-123',
                'email' => 'owner@example.com',
                'email_verified' => true,
                'name' => 'Verified Owner',
            ]),
        ]);

        $response = $this->withSession(['google_oauth_state' => 'expected-state'])
            ->get('/auth/google/callback?state=expected-state&code=authorization-code');

        $response->assertRedirect('/');
        $user->refresh();
        $this->assertTrue($user->hasVerifiedEmail());
        $this->assertSame('google-subject-123', $user->google_sub);
        $this->assertFalse(Hash::check('attacker-password', $user->password));
        $this->assertAuthenticatedAs($user);
    }
}
