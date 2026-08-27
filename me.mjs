import { json, validSession } from "./_shared.mjs";
export default async function handler(req) {
  return json({ authenticated: validSession(req.headers.get("cookie") || "") });
}
