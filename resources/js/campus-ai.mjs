export function createCsrfHeaders(token) {
  return {
    "X-CSRF-TOKEN": token,
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
  };
}

export function classifyAssistantIntent(input, hasIssueDraft = false) {
  const lower = input.toLowerCase();
  if (/\b(submit|send|file)\b/.test(lower) && /\b(report|issue)\b/.test(lower) && hasIssueDraft) return "submit_issue";
  if (/\b(report|broken|faulty|leak|leaking|no water|security concern|damaged|damage|not working)\b/.test(lower)) return "issue_report";
  if (/\b(event|events|announcement|announcements|seminar|seminars|workshop|conference|src|deadline|deadlines|exam|exams|examination|examinations|academic calendar|registration date)\b/.test(lower)) return "campus_updates";
  return "other";
}

export function filterCampusUpdates(question, updates, todayKey) {
  const lower = question.toLowerCase();
  const wantsNews = /\b(news|announcement|announcements|src)\b/.test(lower);
  const wantsSrc = /\bsrc\b/.test(lower);
  const candidates = updates.filter((update) => wantsNews
    ? update.source === "UCC News" && (!wantsSrc || /\bsrc\b/i.test(`${update.title} ${update.category}`))
    : update.source === "UCC Academic Calendar" && update.endDate >= todayKey);
  const ignored = ["what", "when", "show", "about", "latest", "current", "coming", "event", "events", "announcement", "announcements", "deadline", "deadlines", "academic", "calendar"];
  const terms = lower.split(/\W+/).filter((term) => term.length > 3 && !ignored.includes(term));
  const matches = candidates.filter((update) => {
    const haystack = `${update.title} ${update.summary} ${update.category}`.toLowerCase();
    return terms.length === 0 || terms.some((term) => haystack.includes(term) || (term.startsWith("exam") && haystack.includes("examination")));
  });
  return { kind: wantsNews ? "news" : "calendar", matches: matches.slice(0, 4) };
}

export function displayLocalizedAnswer(answer, language, languageLabel, generatedByModel) {
  if (generatedByModel || language === "en") return answer;
  return `${answer}\n\n${languageLabel} translation is temporarily unavailable, so the verified English answer is shown.`;
}

export function createRateableAiMessage(text, question, extra = {}, idFactory = () => crypto.randomUUID()) {
  return { id: idFactory(), from: "ai", text, question, ...extra };
}

export function createWalkingRouteFailureMessage(destination, fallbackUrl, idFactory) {
  return createRateableAiMessage(
    `I found your location, but the in-app walking route could not be loaded. You can still open directions to ${destination.name} in OpenStreetMap.`,
    `Directions to ${destination.name}`,
    { url: fallbackUrl, linkLabel: `Open directions to ${destination.name} →` },
    idFactory,
  );
}
