import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

export const json = (data, status = 200, extra = {}) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json; charset=utf-8", ...extra },
  body: JSON.stringify(data)
});

export const store = () => getStore({ name: "stepluxe-data", consistency: "strong" });

export function env(name) {
  return process.env[name] || "";
}

function sign(value) {
  return crypto.createHmac("sha256", env("SESSION_SECRET")).update(value).digest("hex");
}

export function createSession() {
  const payload = `${Date.now()}:${crypto.randomBytes(18).toString("hex")}`;
  return `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`;
}

export function validSession(cookieHeader = "") {
  const match = cookieHeader.match(/(?:^|;\\s*)stepluxe_session=([^;]+)/);
  if (!match || !env("SESSION_SECRET")) return false;
  const [encoded, sig] = decodeURIComponent(match[1]).split(".");
  if (!encoded || !sig) return false;
  let payload;
  try { payload = Buffer.from(encoded, "base64url").toString("utf8"); } catch { return false; }
  const ts = Number(payload.split(":")[0]);
  if (!Number.isFinite(ts) || Date.now() - ts > 1000 * 60 * 60 * 24 * 7) return false;
  const expected = sign(payload);
  try { return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)); } catch { return false; }
}

export function requireAdmin(event) {
  if (!validSession(event.headers?.cookie || event.headers?.Cookie || "")) return json({ error: "Niste prijavljeni." }, 401);
  return null;
}

export const sessionCookie = (value, maxAge = 60 * 60 * 24 * 7) =>
  `stepluxe_session=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;

export const clearCookie = () =>
  "stepluxe_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax";

export function id() { return crypto.randomUUID(); }
