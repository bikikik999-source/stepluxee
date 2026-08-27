import { json, createSession, sessionCookie } from "./_shared.mjs";

const ADMIN_PASSWORD = "StepLuxe2026!";

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let body = {};
  try { body = await req.json(); } catch {}
  if (String(body.password || "") !== ADMIN_PASSWORD) {
    return json({ error: "Pogrešna lozinka." }, 401);
  }
  return json({ ok: true }, 200, {
    "Set-Cookie": sessionCookie(createSession())
  });
};
