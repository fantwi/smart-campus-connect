import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";

export const dynamic = "force-dynamic";

type ProfileRow = {
  id: string;
  email: string;
  full_name: string;
  student_id: string;
  programme: string;
  level: string;
  created_at: string;
};

function profileJson(row: ProfileRow | null) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    studentId: row.student_id,
    programme: row.programme,
    level: row.level,
    createdAt: row.created_at,
  };
}

export async function GET() {
  const identity = await getChatGPTUser();
  if (!identity) return Response.json({ identity: null, profile: null });

  const profile = await env.DB.prepare(
    "SELECT id, email, full_name, student_id, programme, level, created_at FROM profiles WHERE email = ? LIMIT 1",
  ).bind(identity.email).first<ProfileRow>();

  return Response.json({ identity, profile: profileJson(profile) });
}

export async function POST(request: Request) {
  const identity = await getChatGPTUser();
  if (!identity) return Response.json({ error: "Sign in is required." }, { status: 401 });

  const body = await request.json() as Record<string, unknown>;
  const fullName = String(body.fullName ?? "").trim();
  const studentId = String(body.studentId ?? "").trim().toUpperCase();
  const programme = String(body.programme ?? "").trim();
  const level = String(body.level ?? "").trim();

  if (fullName.length < 2 || studentId.length < 4 || programme.length < 2 || !["100", "200", "300", "400", "500", "Graduate", "Staff"].includes(level)) {
    return Response.json({ error: "Please complete all account details." }, { status: 400 });
  }

  const existing = await env.DB.prepare("SELECT id FROM profiles WHERE email = ? LIMIT 1")
    .bind(identity.email).first<{ id: string }>();
  const id = existing?.id ?? crypto.randomUUID();

  await env.DB.prepare(`
    INSERT INTO profiles (id, email, full_name, student_id, programme, level, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(email) DO UPDATE SET
      full_name = excluded.full_name,
      student_id = excluded.student_id,
      programme = excluded.programme,
      level = excluded.level,
      updated_at = CURRENT_TIMESTAMP
  `).bind(id, identity.email, fullName, studentId, programme, level).run();

  const profile = await env.DB.prepare(
    "SELECT id, email, full_name, student_id, programme, level, created_at FROM profiles WHERE email = ? LIMIT 1",
  ).bind(identity.email).first<ProfileRow>();

  return Response.json({ identity, profile: profileJson(profile) });
}
