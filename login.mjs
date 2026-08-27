import { json, createSession, env, sessionCookie } from "./_shared.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let body = {};
  try { body = await req.json(); } catch {}
  if (!env("ADMIN_PASSWORD") || !env("SESSION_SECRET")) {
    return json({ error: "Admin nije podešen. Dodajte ADMIN_PASSWORD i SESSION_SECRET u Netlify Environment variables." }, 500);
  }
  if (String(body.password || "") !== env("ADMIN_PASSWORD")) return json({ error: "Pogrešna lozinka." }, 401);
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(createSession()) });
};
