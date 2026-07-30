<?php
namespace App\Http\Controllers;
use App\Models\IssueReport;
use Illuminate\Http\Request;
class IssueController extends Controller {
    public function store(Request $r) {
        $d=$r->validate(['category'=>'required|in:Lighting,Water,Security,Damage,Other','description'=>'required|min:5','locationText'=>'required|min:2','latitude'=>'nullable|numeric','longitude'=>'nullable|numeric','photo'=>'nullable|image|max:5120']);
        $path=$r->file('photo')?->store('issues/'.$r->user()->id,'public');
        $report=IssueReport::create(['reporter_email'=>$r->user()->email,'category'=>$d['category'],'description'=>$d['description'],'location_text'=>$d['locationText'],'latitude'=>$d['latitude']??null,'longitude'=>$d['longitude']??null,'photo_key'=>$path,'status'=>'submitted']);
        return response()->json(['id'=>$report->id,'status'=>$report->status,'hasPhoto'=>(bool)$path]);
    }
}
