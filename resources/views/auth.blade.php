<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{{ ucfirst($mode) }} | UCC Campus Connect</title>
<style>body{margin:0;background:#f6f8fb;color:#102f4d;font:14px Arial;display:grid;place-items:center;min-height:100vh}.card{width:min(390px,calc(100% - 40px));background:#fff;padding:32px;border-radius:14px;box-shadow:0 16px 50px #1233}.brand{font:26px Georgia;margin-bottom:8px}.sub{color:#647b8d;margin-bottom:24px}label{display:block;font-weight:700;margin:14px 0 6px}input{width:100%;box-sizing:border-box;padding:12px;border:1px solid #dce5ec;border-radius:7px}button{width:100%;margin-top:20px;padding:13px;border:0;border-radius:7px;background:#003b73;color:white;font-weight:700}.errors{color:#b42318;background:#feeceb;padding:10px;border-radius:6px}.switch{text-align:center;margin-top:18px}.switch a{color:#003b73}</style></head>
<body><main class="card"><div class="brand">UCC Campus Connect</div><div class="sub">{{ $mode === 'login' ? 'Welcome back.' : 'Create your campus account.' }}</div>
@if($errors->any())<div class="errors">{{ $errors->first() }}</div>@endif
<form method="post" action="/{{ $mode }}">@csrf
@if($mode === 'register')<label>Name</label><input name="name" value="{{ old('name') }}" required>@endif
<label>Email</label><input type="email" name="email" value="{{ old('email') }}" required>
<label>Password</label><input type="password" name="password" required>
@if($mode === 'register')<label>Confirm password</label><input type="password" name="password_confirmation" required>@endif
<button>{{ $mode === 'login' ? 'Sign in' : 'Create account' }}</button></form>
<div class="switch">@if($mode === 'login')New here? <a href="/register">Create an account</a>@else Already registered? <a href="/login">Sign in</a>@endif</div></main></body></html>
