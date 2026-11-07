function validDeviceId(value: string | null): value is string {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}
function config() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}
export async function GET(request: Request) {
  const deviceId = new URL(request.url).searchParams.get("deviceId");
  if (!validDeviceId(deviceId)) return Response.json({ error: "A valid guest device ID is required." }, { status: 400 });
  const db = config();
  if (!db) return Response.json({ enabled: false, configured: false });
  const response = await fetch(\`\${db.url}/rest/v1/prey_guest_memory?device_id=eq.\${deviceId}&select=memory_summary,turn_count,updated_at\`, {
    headers: { apikey: db.key, Authorization: \`Bearer \${db.key}\` }, cache: "no-store",
  });
  if (!response.ok) return Response.json({ error: "Could not load guest memory." }, { status: 502 });
  const rows = await response.json();
  return Response.json({ enabled: true, configured: true, memory: rows[0] ?? null });
}
export async function DELETE(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!validDeviceId(body.deviceId)) return Response.json({ error: "A valid guest device ID is required." }, { status: 400 });
  const db = config();
  if (!db) return Response.json({ error: "Guest memory database is not configured." }, { status: 503 });
  const response = await fetch(\`\${db.url}/rest/v1/prey_guest_memory?device_id=eq.\${body.deviceId}\`, {
    method: "DELETE", headers: { apikey: db.key, Authorization: \`Bearer \${db.key}\` },
  });
  if (!response.ok) return Response.json({ error: "Could not delete guest memory." }, { status: 502 });
  return Response.json({ deleted: true });
}
