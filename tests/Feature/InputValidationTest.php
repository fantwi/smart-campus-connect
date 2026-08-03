<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InputValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_issue_coordinates_must_be_within_geographic_bounds(): void
    {
        $user = User::factory()->create(['id' => 2001]);

        $this->actingAs($user)->postJson('/api/issues', [
            'category' => 'Other',
            'description' => 'Invalid coordinate test.',
            'locationText' => 'Science area',
            'latitude' => 91,
            'longitude' => -181,
        ])->assertUnprocessable()->assertJsonValidationErrors(['latitude', 'longitude']);
    }

    public function test_timetable_times_lengths_and_numeric_fields_are_validated(): void
    {
        $user = User::factory()->create(['id' => 2002]);

        $this->actingAs($user)->postJson('/api/timetable', [
            'courseCode' => str_repeat('X', 51),
            'title' => 'Invalid timetable entry',
            'venue' => 'Lecture hall',
            'placeId' => 'not-an-integer',
            'dayOfWeek' => 1,
            'startTime' => '14:00',
            'endTime' => '13:00',
            'reminderMinutes' => 121,
        ])->assertUnprocessable()->assertJsonValidationErrors([
            'entries.0.courseCode',
            'entries.0.placeId',
            'entries.0.endTime',
            'entries.0.reminderMinutes',
        ]);
    }

    public function test_malformed_preference_types_return_validation_errors(): void
    {
        $user = User::factory()->create(['id' => 2003]);

        $this->actingAs($user)->postJson('/api/preferences', [
            'accessibilityRequired' => 'not-a-boolean',
            'travelMode' => 'flying',
            'savedPlaces' => 'not-an-array',
            'recentQuestion' => ['not', 'a', 'string'],
            'visitedPlaceId' => -1,
        ])->assertUnprocessable()->assertJsonValidationErrors([
            'accessibilityRequired',
            'travelMode',
            'savedPlaces',
            'recentQuestion',
            'visitedPlaceId',
        ]);
    }
}
