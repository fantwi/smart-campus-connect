<?php
use App\Http\Controllers\{AccountController,AuthController,CampusUpdateController,FeedbackController,IssueController,OAuthController,PreferenceController,TimetableController};
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
Route::view('/','app');
Route::get('/login',[AuthController::class,'showLogin'])->name('login');
Route::post('/login',[AuthController::class,'login'])->middleware('throttle:login');
Route::get('/register',[AuthController::class,'showRegister']);
Route::post('/register',[AuthController::class,'register'])->middleware('throttle:registration');
Route::post('/logout',[AuthController::class,'logout'])->middleware('auth');
Route::get('/email/verify', fn () => view('verify-email'))->middleware('auth')->name('verification.notice');
Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
 $request->fulfill(); return redirect('/');
})->middleware(['auth','signed','throttle:6,1'])->name('verification.verify');
Route::post('/email/verification-notification', function (Request $request) {
 $request->user()->sendEmailVerificationNotification(); return back()->with('status','verification-link-sent');
})->middleware(['auth','throttle:6,1'])->name('verification.send');
Route::get('/auth/google', [OAuthController::class, 'redirectToGoogle'])->middleware('throttle:oauth')->name('oauth.google.redirect');
Route::get('/auth/google/callback', [OAuthController::class, 'handleGoogleCallback'])->middleware('throttle:oauth')->name('oauth.google.callback');
Route::prefix('api')->group(function(){
 Route::get('/account',[AccountController::class,'show']); Route::post('/account',[AccountController::class,'store'])->middleware(['auth','verified','throttle:account-writes']);
 Route::get('/timetable',[TimetableController::class,'index']); Route::post('/timetable',[TimetableController::class,'store'])->middleware(['auth','verified','throttle:timetable-writes']); Route::delete('/timetable',[TimetableController::class,'destroy'])->middleware(['auth','verified','throttle:timetable-writes']);
 Route::get('/preferences',[PreferenceController::class,'show']); Route::post('/preferences',[PreferenceController::class,'store'])->middleware(['auth','verified','throttle:preference-writes']);
 Route::post('/issues',[IssueController::class,'store'])->middleware(['auth','verified','throttle:issue-submissions']); Route::post('/feedback',[FeedbackController::class,'store'])->middleware('throttle:feedback');
 Route::get('/issues/{report}/photo',[IssueController::class,'photo'])->middleware(['auth','verified'])->name('issues.photo');
 Route::get('/campus-updates',CampusUpdateController::class);
});
