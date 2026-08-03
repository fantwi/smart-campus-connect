<?php

namespace Tests\Feature;

use App\Providers\AppServiceProvider;
use RuntimeException;
use Tests\TestCase;

class ProductionConfigurationTest extends TestCase
{
    public function test_application_refuses_to_boot_with_unsafe_production_configuration(): void
    {
        $this->app->detectEnvironment(fn () => 'production');
        config()->set('app.debug', true);
        config()->set('app.url', 'http://campus-connect.example.edu');
        config()->set('session.secure', false);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Unsafe production configuration');

        (new AppServiceProvider($this->app))->boot();
    }
}
