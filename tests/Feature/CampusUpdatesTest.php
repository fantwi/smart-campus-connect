<?php

namespace Tests\Feature;

use Tests\TestCase;

class CampusUpdatesTest extends TestCase
{
    public function test_campus_updates_use_official_sources_and_expose_current_calendar_items(): void
    {
        $response = $this->getJson('/api/campus-updates');

        $response->assertOk()
            ->assertJsonPath('updates.0.source', 'UCC News')
            ->assertJsonPath('updates.0.startDate', '2026-07-27')
            ->assertJsonFragment([
                'id' => 'academic-vacation-2026',
                'startDate' => '2026-07-25',
                'endDate' => '2026-09-04',
                'url' => 'https://academics.ucc.edu.gh/academic-calendar',
            ])
            ->assertJsonFragment([
                'id' => 'academic-marking-2026',
                'endDate' => '2026-08-28',
            ]);
    }
}
