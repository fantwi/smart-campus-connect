<?php

namespace Tests\Feature;

use Tests\TestCase;

class CampusAiUpdateAccuracyTest extends TestCase
{
    public function test_campus_ai_does_not_mix_or_fallback_to_unrelated_updates(): void
    {
        $source = file_get_contents(resource_path('js/App.tsx'));
        $logic = file_get_contents(resource_path('js/campus-ai.mjs'));

        $this->assertIsString($source);
        $this->assertIsString($logic);
        $this->assertStringContainsString('filterCampusUpdates(q, campusUpdates, todayKey)', $source);
        $this->assertStringContainsString('update.source === "UCC News"', $logic);
        $this->assertStringContainsString('const wantsSrc = /\\bsrc\\b/.test(lower)', $logic);
        $this->assertStringContainsString('update.source === "UCC Academic Calendar" && update.endDate >= todayKey', $logic);
        $this->assertStringContainsString('matches: matches.slice(0, 4)', $logic);
        $this->assertStringNotContainsString('matches.length ? matches : updates', $logic);
        $this->assertStringContainsString('no matching active or upcoming item', $source);
        $this->assertStringContainsString('updates feed is still loading', $source);
    }
}
