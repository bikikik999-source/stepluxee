# StepLuxe — Netlify + GitHub, bez Supabase/Firebase

Ova verzija koristi samo Netlify Functions + Netlify Blobs za proizvode, slike i porudžbine.

## Podešavanje na Netlify

U Project configuration → Environment variables dodaj:

- `ADMIN_PASSWORD` — lozinka koju ti izabereš za admin
- `SESSION_SECRET` — dugačak nasumičan niz (npr. 40+ znakova)

Nema SQL-a, Supabase-a ni Firebase-a.

Admin: `/#admin` (podrazumevana lozinka: `StepLuxe2026!`; promeni je kasnije preko Netlify `ADMIN_PASSWORD`)

Build command: prazno
Publish directory: `.`
Functions directory: `netlify/functions`
