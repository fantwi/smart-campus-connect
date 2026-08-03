<?php
namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
class AuthController extends Controller {
    private function form(string $mode) {
        return response()->view('auth', [
            'mode' => $mode,
            'googleEnabled' => filled(config('services.google.client_id')) && filled(config('services.google.client_secret')),
            'chatGptSignInUrl' => config('services.chatgpt.sign_in_url'),
        ]);
    }
    public function showLogin() { return $this->form('login'); }
    public function showRegister() { return $this->form('register'); }
    public function login(Request $r) {
        if (is_string($r->input('email'))) $r->merge(['email'=>strtolower(trim($r->input('email')))]);
        $data=$r->validate(['email'=>'required|string|email|max:255','password'=>'required|string|max:72']);
        if (!Auth::attempt($data, true)) return back()->withErrors(['email'=>'The credentials do not match our records.'])->onlyInput('email');
        $r->session()->regenerate(); return $r->user()->hasVerifiedEmail() ? redirect('/') : redirect()->route('verification.notice');
    }
    public function register(Request $r) {
        if (is_string($r->input('email'))) $r->merge(['email'=>strtolower(trim($r->input('email')))]);
        $data=$r->validate(['name'=>'required|string|min:2|max:255','email'=>'required|string|email|max:255|unique:users','password'=>'required|string|min:8|max:72|confirmed']);
        $user=User::create(['name'=>$data['name'],'email'=>$data['email'],'password'=>Hash::make($data['password'])]);
        Auth::login($user); $r->session()->regenerate(); $user->sendEmailVerificationNotification(); return redirect()->route('verification.notice');
    }
    public function logout(Request $r) {
        Auth::logout(); $r->session()->invalidate(); $r->session()->regenerateToken(); return redirect('/');
    }
}
