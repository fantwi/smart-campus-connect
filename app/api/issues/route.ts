import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const identity = await getChatGPTUser();
  if (!identity) return Response.json({ error: "Sign in is required to submit a report." }, { status: 401 });
  const form = await request.formData();
  const category = String(form.get("category") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const locationText = String(form.get("locationText") ?? "").trim();
  const latitude = String(form.get("latitude") ?? "").trim() || null;
  const longitude = String(form.get("longitude") ?? "").trim() || null;
  const photo = form.get("photo");
  if (!["Lighting", "Water", "Security", "Damage", "Other"].includes(category) || description.length < 5 || locationText.length < 2) {
    return Response.json({ error: "Add a category, description, and location." }, { status: 400 });
  }
  const id = crypto.randomUUID();
  let photoKey: string | null = null;
  if (photo instanceof File && photo.size > 0) {
    if (!photo.type.startsWith("image/") || photo.size > 5 * 1024 * 1024) {
      return Response.json({ error: "Photos must be images no larger than 5 MB." }, { status: 400 });
    }
    const extension = photo.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
    photoKey = `issues/${identity.email}/${id}.${extension}`;
    await env.ISSUE_PHOTOS.put(photoKey, await photo.arrayBuffer(), { httpMetadata: { contentType: photo.type } });
  }
  await env.DB.prepare(
    `INSERT INTO issue_reports
     (id, reporter_email, category, description, location_text, latitude, longitude, photo_key, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'submitted')`,
  ).bind(id, identity.email, category, description, locationText, latitude, longitude, photoKey).run();
  return Response.json({ id, status: "submitted", hasPhoto: Boolean(photoKey) });
}
