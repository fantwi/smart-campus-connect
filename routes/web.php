<?php
use App\Http\Controllers\{AccountController,AuthController,CampusUpdateController,FeedbackController,IssueController,OAuthController,PreferenceController,TimetableController};
use Illuminate\Support\Facades\Route;
Route::view('/','app');
Route::get('/login',[AuthController::class,'showLogin'])->name('login');
Route::post('/login',[AuthController::class,'login']);
Route::get('/register',[AuthController::class,'showRegister']);
Route::post('/register',[AuthController::class,'register']);
Route::get('/logout',[AuthController::class,'logout']);
Route::get('/auth/google', [OAuthController::class, 'redirectToGoogle'])->name('oauth.google.redirect');
Route::get('/auth/google/callback', [OAuthController::class, 'handleGoogleCallback'])->name('oauth.google.callback');
Route::prefix('api')->group(function(){
 Route::get('/account',[AccountController::class,'show']); Route::post('/account',[AccountController::class,'store'])->middleware('auth');
 Route::get('/timetable',[TimetableController::class,'index']); Route::post('/timetable',[TimetableController::class,'store'])->middleware('auth'); Route::delete('/timetable',[TimetableController::class,'destroy'])->middleware('auth');
 Route::get('/preferences',[PreferenceController::class,'show']); Route::post('/preferences',[PreferenceController::class,'store'])->middleware('auth');
 Route::post('/issues',[IssueController::class,'store'])->middleware('auth'); Route::post('/feedback',[FeedbackController::class,'store']);
 Route::get('/campus-updates',CampusUpdateController::class);
});
