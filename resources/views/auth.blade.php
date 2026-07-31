<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>{{ ucfirst($mode) }} | UCC Campus Connect</title>
    <style>
        body{margin:0;background:#f6f8fb;color:#102f4d;font:14px Arial;display:grid;place-items:center;min-height:100vh}
        .card{width:min(410px,calc(100% - 40px));background:#fff;padding:32px;border-radius:14px;box-shadow:0 16px 50px #1233}
        .brand{font:26px Georgia;margin-bottom:8px}.sub{color:#647b8d;margin-bottom:24px;line-height:1.5}
        label{display:block;font-weight:700;margin:14px 0 6px}input{width:100%;box-sizing:border-box;padding:12px;border:1px solid #dce5ec;border-radius:7px}
        button,.provider{width:100%;box-sizing:border-box;margin-top:20px;padding:13px;border:0;border-radius:7px;background:#003b73;color:white;font-weight:700;cursor:pointer;text-align:center;text-decoration:none;display:block}
        .provider{margin-top:10px;background:#fff;color:#102f4d;border:1px solid #dce5ec}.provider:hover{background:#f6f8fb}
        .errors{color:#b42318;background:#feeceb;padding:10px;border-radius:6px}.switch{text-align:center;margin-top:18px}.switch a{color:#003b73}
        .divider{display:flex;align-items:center;gap:12px;color:#7d8d87;font-size:12px;margin:24px 0 12px}.divider:before,.divider:after{content:"";height:1px;background:#dce5ec;flex:1}
        .optional{font-size:11px;color:#7d8d87;text-align:center;margin-top:12px}.back{display:block;text-align:center;color:#647b8d;margin-top:20px;text-decoration:none;font-size:12px}
    </style>
</head>
<body>
<main class="card">
    <div class="brand">UCC Campus Connect</div>
    <div class="sub">{{ $mode === 'login' ? 'Sign in with your Campus Connect account.' : 'Create a free in-app account. Google and ChatGPT are optional.' }}</div>

    @if($errors->any())<div class="errors">{{ $errors->first() }}</div>@endif

    <form method="post" action="/{{ $mode }}">
        @csrf
        @if($mode === 'register')
            <label for="name">Name</label><input id="name" name="name" value="{{ old('name') }}" autocomplete="name" required>
        @endif
        <label for="email">Email</label><input id="email" type="email" name="email" value="{{ old('email') }}" autocomplete="email" required>
        <label for="password">Password</label><input id="password" type="password" name="password" autocomplete="{{ $mode === 'login' ? 'current-password' : 'new-password' }}" required>
        @if($mode === 'register')
            <label for="password_confirmation">Confirm password</label><input id="password_confirmation" type="password" name="password_confirmation" autocomplete="new-password" required>
        @endif
        <button>{{ $mode === 'login' ? 'Sign in' : 'Create in-app account' }}</button>
    </form>

    <div class="switch">
        @if($mode === 'login')New here? <a href="/register">Create an in-app account</a>
        @else Already registered? <a href="/login">Sign in</a>@endif
    </div>

    @if($googleEnabled || $chatGptSignInUrl)
        <div class="divider">Optional sign-in</div>
        @if($googleEnabled)<a class="provider" href="{{ route('oauth.google.redirect') }}">Continue with Google</a>@endif
        @if($chatGptSignInUrl)<a class="provider" href="{{ $chatGptSignInUrl }}">Continue with ChatGPT</a>@endif
        <div class="optional">These providers are conveniences. A Campus Connect account works independently.</div>
    @endif

    <a class="back" href="/">← Continue browsing as a guest</a>
</main>
</body>
</html>
