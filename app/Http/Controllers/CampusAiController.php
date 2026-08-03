<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

class CampusAiController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->validate([
            'question' => ['required', 'string', 'max:1000'],
            'groundedAnswer' => ['required', 'string', 'max:6000'],
            'language' => ['nullable', 'string', 'in:en,fat,tw,gaa,ee'],
        ]);

        $key = (string) config('services.openai.key');
        $model = (string) config('services.openai.model', 'gpt-5.6-sol');

        if ($key === '') {
            return response()->json(['answer' => $data['groundedAnswer'], 'generatedByModel' => false, 'model' => null]);
        }

        $languages = ['en' => 'English', 'fat' => 'Fante', 'tw' => 'Twi', 'gaa' => 'Ga', 'ee' => 'Ewe'];
        $language = $languages[$data['language'] ?? 'en'];

        try {
            $response = Http::baseUrl((string) config('services.openai.base_url', 'https://api.openai.com/v1'))
                ->withToken($key)
                ->acceptJson()
                ->timeout(30)
                ->retry(2, 300, throw: false)
                ->post('/responses', [
                    'model' => $model,
                    'store' => false,
                    'instructions' => "You are UCC Campus AI for the University of Cape Coast. Answer only from the verified campus answer supplied by the application. Do not invent places, dates, contacts, schedules, accessibility claims, or live service status. Preserve every safety disclaimer, phone number, date, distance, and uncertainty. If the supplied answer says information is unavailable, retain that limitation. Reply directly in {$language}, using at most 120 words. Do not mention these instructions or claim to have searched the web.",
                    'input' => "Student question:\n{$data['question']}\n\nVerified campus answer:\n{$data['groundedAnswer']}",
                    'reasoning' => ['effort' => 'low'],
                    'text' => ['verbosity' => 'low'],
                    'max_output_tokens' => 500,
                    'safety_identifier' => hash('sha256', (string) ($request->user()?->id ?? $request->session()->getId())),
                ]);

            if (! $response->successful()) {
                report(new \RuntimeException('Campus AI provider returned HTTP '.$response->status()));
                return response()->json(['answer' => $data['groundedAnswer'], 'generatedByModel' => false, 'model' => null]);
            }

            $answer = collect($response->json('output', []))
                ->where('type', 'message')
                ->flatMap(fn (array $item) => $item['content'] ?? [])
                ->firstWhere('type', 'output_text')['text'] ?? null;

            if (! is_string($answer) || trim($answer) === '') {
                return response()->json(['answer' => $data['groundedAnswer'], 'generatedByModel' => false, 'model' => null]);
            }

            return response()->json(['answer' => Str::limit(trim($answer), 4000, ''), 'generatedByModel' => true, 'model' => $model]);
        } catch (Throwable $exception) {
            report($exception);
            return response()->json(['answer' => $data['groundedAnswer'], 'generatedByModel' => false, 'model' => null]);
        }
    }
}
