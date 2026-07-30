<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
class IssueReport extends Model {
    use HasUuids;
    protected $fillable = ['reporter_email','category','description','location_text','latitude','longitude','photo_key','status'];
}
