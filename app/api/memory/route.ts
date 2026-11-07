import { createClient } from "@/lib/supabase/server";

async function ownerId() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const email = typeof claims?.email === "string" ? claims.email.toLowerCase() : "";
  const allowed = process.env.PREY_OWNER_EMAIL?.toLowerCase();
  if (error || !claims?.sub || !allowed || email !== allowed) return null;
  return String(claims.sub);
}
function dbConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}
export async function GET() {
  const id = await ownerId();
  if (!id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const db = dbConfig();
  if (!db) return Response.json({ enabled: false, configured: false });
  const response = await fetch(db.url + "/rest/v1/prey_user_memory?user_id=eq." + id + "&select=memory_summary,turn_count,updated_at", {
    headers: { apikey: db.key, Authorization: "Bearer " + db.key }, cache: "no-store",
  });
  if (!response.ok) return Response.json({ error: "Could not load account memory." }, { status: 502 });
  const rows = await response.json();
  return Response.json({ enabled: true, configured: true, memory: rows[0] ?? null });
}
export async function DELETE() {
  const id = await ownerId();
  if (!id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const db = dbConfig();
  if (!db) return Response.json({ error: "Memory database is not configured." }, { status: 503 });
  const response = await fetch(db.url + "/rest/v1/prey_user_memory?user_id=eq." + id, {
    method: "DELETE", headers: { apikey: db.key, Authorization: "Bearer " + db.key },
  });
  if (!response.ok) return Response.json({ error: "Could not delete account memory." }, { status: 502 });
  return Response.json({ deleted: true });
}
