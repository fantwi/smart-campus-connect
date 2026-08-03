<?php

namespace Tests\Feature;

use Tests\TestCase;

class ShuttleAccuracyTest extends TestCase
{
    public function test_shuttle_assistant_does_not_generate_unverified_arrival_estimates(): void
    {
        $source = file_get_contents(resource_path('js/App.tsx'));

        $this->assertIsString($source);
        $this->assertStringNotContainsString('shuttleRoutes', $source);
        $this->assertStringNotContainsString('next shuttle is in roughly', $source);
        $this->assertStringNotContainsString('frequency-based estimates', $source);
        $this->assertStringContainsString('does not have a verified live timetable or vehicle feed', $source);
        $this->assertStringContainsString('ucc-gets-new-gatehouse-shuttle-terminal-002G', $source);
    }
}
