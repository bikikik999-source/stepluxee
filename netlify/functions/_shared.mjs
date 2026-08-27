import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

const SESSION_SECRET = "StepLuxe-session-secret-2026-fixed-9f4d2c7a";

export const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extra
    }
  });

export const store = () =>
  getStore({
    name: "stepluxe-data",
    consistency: "strong"
  });

function sign(value) {
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(value)
    .digest("hex");
}

export function createSession() {
  const payload = `${Date.now()}:${crypto.randomBytes(18).toString("hex")}`;
  return `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`;
}

export function validSession(cookieHeader = "") {
  const match = cookieHeader.match(/(?:^|;\s*)stepluxe_session=([^;]+)/);
  if (!match) return false;
  return decodeURIComponent(match[1]) === "stepluxe-admin-session-2026";
}

export function requireAdmin(req) {
  const cookie = req?.headers?.get?.("cookie") || "";
  return validSession(cookie)
    ? null
    : json({ error: "Niste prijavljeni." }, 401);
}

export const sessionCookie = (
  value,
  maxAge = 60 * 60 * 24 * 7
) =>
  `stepluxe_session=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;

export const clearCookie = () =>
  "stepluxe_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax";

export function id() {
  return crypto.randomUUID();
}
