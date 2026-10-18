# NNvastgoed (NNV) — Noord Nederland Vastgoed

Het woningportaal voor Groningen, Friesland en Drenthe. Woningzoekers zoeken, bewaren en laten zich mailen bij nieuw aanbod. Makelaars koppelen hun eigen systeem of beheren woningen zelf, en krijgen hun leads in het beheer en per mail.

**Stack:** Next.js 15 (Vercel, fra1) · Supabase (EU, Frankfurt: Postgres, Auth met verplichte MFA, Storage) · GitHub Actions (typecheck, tests, build).

## Wat erin zit
- **Kiezen bovenin:** Kopen, Huren of Nieuwbouw (verkopen zit er bewust niet in). Op de voorpagina een zoekbalk met dezelfde keuze, en daaronder snelle ingangen naar bedrijfsruimte, NVM-makelaars, huurwoningen en alles over de woningmarkt.
- **Zoeken:** koop (`/koop`), huur (`/huur`, prijs per maand), nieuwbouw (`/nieuwbouw`) en bedrijfsruimte (`/bedrijfsruimte`), met filters, sorteren, provinciepagina's, makelaarspagina's (met NVM-filter), de woningmarkt met cijfers en uitleg, en een zoekopdracht met e-mailalert (dubbele opt-in).
- **Kaart:** bij kopen, huren, nieuwbouw en bedrijfsruimte schakel je tussen *Lijst* en *Kaart*. Op de kaart (Kadaster/PDOK, zonder sleutel) staat elke woning als huisje met de prijs op de exacte plek; klik voor de foto, het adres en een link, zoek op plaats, straat of postcode, en rechts staan de woningen die in beeld zijn. Woningen zonder coördinaten krijgen hun locatie automatisch uit het adres (bij invoeren en bij koppelingen). Op de woningpagina staat een tabblad *Locatie*.
- **Woningpagina:** galerij, tabbladen *Overzicht*, *Bezichtiging plannen* en *Maandlast*, berichten aan de makelaar en vergelijkbare woningen.
- **Bezichtigingen zonder bellen:** de makelaar stelt per kantoor in wanneer hij beschikbaar is (dagen, tijden, minuten per keer, aantal makelaars tegelijk, en blokkades). Een bezoeker kiest op de woningpagina een dag en tijd en het is meteen bevestigd: een mail met agenda-bestand (.ics) naar de bezoeker en het kantoor, en een link om te bekijken of te annuleren, ook zonder account. De database controleert zelf dat een moment vrij is, dus dubbel boeken kan niet.
- **Twee soorten accounts:**
  - **Zoekers** (open registratie, e-mail bevestigen, geen tweede stap) hebben *Mijn NNV*: favorieten (op alle apparaten), geplande bezichtigingen, berichten met makelaars en een profiel.
  - **Makelaars** (op uitnodiging, verplichte authenticator-app) hebben het beheer.
- **Beheer voor makelaars** (`/beheer`): woningen (koop, huur, nieuwbouw, bedrijfsruimte, met fotoupload), **bezichtigingen** als lijst per dag en als weekagenda met de gegevens van de bezoeker, zelf een bezichtiging inplannen, **beschikbaarheid**, **berichten** (chat met zoekers), leads, **contacten** (alle contactmomenten per persoon: formulier, bezichtigingen en gesprekken) en koppelingen. NNV-beheer ziet alle kantoren en zet het NVM-lidmaatschap.
- **Koppelingen:** elk kantoor krijgt een eigen adres en geheime sleutel en stuurt aanbod in JSON of XML (zie `/voor-makelaars`), inclusief huur, nieuwbouw en bedrijfsruimte. Per woning wordt gevalideerd; wat niet klopt wordt afgewezen mét reden en blokkeert de rest niet.
- **Veiligheid:** row level security op elke tabel. Wat bij het kantoor hoort vraagt een tweede inlogstap; een zoeker ziet alleen zijn eigen rijen. Een makelaar komt nooit bij een ander kantoor. Zoekers worden alleen zichtbaar voor een kantoor als ze zelf een gesprek beginnen of een bezichtiging plannen. 53 databasetests bewijzen dit (`tests/db.test.ts`, draait op PGlite).
- **AI-departments (later):** de usage gate (`src/lib/usage.ts`, tabel `usage_events` met soort `ai`) en de pagina `/beheer/ai` zijn al voorbereid.

