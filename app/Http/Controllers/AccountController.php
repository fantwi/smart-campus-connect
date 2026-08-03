<?php
namespace App\Http\Controllers;
use App\Models\Profile;
use Illuminate\Http\Request;
class AccountController extends Controller {
    private function payload(Request $r) {
        $u=$r->user(); $p=$u ? Profile::where('email',$u->email)->first() : null;
        return ['identity'=>$u ? ['displayName'=>$u->name,'email'=>$u->email,'fullName'=>$u->name] : null,
            'profile'=>$p ? ['id'=>$p->id,'email'=>$p->email,'fullName'=>$p->full_name,'studentId'=>$p->student_id,'programme'=>$p->programme,'level'=>$p->level,'createdAt'=>$p->created_at] : null];
    }
    public function show(Request $r) { return response()->json($this->payload($r)); }
    public function store(Request $r) {
        $d=$r->validate(['fullName'=>'required|string|min:2|max:255','studentId'=>'required|string|min:4|max:100','programme'=>'required|string|min:2|max:255','level'=>'required|string|in:100,200,300,400,500,Graduate,Staff']);
        Profile::updateOrCreate(['email'=>$r->user()->email],['full_name'=>$d['fullName'],'student_id'=>strtoupper($d['studentId']),'programme'=>$d['programme'],'level'=>$d['level']]);
        return response()->json($this->payload($r));
    }
}
