<?php
namespace App\Http\Controllers;
use App\Models\AiFeedback;
use Illuminate\Http\Request;
class FeedbackController extends Controller {
    public function store(Request $r) {
        $d=$r->validate(['rating'=>'required|string|in:helpful,not_helpful,incorrect','messageId'=>'required|string|max:100','answer'=>'required|string|max:4000','question'=>'nullable|string|max:1000','correction'=>'required_if:rating,incorrect|nullable|string|min:5|max:2000','placeId'=>'nullable|integer|min:1']);
        $f=AiFeedback::create(['reporter_email'=>$r->user()?->email,'message_id'=>$d['messageId'],'rating'=>$d['rating'],'question'=>$d['question']??null,'answer'=>$d['answer'],'correction'=>$d['correction']??null,'place_id'=>$d['placeId']??null]);
        return response()->json(['id'=>$f->id,'saved'=>true]);
    }
}
