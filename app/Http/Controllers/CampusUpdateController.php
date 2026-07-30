<?php
namespace App\Http\Controllers;
use Illuminate\Support\Facades\Http;
class CampusUpdateController extends Controller {
    public function __invoke() {
        $updates=[
            ['id'=>'academic-marking-2026','title'=>'Marking and grading of examination scripts','summary'=>'The official 2025/2026 UCC academic calendar schedules marking and grading through 28 August 2026.','startDate'=>'2026-07-25','endDate'=>'2026-08-28','category'=>'Academic deadline','source'=>'UCC Academic Calendar','url'=>'https://academics.ucc.edu.gh/academic-calendar'],
            ['id'=>'academic-results-2026','title'=>'Release of examination results','summary'=>'The official academic calendar schedules the release of examination results from 29 August to 4 September 2026.','startDate'=>'2026-08-29','endDate'=>'2026-09-04','category'=>'Examinations','source'=>'UCC Academic Calendar','url'=>'https://academics.ucc.edu.gh/academic-calendar']
        ];
        return response()->json(['updates'=>$updates,'refreshedAt'=>now()->toIso8601String(),'sources'=>['https://events.ucc.edu.gh/','https://academics.ucc.edu.gh/academic-calendar']])->header('Cache-Control','public, max-age=300');
    }
}
