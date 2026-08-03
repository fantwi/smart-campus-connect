<?php
namespace App\Http\Controllers;
use App\Models\IssueReport;
use Illuminate\Http\UploadedFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
class IssueController extends Controller {
    public function store(Request $r) {
        $d=$r->validate([
            'category'=>'required|string|in:Lighting,Water,Security,Damage,Other',
            'description'=>'required|string|min:5|max:4000',
            'locationText'=>'required|string|min:2|max:500',
            'latitude'=>'nullable|numeric|between:-90,90',
            'longitude'=>'nullable|numeric|between:-180,180',
            'photo'=>'nullable|image|mimes:jpg,jpeg,png,webp|max:5120|dimensions:max_width=6000,max_height=6000',
        ]);
        $path=$r->file('photo') ? $this->storeSanitizedPhoto($r->file('photo'),$r->user()->id) : null;
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

    private function storeSanitizedPhoto(UploadedFile $file, int $userId): string {
        $info=@getimagesize($file->getRealPath());
        if (!$info || ($info[0]*$info[1])>25000000) throw ValidationException::withMessages(['photo'=>'The image dimensions are too large.']);
        $format=match($info[2]) { IMAGETYPE_JPEG=>['jpg','imagejpeg',88], IMAGETYPE_PNG=>['png','imagepng',6], IMAGETYPE_WEBP=>['webp','imagewebp',88], default=>null };
        if (!$format) throw ValidationException::withMessages(['photo'=>'The image format is not supported.']);
        $image=@imagecreatefromstring((string)file_get_contents($file->getRealPath()));
        if (!$image) throw ValidationException::withMessages(['photo'=>'The image could not be decoded safely.']);
        if ($format[0]!=='jpg') { imagealphablending($image,false); imagesavealpha($image,true); }
        ob_start();
        $written=$format[1]($image,null,$format[2]);
        $contents=ob_get_clean();
        imagedestroy($image);
        if (!$written || !is_string($contents) || $contents==='') throw ValidationException::withMessages(['photo'=>'The image could not be processed safely.']);
        $path='issues/'.$userId.'/'.Str::uuid().'.'.$format[0];
        if (!Storage::disk('local')->put($path,$contents)) throw new \RuntimeException('The issue photograph could not be stored.');
        return $path;
    }
}
