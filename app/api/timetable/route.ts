import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";

export const dynamic = "force-dynamic";

type TimetableRow = {
  id: string; course_code: string; title: string; venue: string; place_id: number | null;
  day_of_week: number; start_time: string; end_time: string; reminder_minutes: number;
};

function toJson(row: TimetableRow) {
  return { id: row.id, courseCode: row.course_code, title: row.title, venue: row.venue, placeId: row.place_id,
    dayOfWeek: row.day_of_week, startTime: row.start_time, endTime: row.end_time, reminderMinutes: row.reminder_minutes };
}

export async function GET() {
  const identity = await getChatGPTUser();
  if (!identity) return Response.json({ entries: [] });
  const result = await env.DB.prepare(
    `SELECT id, course_code, title, venue, place_id, day_of_week, start_time, end_time, reminder_minutes
     FROM timetable_entries WHERE profile_email = ? ORDER BY day_of_week, start_time`,
  ).bind(identity.email).all<TimetableRow>();
  return Response.json({ entries: result.results.map(toJson) });
}

export async function POST(request: Request) {
  const identity = await getChatGPTUser();
  if (!identity) return Response.json({ error: "Sign in is required." }, { status: 401 });
  const body = await request.json() as Record<string, unknown>;
  const entries = Array.isArray(body.entries) ? body.entries : [body];
  if (!entries.length || entries.length > 100) return Response.json({ error: "Add between 1 and 100 timetable entries." }, { status: 400 });
  try {
    const statements = entries.map((raw: any) => {
      const courseCode = String(raw.courseCode ?? "").trim().toUpperCase();
      const title = String(raw.title ?? "").trim();
      const venue = String(raw.venue ?? "").trim();
      const dayOfWeek = Number(raw.dayOfWeek);
      const startTime = String(raw.startTime ?? "");
      const endTime = String(raw.endTime ?? "");
      const placeId = raw.placeId == null ? null : Number(raw.placeId);
      const reminderMinutes = Math.min(120, Math.max(0, Number(raw.reminderMinutes ?? 20)));
      if (!courseCode || !title || !venue || dayOfWeek < 0 || dayOfWeek > 6 || !/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
        throw new Error("Every entry needs a course, title, venue, day, and valid start/end time.");
      }
      return env.DB.prepare(
        `INSERT INTO timetable_entries
         (id, profile_email, course_code, title, venue, place_id, day_of_week, start_time, end_time, reminder_minutes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(crypto.randomUUID(), identity.email, courseCode, title, venue, placeId, dayOfWeek, startTime, endTime, reminderMinutes);
    });
    await env.DB.batch(statements);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Timetable could not be saved." }, { status: 400 });
  }
  return GET();
}

export async function DELETE(request: Request) {
  const identity = await getChatGPTUser();
  if (!identity) return Response.json({ error: "Sign in is required." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Entry ID is required." }, { status: 400 });
  await env.DB.prepare("DELETE FROM timetable_entries WHERE id = ? AND profile_email = ?").bind(id, identity.email).run();
  return GET();
}
