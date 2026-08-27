import { json, validSession } from "./_shared.mjs";
export default async (req) => json({ authenticated: validSession(req.headers?.cookie || req.headers?.Cookie || "") });
