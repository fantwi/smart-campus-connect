<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
class TimetableEntry extends Model {
    use HasUuids;
    protected $fillable = ['profile_email','course_code','title','venue','place_id','day_of_week','start_time','end_time','reminder_minutes'];
}
