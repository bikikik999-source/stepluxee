const TOKEN = "stepluxe-admin-session-2026";
export default async function handler(req) {
  const cookie = req.headers.get("cookie") || "";
  const authenticated = cookie.split(";").some(x => x.trim() === `stepluxe_session=${TOKEN}`);
  return new Response(JSON.stringify({authenticated}), {
    status:200, headers:{"Content-Type":"application/json"}
  });
}
