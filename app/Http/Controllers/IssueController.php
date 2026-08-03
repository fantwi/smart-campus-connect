<?php
namespace App\Http\Controllers;
use App\Models\IssueReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
class IssueController extends Controller {
    public function store(Request $r) {
        $d=$r->validate([
            'category'=>'required|string|in:Lighting,Water,Security,Damage,Other',
            'description'=>'required|string|min:5|max:4000',
            'locationText'=>'required|string|min:2|max:500',
            'latitude'=>'nullable|numeric|between:-90,90',
            'longitude'=>'nullable|numeric|between:-180,180',
            'photo'=>'nullable|image|max:5120',
        ]);
        $path=$r->file('photo')?->store('issues/'.$r->user()->id,'local');
        $report=IssueReport::create(['reporter_email'=>$r->user()->email,'category'=>$d['category'],'description'=>$d['description'],'location_text'=>$d['locationText'],'latitude'=>$d['latitude']??null,'longitude'=>$d['longitude']??null,'photo_key'=>$path,'status'=>'submitted']);
        return response()->json(['id'=>$report->id,'status'=>$report->status,'hasPhoto'=>(bool)$path]);
    }

    public function photo(Request $r, IssueReport $report) {
        abort_unless(hash_equals(strtolower($report->reporter_email), strtolower($r->user()->email)), 403);
        abort_unless($report->photo_key && Storage::disk('local')->exists($report->photo_key), 404);

        $response=response()->file(Storage::disk('local')->path($report->photo_key), [
            'Content-Type'=>Storage::disk('local')->mimeType($report->photo_key) ?: 'application/octet-stream',
            'Content-Disposition'=>'inline',
            'X-Content-Type-Options'=>'nosniff',
        ]);
        $response->setPrivate();
        $response->setMaxAge(0);
        $response->headers->addCacheControlDirective('no-store');
        $response->headers->addCacheControlDirective('must-revalidate');

        return $response;
    }
}
