<?php

namespace Tests\Feature;

use Tests\TestCase;

class CampusAiAsyncFeedbackTest extends TestCase
{
    public function test_async_route_and_discovery_answers_are_rateable(): void
    {
        $source = file_get_contents(resource_path('js/App.tsx'));

        $this->assertIsString($source);
        $this->assertStringContainsString('function rateableAiMessage', $source);
        $this->assertStringContainsString('id: crypto.randomUUID()', $source);
        $this->assertStringContainsString('`Your walking route to ${destination.name} is ready:', $source);
        $this->assertStringContainsString('`I found your location, but the in-app walking route', $source);
        $this->assertStringContainsString('`Closest ${kind === "food"', $source);
        $this->assertStringContainsString('rateableAiMessage(`I could not find a mapped ${kind}', $source);
    }
}
