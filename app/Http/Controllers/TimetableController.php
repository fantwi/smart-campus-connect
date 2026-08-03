<?php
namespace App\Http\Controllers;
use App\Models\TimetableEntry;
use Illuminate\Http\Request;
class TimetableController extends Controller {
    private function data(Request $r) {
        if (!$r->user()) return ['entries'=>[]];
        return ['entries'=>TimetableEntry::where('profile_email',$r->user()->email)->orderBy('day_of_week')->orderBy('start_time')->get()->map(fn($e)=>[
            'id'=>$e->id,'courseCode'=>$e->course_code,'title'=>$e->title,'venue'=>$e->venue,'placeId'=>$e->place_id,
            'dayOfWeek'=>$e->day_of_week,'startTime'=>substr($e->start_time,0,5),'endTime'=>substr($e->end_time,0,5),'reminderMinutes'=>$e->reminder_minutes])];
    }
    public function index(Request $r) { return response()->json($this->data($r)); }
    public function store(Request $r) {
        $rows=$r->has('entries') ? $r->input('entries') : [$r->all()];
        $validated=validator(['entries'=>$rows],[
            'entries'=>'required|array|min:1|max:100',
            'entries.*'=>'required|array:courseCode,title,venue,placeId,dayOfWeek,startTime,endTime,reminderMinutes',
            'entries.*.courseCode'=>'required|string|max:50',
            'entries.*.title'=>'required|string|max:255',
            'entries.*.venue'=>'required|string|max:255',
            'entries.*.placeId'=>'nullable|integer|min:1',
            'entries.*.dayOfWeek'=>'required|integer|between:0,6',
            'entries.*.startTime'=>'required|date_format:H:i',
            'entries.*.endTime'=>'required|date_format:H:i|after:entries.*.startTime',
            'entries.*.reminderMinutes'=>'nullable|integer|between:0,120',
        ])->validate();
        foreach($validated['entries'] as $d) TimetableEntry::create(['profile_email'=>$r->user()->email,'course_code'=>strtoupper(trim($d['courseCode'])),'title'=>trim($d['title']),'venue'=>trim($d['venue']),'place_id'=>$d['placeId']??null,'day_of_week'=>$d['dayOfWeek'],'start_time'=>$d['startTime'],'end_time'=>$d['endTime'],'reminder_minutes'=>$d['reminderMinutes']??20]);
        return response()->json($this->data($r));
    }
    public function destroy(Request $r) {
        $r->validate(['id'=>'required|uuid']); TimetableEntry::where('id',$r->id)->where('profile_email',$r->user()->email)->delete();
        return response()->json($this->data($r));
    }
}
