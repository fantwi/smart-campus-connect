<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('profiles', function (Blueprint $t) {
            $t->uuid('id')->primary(); $t->string('email')->unique(); $t->string('full_name');
            $t->string('student_id'); $t->string('programme'); $t->string('level'); $t->timestamps();
        });
        Schema::create('timetable_entries', function (Blueprint $t) {
            $t->uuid('id')->primary(); $t->string('profile_email')->index(); $t->string('course_code');
            $t->string('title'); $t->string('venue'); $t->unsignedBigInteger('place_id')->nullable();
            $t->unsignedTinyInteger('day_of_week'); $t->time('start_time'); $t->time('end_time');
            $t->unsignedSmallInteger('reminder_minutes')->default(20); $t->timestamps();
        });
        Schema::create('issue_reports', function (Blueprint $t) {
            $t->uuid('id')->primary(); $t->string('reporter_email')->index(); $t->string('category');
            $t->text('description'); $t->string('location_text'); $t->decimal('latitude',10,7)->nullable();
            $t->decimal('longitude',10,7)->nullable(); $t->string('photo_key')->nullable();
            $t->string('status')->default('submitted'); $t->timestamps();
        });
        Schema::create('user_preferences', function (Blueprint $t) {
            $t->string('email')->primary(); $t->boolean('accessibility_required')->default(false);
            $t->string('travel_mode')->default('walking'); $t->json('saved_places')->nullable();
            $t->json('recent_questions')->nullable(); $t->json('visit_counts')->nullable(); $t->timestamps();
        });
        Schema::create('ai_feedback', function (Blueprint $t) {
            $t->uuid('id')->primary(); $t->string('reporter_email')->nullable()->index();
            $t->string('message_id',100); $t->string('rating',20); $t->text('question')->nullable();
            $t->text('answer'); $t->text('correction')->nullable(); $t->unsignedBigInteger('place_id')->nullable(); $t->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('ai_feedback'); Schema::dropIfExists('user_preferences');
        Schema::dropIfExists('issue_reports'); Schema::dropIfExists('timetable_entries'); Schema::dropIfExists('profiles');
    }
};
