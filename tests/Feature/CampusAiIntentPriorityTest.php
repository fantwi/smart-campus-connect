<?php

namespace Tests\Feature;

use Tests\TestCase;

class CampusAiIntentPriorityTest extends TestCase
{
    public function test_issue_reporting_is_evaluated_before_campus_updates(): void
    {
        $source = file_get_contents(resource_path('js/App.tsx'));

        $this->assertIsString($source);
        $reportBranch = strpos($source, '} else if (wantsIssueReport) {');
        $updatesBranch = strpos($source, '} else if (wantsCampusUpdates) {');

        $this->assertNotFalse($reportBranch);
        $this->assertNotFalse($updatesBranch);
        $this->assertLessThan($updatesBranch, $reportBranch);
        $this->assertStringContainsString('/\\b(damage|broken|crack)\\b/.test(lower) ? "Damage"', $source);
    }
}
