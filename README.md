# 🥚 Egg Shop

En liten, moderne nettside for å selge gårdsegg. Én offentlig side som viser
hvor mange egg som er til salgs i dag, med reservasjonsskjema, og en beskyttet
admin-side der du styrer antall, bilde, melding, ser reservasjoner og laster ned
en QR-kode til postkassen.

Bygget med **Next.js (App Router)**, **Tailwind CSS** og **Supabase**
(database + innlogging + bildelagring). Klar for **Vercel**.

---

## 1. Forutsetninger

- Node.js 18.18+ (du har v24 ✔)
- En gratis konto på [supabase.com](https://supabase.com)
- En [Vercel](https://vercel.com)-konto (du har allerede)

## 2. Sett opp Supabase

1. Opprett et nytt prosjekt på Supabase.
2. Gå til **SQL Editor**, lim inn hele innholdet i
   [`supabase/schema.sql`](./supabase/schema.sql) og kjør det.
   Dette lager tabellene, sikkerhetsregler (RLS), reservasjons-funksjonen og
   bilde-bøtta.
3. Opprett din admin-bruker: **Authentication → Users → Add user** →
   skriv inn e-post og passord (huk av «Auto Confirm User»).
   Dette er brukeren du logger inn med på `/admin`.
4. Gå til **Project Settings → API** og kopier:
   - `Project URL`
   - `anon` `public`-nøkkelen

> Tips: For litt ekstra sikkerhet kan du skru av selvregistrering under
> **Authentication → Providers → Email → «Enable sign ups»** (av), slik at kun
> brukere du selv oppretter kan logge inn.

## 3. Kjør lokalt

```bash
# 1. Installer avhengigheter
npm install

# 2. Lag miljøfil og fyll inn Supabase-verdiene
cp .env.local.example .env.local
#   -> rediger .env.local

# 3. Start utviklingsserveren
npm run dev
```

Åpne <http://localhost:3000> for den offentlige siden, og
<http://localhost:3000/admin> for admin (du blir sendt til innlogging).

## 4. Slik bruker du den

**Admin (`/admin`):**
- Sett **antall egg tilgjengelig i dag** (f.eks. 24).
- Last opp et **bilde** og skriv en **kort melding**.
- Trykk **Lagre**.
- Se **reservasjoner** (navn, telefon, antall, melding, tidspunkt).
- Last ned **QR-koden**, skriv den ut og heng på postkassen.

**Kunde (forsiden `/`):**
- Ser hvor mange egg som er tilgjengelig, bilde og melding.
- Velger 6, 12 eller 24 egg (kun de som får plass i lageret), fyller inn navn +
  telefon, og reserverer.
- Lageret telles ned automatisk. Når det er tomt vises «Utsolgt».

## 5. Deploy til Vercel

1. Push koden til et GitHub-repo.
2. På Vercel: **Add New… → Project → Import** repoet.
3. Under **Environment Variables**, legg inn de samme to variablene fra
   `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Trykk **Deploy**.
5. Etter deploy får du en URL (f.eks. `https://egg-shop.vercel.app`).
   QR-koden på admin-siden peker automatisk til denne adressen – last den ned
   på nytt fra produksjons-URLen før du skriver den ut.

## 6. Personvern (kort)

- Vi lagrer kun **navn** og **telefon** fra kunden – det som trengs for at du
  skal kunne legge eggene klar. Ingen andre personopplysninger.
- Reservasjonslisten er kun synlig for innlogget admin (håndhevet av RLS i
  databasen).
- Personopplysninger logges aldri.

## 7. Prosjektstruktur

```
src/
  app/
    page.tsx                 # Offentlig forside
    layout.tsx
    globals.css
    admin/
      page.tsx               # Admin (server, beskyttet)
      AdminDashboard.tsx     # Admin-UI (klient)
      login/page.tsx         # Innlogging
  components/
    ReservationForm.tsx      # Reservasjonsskjema
    QrCode.tsx               # QR-generering + nedlasting
  lib/
    types.ts
    supabase/
      client.ts              # Nettleser-klient
      server.ts              # Server-klient
      middleware.ts          # Sesjon + beskyttelse av /admin
  middleware.ts
supabase/
  schema.sql                 # Kjør i Supabase SQL Editor
```
