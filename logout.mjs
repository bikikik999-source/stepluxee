import { json, clearCookie } from "./_shared.mjs";
export default async function handler() {
  return json({ ok: true }, 200, { "Set-Cookie": clearCookie() });
}
