const PASSWORD = "StepLuxe2026!";
const TOKEN = "stepluxe-admin-session-2026";

export default async function handler(request) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  let body = {};

  try {
    const text = await request.text();
    body = text ? JSON.parse(text) : {};
  } catch {
    body = {};
  }

  const password = String(body.password ?? "").trim();

  if (password !== PASSWORD) {
    return new Response(JSON.stringify({ error: "Pogrešna lozinka." }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Set-Cookie": `stepluxe_session=${TOKEN}; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Lax`
    }
  });
}
