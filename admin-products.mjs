import { json, store, requireAdmin } from "./_shared.mjs";
export default async (req) => {
  const auth=requireAdmin(req); if(auth)return auth;
  const s=store(); const {blobs}=await s.list({prefix:"product/"}); const out=[];
  for(const b of blobs){const p=await s.get(b.key,{type:"json"}); if(p)out.push(p)}
  out.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)); return json(out);
};
