<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->ensureProductionConfigurationIsSecure();

        RateLimiter::for('login', function (Request $request) {
            $email = Str::lower((string) $request->input('email'));

            return Limit::perMinute(5)->by(Str::transliterate($email).'|'.$request->ip());
        });

        RateLimiter::for('registration', fn (Request $request) =>
            Limit::perMinute(3)->by($request->ip())
        );

        RateLimiter::for('oauth', fn (Request $request) =>
            Limit::perMinute(10)->by($request->ip())
        );

        RateLimiter::for('account-writes', fn (Request $request) =>
            Limit::perMinute(20)->by((string) ($request->user()?->id ?? $request->ip()))
        );

        RateLimiter::for('timetable-writes', fn (Request $request) =>
            Limit::perMinute(30)->by((string) ($request->user()?->id ?? $request->ip()))
        );

        RateLimiter::for('preference-writes', fn (Request $request) =>
            Limit::perMinute(60)->by((string) ($request->user()?->id ?? $request->ip()))
        );

        RateLimiter::for('issue-submissions', fn (Request $request) =>
            Limit::perMinute(5)->by((string) ($request->user()?->id ?? $request->ip()))
        );

        RateLimiter::for('feedback', fn (Request $request) =>
            Limit::perMinute(20)->by((string) ($request->user()?->id ?? $request->ip()))
        );
    }

    private function ensureProductionConfigurationIsSecure(): void
    {
        if (! $this->app->isProduction()) {
            return;
        }

        $problems = [];

        if (config('app.debug')) {
            $problems[] = 'APP_DEBUG must be false';
        }

        if (! str_starts_with((string) config('app.url'), 'https://')) {
            $problems[] = 'APP_URL must use HTTPS';
        }

        if (config('session.secure') !== true) {
            $problems[] = 'SESSION_SECURE_COOKIE must be true';
        }

        if (config('session.http_only') !== true) {
            $problems[] = 'SESSION_HTTP_ONLY must be true';
        }

        if (! in_array(config('session.same_site'), ['lax', 'strict'], true)) {
            $problems[] = 'SESSION_SAME_SITE must be lax or strict';
        }

        if ($problems !== []) {
            throw new \RuntimeException('Unsafe production configuration: '.implode('; ', $problems).'.');
        }
    }
}
