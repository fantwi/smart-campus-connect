<?php

namespace Tests\Feature;

use Tests\TestCase;

class ClientCsrfTest extends TestCase
{
    public function test_app_exposes_a_csrf_token_and_all_client_mutations_use_it(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertSee('name="csrf-token"', false);

        $source = file_get_contents(resource_path('js/App.tsx'));

        $this->assertIsString($source);
        $this->assertStringContainsString('"X-CSRF-TOKEN": csrfToken', $source);
        $this->assertSame(6, substr_count($source, 'headers: csrfHeaders') + substr_count($source, 'headers: { ...csrfHeaders'));
    }
}
