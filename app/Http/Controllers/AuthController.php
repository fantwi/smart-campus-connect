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
        $data=$r->validate(['email'=>'required|email','password'=>'required']);
        if (!Auth::attempt($data, true)) return back()->withErrors(['email'=>'The credentials do not match our records.'])->onlyInput('email');
        $r->session()->regenerate(); return redirect('/');
    }
    public function register(Request $r) {
        $data=$r->validate(['name'=>'required|min:2|max:255','email'=>'required|email|unique:users','password'=>'required|min:8|confirmed']);
        $user=User::create(['name'=>$data['name'],'email'=>$data['email'],'password'=>Hash::make($data['password'])]);
        Auth::login($user); $r->session()->regenerate(); return redirect('/');
    }
    public function logout(Request $r) {
        Auth::logout(); $r->session()->invalidate(); $r->session()->regenerateToken(); return redirect('/');
    }
}
