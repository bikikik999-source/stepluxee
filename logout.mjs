export default async function handler() {
  return new Response(JSON.stringify({ok:true}), {
    status:200,
    headers:{
      "Content-Type":"application/json",
      "Set-Cookie":"stepluxe_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax"
    }
  });
}
