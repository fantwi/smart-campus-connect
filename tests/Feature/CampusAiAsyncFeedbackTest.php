<?php

namespace Tests\Feature;

use Tests\TestCase;

class CampusAiAsyncFeedbackTest extends TestCase
{
    public function test_async_route_and_discovery_answers_are_rateable(): void
    {
        $source = file_get_contents(resource_path('js/App.tsx'));
        $logic = file_get_contents(resource_path('js/campus-ai.mjs'));

        $this->assertIsString($source);
        $this->assertIsString($logic);
        $this->assertStringContainsString('function createRateableAiMessage', $logic);
        $this->assertStringContainsString('id: idFactory()', $logic);
        $this->assertStringContainsString('`Your walking route to ${destination.name} is ready:', $source);
        $this->assertStringContainsString('createWalkingRouteFailureMessage(destination, fallbackUrl)', $source);
        $this->assertStringContainsString('`Closest ${kind === "food"', $source);
        $this->assertStringContainsString('createRateableAiMessage(`I could not find a mapped ${kind}', $source);
    }
}
