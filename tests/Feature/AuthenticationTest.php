<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_create_an_in_app_account(): void
    {
        $response = $this->post('/register', [
            'name' => 'Campus Student',
            'email' => 'student@example.com',
            'password' => 'secure-password',
            'password_confirmation' => 'secure-password',
        ]);

        $response->assertRedirect('/');
        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', ['email' => 'student@example.com']);
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
}
