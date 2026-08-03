<?php

namespace Tests\Feature;

use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CampusAiTest extends TestCase
{
    public function test_it_returns_a_grounded_responses_api_answer(): void
    {
        config()->set('services.openai.key', 'test-key');
        config()->set('services.openai.model', 'gpt-5.6-sol');
        Http::fake(['https://api.openai.com/v1/responses' => Http::response([
            'output' => [[
                'type' => 'message',
                'content' => [['type' => 'output_text', 'text' => 'The library closes at 10 PM.']],
            ]],
        ])]);

        $this->postJson('/api/campus-ai', [
            'question' => 'When does the library close?',
            'groundedAnswer' => 'Sam Jonah Library is open until 10 PM.',
            'language' => 'en',
        ])->assertOk()->assertJson([
            'answer' => 'The library closes at 10 PM.',
            'generatedByModel' => true,
            'model' => 'gpt-5.6-sol',
            'provider' => 'openai',
        ]);

        Http::assertSent(fn (Request $request) => $request->url() === 'https://api.openai.com/v1/responses'
            && $request['store'] === false
            && $request['reasoning']['effort'] === 'low'
            && str_contains($request['input'], 'Sam Jonah Library is open until 10 PM.')
        );
    }

    public function test_it_requests_the_users_selected_language_without_changing_grounded_facts(): void
    {
        config()->set('services.openai.key', 'test-key');
        Http::fake(['https://api.openai.com/v1/responses' => Http::response([
            'output' => [[
                'type' => 'message',
                'content' => [['type' => 'output_text', 'text' => 'Sam Jonah Nwoma Korabea no to pon anwummere dɔn du.']],
            ]],
        ])]);

        $this->postJson('/api/campus-ai', [
            'question' => 'Bere bɛn na library no to pon?',
            'groundedAnswer' => 'Sam Jonah Library closes at 10 PM.',
            'language' => 'tw',
        ])->assertOk()
            ->assertJsonPath('generatedByModel', true)
            ->assertJsonPath('answer', 'Sam Jonah Nwoma Korabea no to pon anwummere dɔn du.');

        Http::assertSent(fn (Request $request) => str_contains($request['instructions'], 'Reply directly in Twi')
            && str_contains($request['input'], 'Sam Jonah Library closes at 10 PM.')
        );
    }

    public function test_it_safely_falls_back_when_the_provider_is_unavailable(): void
    {
        config()->set('services.openai.key', 'test-key');
        Http::fake(['https://api.openai.com/v1/responses' => Http::response(['error' => ['message' => 'unavailable']], 503)]);

        $this->postJson('/api/campus-ai', [
            'question' => 'Where is the hospital?',
            'groundedAnswer' => 'The University Hospital is on South Campus.',
            'language' => 'en',
        ])->assertOk()->assertJson([
            'answer' => 'The University Hospital is on South Campus.',
            'generatedByModel' => false,
            'model' => null,
        ]);
    }

    public function test_it_uses_xai_when_openai_is_unavailable(): void
    {
        config()->set('services.openai.key', 'openai-test-key');
        config()->set('services.xai.key', 'xai-test-key');
        config()->set('services.xai.model', 'grok-4.5');
        Http::fake([
            'https://api.openai.com/v1/responses' => Http::response(['error' => ['message' => 'unavailable']], 503),
            'https://api.x.ai/v1/responses' => Http::response([
                'output' => [[
                    'type' => 'message',
                    'content' => [['type' => 'output_text', 'text' => 'The University Hospital is on South Campus.']],
                ]],
            ]),
        ]);

        $this->postJson('/api/campus-ai', [
            'question' => 'Where is the hospital?',
            'groundedAnswer' => 'The University Hospital is on South Campus.',
            'language' => 'en',
        ])->assertOk()->assertJson([
            'answer' => 'The University Hospital is on South Campus.',
            'generatedByModel' => true,
            'model' => 'grok-4.5',
            'provider' => 'xai',
        ]);

        Http::assertSent(fn (Request $request) => $request->url() === 'https://api.x.ai/v1/responses'
            && $request['model'] === 'grok-4.5'
            && $request['store'] === false
            && ! isset($request['reasoning'])
            && str_contains($request['instructions'], 'Answer only from the verified campus answer')
        );
    }

    public function test_it_validates_and_rate_limits_ai_requests(): void
    {
        $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.10'])
            ->postJson('/api/campus-ai', ['question' => [], 'groundedAnswer' => 'answer'])
            ->assertUnprocessable();

        config()->set('services.openai.key', '');
        for ($attempt = 0; $attempt < 12; $attempt++) {
            $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.11'])
                ->postJson('/api/campus-ai', ['question' => 'Hello', 'groundedAnswer' => 'Hello.'])
                ->assertOk();
        }
        $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.11'])
            ->postJson('/api/campus-ai', ['question' => 'Hello', 'groundedAnswer' => 'Hello.'])
            ->assertTooManyRequests();
    }
}
