<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class CampusUpdateController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $newsUrl = 'https://news.ucc.edu.gh/ucc-news';
        $calendarUrl = 'https://academics.ucc.edu.gh/academic-calendar';

        // Verified against UCC's official news page and 2025/2026 calendar.
        $updates = [
            ['id' => 'news-lay-counsellors-2026', 'title' => 'UCC Counselling Centre Produces 25 Lay Counsellors', 'summary' => 'Twenty-five para-counsellors graduated from the Young and Wise programme organised by the UCC Counselling Centre.', 'startDate' => '2026-07-27', 'endDate' => '2026-07-27', 'category' => 'University news', 'source' => 'UCC News', 'url' => $newsUrl],
            ['id' => 'news-chinese-ambassador-2026', 'title' => 'Chinese Ambassador Visits Confucius Institute at UCC', 'summary' => 'The newly appointed Chinese Ambassador to Ghana visited the Confucius Institute at the University of Cape Coast.', 'startDate' => '2026-07-23', 'endDate' => '2026-07-23', 'category' => 'University news', 'source' => 'UCC News', 'url' => $newsUrl],
            ['id' => 'news-src-plan-2026', 'title' => 'UCC SRC Unveils 2026–2031 Strategic Plan', 'summary' => 'The Students’ Representative Council launched its first corporate strategic plan, covering growth, digital transformation and long-term development.', 'startDate' => '2026-07-23', 'endDate' => '2026-07-23', 'category' => 'SRC', 'source' => 'UCC News', 'url' => $newsUrl],
            ['id' => 'academic-vacation-2026', 'title' => 'Long Vacation Break', 'summary' => 'All students are on the long-vacation break scheduled from 25 July through 4 September 2026.', 'startDate' => '2026-07-25', 'endDate' => '2026-09-04', 'category' => 'Academic calendar', 'source' => 'UCC Academic Calendar', 'url' => $calendarUrl],
            ['id' => 'academic-marking-2026', 'title' => 'Marking and Grading of Examination Scripts', 'summary' => 'The official calendar schedules marking and grading from 25 July through 28 August 2026.', 'startDate' => '2026-07-25', 'endDate' => '2026-08-28', 'category' => 'Academic calendar', 'source' => 'UCC Academic Calendar', 'url' => $calendarUrl],
            ['id' => 'academic-results-2026', 'title' => 'Release of Examination Results', 'summary' => 'The official calendar schedules the release of examination results from 29 August through 4 September 2026.', 'startDate' => '2026-08-29', 'endDate' => '2026-09-04', 'category' => 'Examinations', 'source' => 'UCC Academic Calendar', 'url' => $calendarUrl],
        ];

        return response()->json([
            'updates' => $updates,
            'refreshedAt' => now()->toIso8601String(),
            'sources' => [$newsUrl, $calendarUrl],
        ])->header('Cache-Control', 'public, max-age=300');
    }
}
