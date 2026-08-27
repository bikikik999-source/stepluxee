import { json, clearCookie } from "./_shared.mjs";
export default async (req) => json({ ok: true }, 200, { "Set-Cookie": clearCookie() });
