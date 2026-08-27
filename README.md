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


## Admin
Otvorite `/#admin`. Ako niste postavili `ADMIN_PASSWORD` na Netlify-u, podrazumevana lozinka je `StepLuxe2026!`.
\n\n### Admin prijava\nLozinka za admin je `StepLuxe2026!`. Ova verzija je namerno nezavisna od Netlify Environment Variables za admin prijavu.\n

## Admin
Lozinka: `StepLuxe2026!`. Login funkcija je standalone i ne zavisi od Environment Variables.
