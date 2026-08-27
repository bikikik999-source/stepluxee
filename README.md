# StepLuxe — Netlify + Netlify Blobs

Ova verzija **ne koristi Supabase ni Firebase**. Sajt, admin panel, proizvodi, slike i porudžbine rade preko Netlify-a.

## Šta dobijaš
- premium StepLuxe prodavnicu
- katalog, pretragu i filter veličina
- korpu i poručivanje
- admin panel na `/#admin`
- dodavanje proizvoda sa telefona
- upload slike
- cena i veličine
- sakrivanje/brisanje proizvoda
- pregled porudžbina i menjanje statusa
- trajno čuvanje proizvoda, slika i porudžbina u Netlify Blobs

## Jednokratno podešavanje na Netlify
Posle povezivanja repozitorijuma sa Netlify-jem, idi na:
**Site configuration → Environment variables**

Dodaj:
- `ADMIN_PASSWORD` = lozinka koju želiš za admin
- `SESSION_SECRET` = duga nasumična tajna, npr. 40+ karaktera

Zatim uradi **Redeploy**.

Nema SQL-a, nema Supabase naloga i nema Firebase naloga.

## Admin
Na sajtu otvori `/#admin`, unesi `ADMIN_PASSWORD` i možeš da dodaješ proizvode.
