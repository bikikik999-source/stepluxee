const PASSWORD = "StepLuxe2026!";
const TOKEN = "stepluxe-admin-session-2026";

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({error:"Method not allowed"}), {
      status:405, headers:{"Content-Type":"application/json"}
    });
  }
  let body = {};
  try { body = await req.json(); } catch {}
  if (String(body.password || "") !== PASSWORD) {
    return new Response(JSON.stringify({error:"Pogrešna lozinka."}), {
      status:401, headers:{"Content-Type":"application/json"}
    });
  }
  return new Response(JSON.stringify({ok:true}), {
    status:200,
    headers:{
      "Content-Type":"application/json",
      "Set-Cookie": `stepluxe_session=${TOKEN}; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Lax`
    }
  });
}
