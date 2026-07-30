<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class UserPreference extends Model {
    protected $primaryKey = 'email'; public $incrementing = false; protected $keyType = 'string';
    protected $fillable = ['email','accessibility_required','travel_mode','saved_places','recent_questions','visit_counts'];
    protected $casts = ['accessibility_required'=>'boolean','saved_places'=>'array','recent_questions'=>'array','visit_counts'=>'array'];
}
