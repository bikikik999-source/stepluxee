import { json, createSession, env, sessionCookie } from "./_shared.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let body = {};
  try { body = await req.json(); } catch {}
  const adminPassword = env("ADMIN_PASSWORD") || "StepLuxe2026!";
  if (String(body.password || "") !== adminPassword) return json({ error: "Pogrešna lozinka." }, 401);
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(createSession()) });
};
