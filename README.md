# 🌾 Amundsen Homestead

En liten, moderne nettside for å selge varer fra gården – egg i dag, kaniner
neste år, og hva du enn vil senere. Du oppretter **annonser** selv fra admin
(bilde, kort tekst, lager og reservering), og hver annonse får sin egen side og
QR-kode.

Designet er «Rosemåling» – norsk folkekunst / Telemark-bunad: pergament-bakgrunn,
dyp Telemark-rød ramme med gull- og grønn-aksent, doble flate rammer og
diamant-prikk-motiv (Marcellus SC + Spectral). Forsiden er **adaptiv**: 1 annonse
vises som en stor hero-side, 2+ som en kortliste.

Bygget med **Next.js (App Router)**, **Tailwind CSS** og **Supabase**
(database + innlogging + bildelagring). Klar for **Vercel**.

---

## 1. Forutsetninger

- Node.js 18.18+
- En gratis konto på [supabase.com](https://supabase.com)
- En [Vercel](https://vercel.com)-konto

## 2. Sett opp Supabase

1. Opprett et nytt prosjekt på Supabase.
2. Gå til **SQL Editor**, lim inn hele innholdet i
   [`supabase/schema.sql`](./supabase/schema.sql) og kjør det.
   Dette lager annonse-tabellen, reservasjoner, sikkerhetsregler (RLS),
   reservasjons-funksjonen og bilde-bøtta.
   - Kjørte du en tidligere versjon (egg-modellen)? Bare kjør filen på nytt –
     den **migrerer automatisk** den gamle egg-oppføringen til en annonse og
     rydder bort det gamle.
3. Opprett din admin-bruker: **Authentication → Users → Add user** →
   e-post + passord (huk av «Auto Confirm User»).
4. Gå til **Project Settings → API** og kopier `Project URL` og
   `anon`/`publishable`-nøkkelen.

> Tips: Skru gjerne av selvregistrering under
> **Authentication → Providers → Email → «Enable sign ups»** (av), slik at kun
> brukere du selv oppretter kan logge inn.

## 3. Kjør lokalt

```bash
npm install
cp .env.local.example .env.local   # fyll inn Supabase-verdiene
npm run dev
```

- Forsiden: <http://localhost:3000>
- Admin: <http://localhost:3000/admin>

## 4. Slik bruker du den

**Admin (`/admin`):**
- **+ Ny annonse** → fyll inn tittel, tekst, bilde, lager og velg
  **reservasjonstype**:
  - **Faste valg** – kunden velger f.eks. 6 / 12 / 24 (egg)
  - **Fritt antall** – kunden skriver inn ønsket antall
  - **Én enhet** – reserver 1 om gangen (f.eks. ett dyr)
- **Publiser / Skjul** annonser, endre rekkefølge, rediger eller slett.
- Se alle **reservasjoner** (navn, telefon, antall, melding, tid) med hvilken
  annonse de gjelder.
- Last ned **QR-kode** – én til forsiden (admin-forsiden) og én per annonse
  (inne på hver annonse). Skriv ut og heng opp.

**Kunde:**
- Forsiden viser alle tilgjengelige annonser som kort.
- Klikk en annonse → se detaljer og reserver. Lageret telles ned automatisk;
  når det er tomt vises «Utsolgt».

## 5. Deploy til Vercel

1. Push koden til et GitHub-repo.
2. Vercel: **Add New… → Project → Import** repoet (oppdager Next.js automatisk).
3. Legg inn **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy**. Etter deploy peker QR-kodene automatisk til produksjons-URLen –
   last dem ned på nytt derfra før du skriver dem ut.

Videre `git push` til `main` deployer automatisk på nytt. Ingen GitHub Actions
nødvendig.

## 6. Personvern (kort)

- Vi lagrer kun **navn** og **telefon** fra kunden – det som trengs for å legge
  varen klar. Ingen andre personopplysninger.
- Reservasjonslisten er kun synlig for innlogget admin (håndhevet av RLS).
- Personopplysninger logges aldri.

## 7. Sanntid og concurrency

Dette er to forskjellige ting, dekket av hver sin mekanisme:

**Sanntid (Realtime) – live UI:**
Åpne sider abonnerer på endringer i `listings` (og `reservations` i admin) via
Supabase Realtime og oppdaterer beholdningen live, uten at noen trenger å laste
siden på nytt. Ingen ekstra pakke – det ligger i `@supabase/supabase-js`.
Realtime skrus på for tabellene i `supabase/schema.sql` (de legges i
`supabase_realtime`-publikasjonen).

**Concurrency – ingen oversalg:**
All reservasjon går gjennom databasefunksjonen `make_reservation()`, som i én
atomisk transaksjon låser annonse-raden (`SELECT … FOR UPDATE`), sjekker lageret
og teller ned. Kommer to bestillinger samtidig, blir den andre validert mot det
oppdaterte tallet og avvist hvis det ikke er nok igjen. Du kan derfor aldri
selge mer enn du har – dette håndheves i databasen, ikke i nettleseren.

> Merk: dette hindrer oversalg av lageret, men ikke at samme person sender
> skjemaet to ganger. En egen «hindre dobbel innsending»-sperre kan legges til
> ved behov.

## 8. Betaling (senere)

Databasen har allerede et `price`-felt per annonse, klart for online betaling.
Anbefalt neste steg er **Vipps** (vanlig i Norge). Det bygges når du er klar –
krever en Vipps-avtale og en tredjepartspakke.

## 9. Prosjektstruktur

```
src/
  app/
    page.tsx                       # Forside: oversikt over annonser
    layout.tsx
    globals.css
    a/[slug]/page.tsx              # Offentlig detaljeside per annonse
    admin/
      page.tsx                     # Admin (server, beskyttet)
      AdminHome.tsx                # Admin-oversikt (klient)
      login/page.tsx               # Innlogging
      annonser/[id]/
        page.tsx                   # Editor (server; id="ny" = opprett)
        ListingEditor.tsx          # Editor-skjema (klient)
  components/
    TopBar.tsx                     # Persistent merkevare-topbar + rosemaling-bord
    Divider.tsx                    # Diamant+prikk folkekunst-skille
    ListingView.tsx                # Felles hero/detalje-visning
    ProductImage.tsx               # Bilde med 3D-look / burlap-placeholder
    StatusPill.tsx                 # "X igjen" / "Kun N igjen" / "Utsolgt"
    ReservationForm.tsx            # Dynamisk reservasjonsskjema (+ bekreftelse)
    QrCode.tsx                     # QR-generering + nedlasting
    RealtimeRefresh.tsx            # Live oppdatering via Supabase Realtime
  lib/
    types.ts
    slug.ts
    stock.ts                       # Statuspille-logikk + prisetikett
    supabase/{client,server,middleware}.ts
  middleware.ts                    # Sesjon + beskyttelse av /admin
supabase/
  schema.sql                       # Kjør i Supabase SQL Editor
```
