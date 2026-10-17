# NNvastgoed (NNV) — Noord Nederlands Vastgoed

Het woningportaal voor Groningen, Friesland en Drenthe. Woningzoekers zoeken, bewaren en laten zich mailen bij nieuw aanbod. Makelaars koppelen hun eigen systeem of beheren woningen zelf, en krijgen hun leads in het beheer en per mail.

**Stack:** Next.js 15 (Vercel, fra1) · Supabase (EU, Frankfurt: Postgres, Auth met verplichte MFA, Storage) · GitHub Actions (typecheck, tests, build).

## Wat erin zit
- **Publiek:** voorpagina met zoekbalk, zoeken met filters en sorteren (`/koop`, `/groningen`, `/friesland`, `/drenthe`), woningpagina (galerij, kenmerken, maandlast-indicatie, contactformulier, vergelijkbare woningen, structured data), makelaars, bewaren zonder account, zoekopdracht met e-mailalert (dubbele opt-in), sitemap en robots.
- **Beheer** (`/beheer`, inloggen + authenticator): woningen (met fotoupload), leads, koppelingen, kantoorgegevens; voor NNV-beheer alle kantoren en gebruikers.
- **Koppelingen:** elk kantoor krijgt een eigen adres en geheime sleutel en stuurt zijn aanbod in JSON of XML (zie `/voor-makelaars` voor het formaat). Per woning wordt gevalideerd; wat niet klopt wordt afgewezen mét reden en blokkeert de rest niet.
- **Veiligheid:** row level security op elke tabel, restrictive `require_mfa`, een makelaar komt nooit bij een ander kantoor; 27 databasetests bewijzen dat (`tests/db.test.ts`, draait op PGlite).
- **AI-departments (later):** de usage gate (`src/lib/usage.ts`, tabel `usage_events` met soort `ai`) en de pagina `/beheer/ai` zijn al voorbereid.

## Opzetten
1. **GitHub:** maak de repository en push deze map.
2. **Supabase** (regio Frankfurt): draai in de SQL Editor `supabase/migrations/0001_init.sql` en daarna `0002_storage.sql` (of `supabase db push`).
   Authentication → Multi-Factor: TOTP aan; open registratie uit; zet de Site URL op je domein en voeg `https://<domein>/auth/callback` toe aan de Redirect URLs.
   Maak je eigen gebruiker via Authentication → Users → *Invite*: de **eerste gebruiker wordt eigenaar**. Daarna maak je onder *Alle kantoren* de kantoren aan en koppel je gebruikers onder *Gebruikers*.
3. **Vercel:** importeer de repository; zet de variabelen uit `.env.example`. `NEXT_PUBLIC_SUPABASE_ANON_KEY` is de publishable key; `SUPABASE_SERVICE_ROLE_KEY` blijft op de server. `vercel.json` zet de regio op Frankfurt en plant de dagelijkse alert-mail.
4. **Mail (optioneel):** zet `RESEND_API_KEY`, `MAIL_FROM` en `CRON_SECRET`. Zonder mail werkt alles behalve leadmails en alerts.

## Lokaal
```bash
cp .env.example .env.local     # vul Supabase in, of zet DEMO_MODE=1 voor voorbeeldwoningen
npm install && npm run dev
npm test && npm run typecheck
```

## Koppeling testen
```bash
curl -X POST https://<domein>/api/feeds/<koppeling-id> \
  -H "Authorization: Bearer <sleutel>" -H "Content-Type: application/json" \
  -d '{"volledig":false,"woningen":[{"id":"T1","straat":"Hoofdstraat","huisnummer":"1","postcode":"9981 AB","plaats":"Uithuizen","vraagprijs":250000,"woonoppervlakte":100,"kamers":4,"type":"tussenwoning"}]}'
```

## Nog niet gebouwd
- Kaartweergave (de coördinaten worden al opgeslagen).
- Merkspecifieke koppelingen (Realworks, Skarabee, Kolibri, Walvis): die vragen API-toegang van het kantoor zelf. Het NNV-formaat is de basis waar een ICT-partner of een adapter op aansluit.
- De AI-departments zelf en de verbinding met de app `ai-departments`.
- Juridische controle van de privacyverklaring en de algemene voorwaarden.
