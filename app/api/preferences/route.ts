import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";

export const dynamic = "force-dynamic";

type PreferenceRow = {
  accessibility_required: number;
  travel_mode: string;
  saved_places: string;
  recent_questions: string;
  visit_counts: string;
};

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
}

function output(row: PreferenceRow | null) {
  return {
    accessibilityRequired: Boolean(row?.accessibility_required),
    travelMode: row?.travel_mode ?? "walking",
    savedPlaces: parseJson<number[]>(row?.saved_places, []),
    recentQuestions: parseJson<string[]>(row?.recent_questions, []),
    visitCounts: parseJson<Record<string, number>>(row?.visit_counts, {}),
  };
}

async function find(email: string) {
  return env.DB.prepare(
    "SELECT accessibility_required, travel_mode, saved_places, recent_questions, visit_counts FROM user_preferences WHERE email = ? LIMIT 1",
  ).bind(email).first<PreferenceRow>();
}

export async function GET() {
  const identity = await getChatGPTUser();
  if (!identity) return Response.json(output(null));
  return Response.json(output(await find(identity.email)));
}

export async function POST(request: Request) {
  const identity = await getChatGPTUser();
  if (!identity) return Response.json({ error: "Sign in is required." }, { status: 401 });
  const body = await request.json() as Record<string, unknown>;
  const current = output(await find(identity.email));
  const accessibilityRequired = typeof body.accessibilityRequired === "boolean" ? body.accessibilityRequired : current.accessibilityRequired;
  const travelMode = ["walking", "shuttle"].includes(String(body.travelMode)) ? String(body.travelMode) : current.travelMode;
  const savedPlaces = Array.isArray(body.savedPlaces) ? body.savedPlaces.map(Number).filter(Number.isFinite).slice(0, 100) : current.savedPlaces;
  const recentQuestions = body.recentQuestion
    ? [String(body.recentQuestion).slice(0, 240), ...current.recentQuestions.filter((question) => question !== body.recentQuestion)].slice(0, 10)
    : current.recentQuestions;
  const visitCounts = { ...current.visitCounts };
  if (Number.isFinite(Number(body.visitedPlaceId))) {
    const key = String(Number(body.visitedPlaceId));
    visitCounts[key] = (visitCounts[key] ?? 0) + 1;
  }
  await env.DB.prepare(
    `INSERT INTO user_preferences (email, accessibility_required, travel_mode, saved_places, recent_questions, visit_counts, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(email) DO UPDATE SET accessibility_required = excluded.accessibility_required, travel_mode = excluded.travel_mode,
       saved_places = excluded.saved_places, recent_questions = excluded.recent_questions, visit_counts = excluded.visit_counts, updated_at = CURRENT_TIMESTAMP`,
  ).bind(identity.email, accessibilityRequired ? 1 : 0, travelMode, JSON.stringify(savedPlaces), JSON.stringify(recentQuestions), JSON.stringify(visitCounts)).run();
  return Response.json(output(await find(identity.email)));
}
