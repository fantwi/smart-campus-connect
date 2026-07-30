import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";

export const dynamic = "force-dynamic";

const allowedRatings = new Set(["helpful", "not_helpful", "incorrect"]);

export async function POST(request: Request) {
  const identity = await getChatGPTUser();
  const body = await request.json() as Record<string, unknown>;
  const rating = String(body.rating ?? "");
  const messageId = String(body.messageId ?? "").slice(0, 100);
  const answer = String(body.answer ?? "").trim().slice(0, 4000);
  const correction = String(body.correction ?? "").trim().slice(0, 2000);

  if (!allowedRatings.has(rating) || !messageId || !answer) {
    return Response.json({ error: "Valid feedback details are required." }, { status: 400 });
  }
  if (rating === "incorrect" && correction.length < 5) {
    return Response.json({ error: "Please describe what should be corrected." }, { status: 400 });
  }

  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO ai_feedback (id, reporter_email, message_id, rating, question, answer, correction, place_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    id,
    identity?.email ?? null,
    messageId,
    rating,
    String(body.question ?? "").slice(0, 1000) || null,
    answer,
    correction || null,
    Number.isFinite(Number(body.placeId)) ? Number(body.placeId) : null,
  ).run();

  return Response.json({ id, saved: true });
}