## Opzetten
1. **GitHub:** de code staat in deze repository.
2. **Supabase** (regio Frankfurt): draai in de SQL Editor, **in deze volgorde en elk bestand apart**: `supabase/migrations/0001_init.sql`, `0002_storage.sql`, `0003_aanbod.sql`, `0004_seeker_role.sql`, `0005_bezichtigingen.sql`, `0006_contacten.sql`, `0007_kaart.sql` (of `supabase db push`).
   - Authentication → Multi-Factor: TOTP aan.
   - Authentication → Sign In / Providers: **open registratie blijft aan** (zoekers maken zelf een account) met **e-mail bevestigen** aan. Makelaars worden niet via de site aangemaakt maar uitgenodigd (Authentication → Users → Invite) en door de eigenaar aan een kantoor gekoppeld.
   - Authentication → URL Configuration: Site URL op je domein en `https://<domein>/auth/callback` bij Redirect URLs.
   - Authentication → SMTP: de standaardmail van Supabase verstuurt maar een paar mails per uur. Koppel voor echte bezoekers een eigen SMTP-dienst (bijvoorbeeld Resend), anders komen bevestigingsmails van zoekers niet aan.
   - De **eerste gebruiker wordt eigenaar**; iedereen daarna begint als zoeker. Maak je eigen account dus eerst (Invite).
3. **Vercel:** importeer de repository; zet de variabelen uit `.env.example`. `NEXT_PUBLIC_SUPABASE_ANON_KEY` is de publishable key; `SUPABASE_SERVICE_ROLE_KEY` blijft op de server (nodig voor mails). `vercel.json` zet de regio op Frankfurt en plant de dagelijkse alert-mail.
4. **Mail (nodig voor bevestigingen):** zet `RESEND_API_KEY`, `MAIL_FROM` en `CRON_SECRET`. Zonder mail werkt de site, maar krijgen bezoekers en makelaars geen bevestigingen en berichten per mail (alles staat wel in Mijn NNV en het beheer).
5. **Eerste kantoor:** log in, maak onder *Alle kantoren* een kantoor aan, koppel de makelaars (rol *Makelaar* en kantoor, onder *Gebruikers*) en laat het kantoor onder *Bezichtigingen → Beschikbaarheid* zijn momenten instellen.

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
- Herinneringsmail een dag voor de bezichtiging, en verzetten van een bezichtiging (nu: annuleren en opnieuw plannen).
- Realtime chat (nu ververst een gesprek elke 20 seconden).
- Merkspecifieke koppelingen (Realworks, Skarabee, Kolibri, Walvis): die vragen API-toegang van het kantoor zelf. Het NNV-formaat is de basis waar een ICT-partner of een adapter op aansluit.
- De AI-departments zelf en de verbinding met de app `ai-departments`.
- Juridische controle van de privacyverklaring en de algemene voorwaarden.

## Testgegevens
`supabase/seed/testdata.sql` zet een complete testomgeving klaar: 6 kantoren, 75 woningen met foto's (koop, huur, nieuwbouw, bedrijfsruimte, ook concept/verkocht/ingetrokken), beschikbaarheid, leads, bezichtigingen, gesprekken, favorieten en testaccounts (`@nnv.test`, wachtwoord in het bestand). Herhaalbaar. Opruimen voor livegang: `supabase/seed/testdata_verwijderen.sql`. Opnieuw genereren: `npm run testdata`.
De kaart gebruikt MapLibre met OpenFreeMap (wereldwijd, vloeiend), met PDOK als terugval. De voorbeeldfoto's komen uit `/api/foto/<naam>-<n>` (illustraties).

## Video, logo en pdf
- Per woning kan één video (MP4, WebM of MOV, tot 50 MB) worden geüpload of als https-adres worden toegevoegd (bucket `listing-videos`). Hij staat op de woningpagina onder de foto's.
- Elk kantoor kan een logo uploaden (bucket `office-logos`, onder Mijn kantoor).
- In het beheer staat bij elke woning een knop "Download pdf": een intern overzicht met beide logo's, alle foto's, de kenmerken, de volledige tekst en de contactgegevens van het kantoor (`src/lib/listing-pdf.ts`, route `/beheer/woningen/[id]/pdf`). Migratie `0009_media.sql`.
Alleen recreatiewoningen toevoegen (16 stuks, ook als de rest van de testgegevens al staat): `supabase/seed/testdata_recreatie.sql` (vereist migratie 0010 en minstens één kantoor).
