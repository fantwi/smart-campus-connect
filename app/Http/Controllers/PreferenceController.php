<?php
namespace App\Http\Controllers;
use App\Models\UserPreference;
use Illuminate\Http\Request;
class PreferenceController extends Controller {
    private function output($p=null) { return ['accessibilityRequired'=>(bool)($p?->accessibility_required??false),'travelMode'=>$p?->travel_mode??'walking','savedPlaces'=>$p?->saved_places??[],'recentQuestions'=>$p?->recent_questions??[],'visitCounts'=>(object)($p?->visit_counts??[])]; }
    public function show(Request $r) { return response()->json($this->output($r->user()?UserPreference::find($r->user()->email):null)); }
    public function store(Request $r) {
        $p=UserPreference::firstOrNew(['email'=>$r->user()->email]); $current=$this->output($p->exists?$p:null);
        $p->accessibility_required=$r->input('accessibilityRequired',$current['accessibilityRequired']);
        $p->travel_mode=in_array($r->input('travelMode'),['walking','shuttle'])?$r->input('travelMode'):$current['travelMode'];
        $p->saved_places=array_slice(array_values(array_filter(array_map('intval',$r->input('savedPlaces',$current['savedPlaces'])))),0,100);
        $questions=$current['recentQuestions']; if($q=$r->input('recentQuestion')) $questions=array_slice(array_values(array_unique([substr($q,0,240),...$questions])),0,10); $p->recent_questions=$questions;
        $visits=(array)$current['visitCounts']; if($id=$r->input('visitedPlaceId')) $visits[(string)(int)$id]=($visits[(string)(int)$id]??0)+1; $p->visit_counts=$visits; $p->save();
        return response()->json($this->output($p));
    }
}
