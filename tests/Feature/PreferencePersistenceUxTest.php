<?php

namespace Tests\Feature;

use Tests\TestCase;

class PreferencePersistenceUxTest extends TestCase
{
    public function test_saved_place_success_is_only_shown_after_server_confirmation(): void
    {
        $source = file_get_contents(resource_path('js/App.tsx'));

        $this->assertIsString($source);
        $this->assertStringContainsString('const synced = await updatePreferences({ savedPlaces: next }, true)', $source);
        $this->assertStringContainsString('if (synced) toast(next.includes(placeId) ? "Place saved"', $source);
        $this->assertStringNotContainsString('setSaved(next);', $source);
        $this->assertStringContainsString('Sign in to save places to your account', $source);
        $this->assertStringContainsString('Your preference could not be saved. Please try again.', $source);
        $this->assertStringContainsString('Your session expired. Refresh the page and sign in again.', $source);
        $this->assertStringContainsString('updatePreferences({ accessibilityRequired: event.target.checked }, true)', $source);
        $this->assertStringContainsString('updatePreferences({ travelMode: event.target.value }, true)', $source);
    }
}
