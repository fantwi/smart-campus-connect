<?php
namespace App\Http\Controllers;
use App\Models\UserPreference;
use Illuminate\Http\Request;
class PreferenceController extends Controller {
    private function output($p=null) { return ['accessibilityRequired'=>(bool)($p?->accessibility_required??false),'travelMode'=>$p?->travel_mode??'walking','savedPlaces'=>$p?->saved_places??[],'recentQuestions'=>$p?->recent_questions??[],'visitCounts'=>(object)($p?->visit_counts??[])]; }
    public function show(Request $r) { return response()->json($this->output($r->user()?UserPreference::find($r->user()->email):null)); }
    public function store(Request $r) {
        $d=$r->validate([
            'accessibilityRequired'=>'sometimes|boolean',
            'travelMode'=>'sometimes|string|in:walking,shuttle',
            'savedPlaces'=>'sometimes|array|max:100',
            'savedPlaces.*'=>'integer|min:1|distinct',
            'recentQuestion'=>'sometimes|nullable|string|max:240',
            'visitedPlaceId'=>'sometimes|nullable|integer|min:1',
        ]);
        $p=UserPreference::firstOrNew(['email'=>$r->user()->email]); $current=$this->output($p->exists?$p:null);
        $p->accessibility_required=$d['accessibilityRequired']??$current['accessibilityRequired'];
        $p->travel_mode=$d['travelMode']??$current['travelMode'];
        $p->saved_places=array_values($d['savedPlaces']??$current['savedPlaces']);
        $questions=$current['recentQuestions']; if(filled($d['recentQuestion']??null)) $questions=array_slice(array_values(array_unique([$d['recentQuestion'],...$questions])),0,10); $p->recent_questions=$questions;
        $visits=(array)$current['visitCounts']; if(isset($d['visitedPlaceId'])) $visits[(string)$d['visitedPlaceId']]=($visits[(string)$d['visitedPlaceId']]??0)+1; $p->visit_counts=$visits; $p->save();
        return response()->json($this->output($p));
    }
}
