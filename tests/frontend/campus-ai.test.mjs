import test from "node:test";
import assert from "node:assert/strict";
import {
  classifyAssistantIntent,
  createCsrfHeaders,
  createRateableAiMessage,
  createWalkingRouteFailureMessage,
  displayLocalizedAnswer,
  filterCampusUpdates,
} from "../../resources/js/campus-ai.mjs";

const updates = [
  { id: "news", title: "UCC counselling service expanded", summary: "A university update", category: "University news", source: "UCC News", startDate: "2026-07-27", endDate: "2026-07-27" },
  { id: "src", title: "UCC SRC strategic plan", summary: "Student leadership update", category: "SRC", source: "UCC News", startDate: "2026-07-23", endDate: "2026-07-23" },
  { id: "expired", title: "Semester Examinations", summary: "Past examinations", category: "Examinations", source: "UCC Academic Calendar", startDate: "2026-07-06", endDate: "2026-07-24" },
  { id: "results", title: "Release of Examination Results", summary: "Results publication", category: "Examinations", source: "UCC Academic Calendar", startDate: "2026-08-29", endDate: "2026-09-04" },
];

test("issue reporting takes precedence over academic-update keywords", () => {
  assert.equal(classifyAssistantIntent("Report a broken examination venue"), "issue_report");
  assert.equal(classifyAssistantIntent("Submit my report about the exam venue", true), "submit_issue");
  assert.equal(classifyAssistantIntent("Show examination deadlines"), "campus_updates");
});

test("official update filtering separates SRC news and excludes expired calendar entries", () => {
  assert.deepEqual(filterCampusUpdates("latest SRC announcements", updates, "2026-08-03").matches.map(({ id }) => id), ["src"]);
  assert.deepEqual(filterCampusUpdates("examination dates", updates, "2026-08-03").matches.map(({ id }) => id), ["results"]);
  assert.deepEqual(filterCampusUpdates("registration deadline", updates, "2026-08-03").matches, []);
});

test("language fallback clearly labels verified English while preserving model translations", () => {
  assert.equal(displayLocalizedAnswer("Verified answer", "tw", "Twi", false), "Verified answer\n\nTwi translation is temporarily unavailable, so the verified English answer is shown.");
  assert.equal(displayLocalizedAnswer("Nkyerɛase", "tw", "Twi", true), "Nkyerɛase");
  assert.equal(displayLocalizedAnswer("Verified answer", "en", "English", false), "Verified answer");
});

test("API requests receive the required CSRF and JSON headers", () => {
  assert.deepEqual(createCsrfHeaders("test-token"), {
    "X-CSRF-TOKEN": "test-token",
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
  });
});

test("asynchronous responses retain feedback metadata", () => {
  assert.deepEqual(createRateableAiMessage("Found it", "Nearest library", { placeId: 12 }, () => "message-1"), {
    id: "message-1", from: "ai", text: "Found it", question: "Nearest library", placeId: 12,
  });
});

test("walking-route failures remain actionable and rateable", () => {
  const message = createWalkingRouteFailureMessage({ name: "Sam Jonah Library" }, "https://maps.example/route", () => "route-1");
  assert.equal(message.id, "route-1");
  assert.equal(message.question, "Directions to Sam Jonah Library");
  assert.equal(message.url, "https://maps.example/route");
  assert.match(message.text, /could not be loaded/);
});
