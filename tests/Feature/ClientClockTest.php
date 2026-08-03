<?php

namespace Tests\Feature;

use Tests\TestCase;

class ClientClockTest extends TestCase
{
    public function test_time_sensitive_campus_ai_features_use_a_refreshing_clock(): void
    {
        $source = file_get_contents(resource_path('js/App.tsx'));

        $this->assertIsString($source);
        $this->assertStringContainsString('const [currentTime, setCurrentTime] = useState(() => new Date())', $source);
        $this->assertStringContainsString('setInterval(() => setCurrentTime(new Date()), 30_000)', $source);
        $this->assertStringContainsString('window.clearInterval(refreshClock)', $source);
        $this->assertStringContainsString('const now = currentTime', $source);
        $this->assertStringContainsString('[timetable, currentTime]', $source);
        $this->assertStringNotContainsString('welcomeTime', $source);
    }
}
