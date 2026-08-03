<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Verify email | UCC Campus Connect</title>
    <style>
        body{margin:0;background:#f6f8fb;color:#102f4d;font:14px Arial;display:grid;place-items:center;min-height:100vh}
        .card{width:min(430px,calc(100% - 40px));background:#fff;padding:32px;border-radius:14px;box-shadow:0 16px 50px #1233;text-align:center}
        h1{font:26px Georgia;margin:0 0 12px}p{color:#647b8d;line-height:1.6}.success{color:#176b3a;background:#e8f7ee;padding:10px;border-radius:7px}
        button{width:100%;margin-top:18px;padding:13px;border:0;border-radius:7px;background:#003b73;color:#fff;font-weight:700;cursor:pointer}
        .logout button{background:none;color:#647b8d;margin-top:12px;padding:6px}.email{font-weight:700;color:#102f4d}
    </style>
</head>
<body>
<main class="card">
    <h1>Verify your email</h1>
    <p>We sent a verification link to <span class="email">{{ auth()->user()->email }}</span>. Verify the address before creating profiles, timetables, preferences, or issue reports.</p>
    @if(session('status') === 'verification-link-sent')<p class="success">A new verification link has been sent.</p>@endif
    <form method="post" action="{{ route('verification.send') }}">@csrf<button type="submit">Resend verification email</button></form>
    <form class="logout" method="post" action="/logout">@csrf<button type="submit">Sign out</button></form>
</main>
</body>
</html>
