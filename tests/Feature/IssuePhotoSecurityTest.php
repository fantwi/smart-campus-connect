<?php

namespace Tests\Feature;

use App\Models\IssueReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class IssuePhotoSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_issue_photos_are_private_and_only_available_to_the_reporter(): void
    {
        Storage::fake('local');
        Storage::fake('public');

        $reporter = User::factory()->create(['id' => 999]);
        $otherUser = User::factory()->create(['id' => 1000]);

        $response = $this->actingAs($reporter)->post('/api/issues', [
            'category' => 'Damage',
            'description' => 'A damaged fixture needs attention.',
            'locationText' => 'Science Block',
            'photo' => UploadedFile::fake()->image('evidence.jpg'),
        ]);

        $response->assertOk();
        $report = IssueReport::findOrFail($response->json('id'));

        Storage::disk('local')->assertExists($report->photo_key);
        Storage::disk('public')->assertMissing($report->photo_key);

        $this->actingAs($otherUser)->get(route('issues.photo', $report))->assertForbidden();

        $photoResponse = $this->actingAs($reporter)->get(route('issues.photo', $report));
        $photoResponse->assertOk()->assertHeader('X-Content-Type-Options', 'nosniff');
        $this->assertStringContainsString('private', $photoResponse->headers->get('Cache-Control'));
        $this->assertStringContainsString('no-store', $photoResponse->headers->get('Cache-Control'));
        $this->assertStringNotContainsString('public', $photoResponse->headers->get('Cache-Control'));
    }
}
