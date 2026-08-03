<?php

namespace Tests\Feature;

use Tests\TestCase;

class CampusAiUpdateAccuracyTest extends TestCase
{
    public function test_campus_ai_does_not_mix_or_fallback_to_unrelated_updates(): void
    {
        $source = file_get_contents(resource_path('js/App.tsx'));

        $this->assertIsString($source);
        $this->assertStringContainsString('update.source === "UCC News"', $source);
        $this->assertStringContainsString('const wantsSrc = /\\bsrc\\b/.test(lower)', $source);
        $this->assertStringContainsString('update.source === "UCC Academic Calendar" && update.endDate >= todayKey', $source);
        $this->assertStringContainsString('responseUpdates = matches.slice(0, 4)', $source);
        $this->assertStringNotContainsString('matches.length ? matches : campusUpdates', $source);
        $this->assertStringContainsString('no matching active or upcoming item', $source);
        $this->assertStringContainsString('updates feed is still loading', $source);
    }
}
