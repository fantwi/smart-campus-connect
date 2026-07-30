<?php
namespace App\Http\Controllers;
use App\Models\AiFeedback;
use Illuminate\Http\Request;
class FeedbackController extends Controller {
    public function store(Request $r) {
        $d=$r->validate(['rating'=>'required|in:helpful,not_helpful,incorrect','messageId'=>'required|max:100','answer'=>'required|max:4000','question'=>'nullable|max:1000','correction'=>'nullable|max:2000','placeId'=>'nullable|integer']);
        if($d['rating']==='incorrect' && strlen($d['correction']??'')<5) return response()->json(['error'=>'Please describe what should be corrected.'],422);
        $f=AiFeedback::create(['reporter_email'=>$r->user()?->email,'message_id'=>$d['messageId'],'rating'=>$d['rating'],'question'=>$d['question']??null,'answer'=>$d['answer'],'correction'=>$d['correction']??null,'place_id'=>$d['placeId']??null]);
        return response()->json(['id'=>$f->id,'saved'=>true]);
    }
}
