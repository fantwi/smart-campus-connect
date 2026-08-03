<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FeedbackSecurityTest extends TestCase
{
    use RefreshDatabase;

    private array $payload = [
        'messageId' => 'answer-1',
        'rating' => 'helpful',
        'question' => 'Where is the library?',
        'answer' => 'The library is on campus.',
    ];

    public function test_feedback_requires_a_verified_account(): void
    {
        $this->postJson('/api/feedback', $this->payload)->assertUnauthorized();

        $unverified = User::factory()->unverified()->create(['id' => 3001]);
        $this->actingAs($unverified)->postJson('/api/feedback', $this->payload)->assertForbidden();

        $verified = User::factory()->create(['id' => 3002]);
        $this->actingAs($verified)->postJson('/api/feedback', $this->payload)->assertOk();

        $this->assertDatabaseHas('ai_feedback', [
            'reporter_email' => $verified->email,
            'message_id' => 'answer-1',
            'rating' => 'helpful',
        ]);
    }
}
