# NNvastgoed (NNV)

## Wat dit is
Woningportaal voor makelaars en woningzoekers in Noord-Nederland: Groningen, Friesland en Drenthe (Noord Nederlands Vastgoed).
Publieke site (kopen, huren, nieuwbouw, bedrijfsruimte, woningmarkt, makelaars, zoekopdracht met e-mailalert), Mijn NNV voor woningzoekers (favorieten, bezichtigingen, berichten) en een beheer voor makelaars (woningen, bezichtigingen met agenda, berichten, contacten, leads, koppelingen).
Draait op GitHub, Vercel (fra1) en Supabase (EU, Frankfurt). Later komen er AI-departments bij (zie `/beheer/ai`); die zijn een aparte, bewust gebouwde verbinding met de app `ai-departments`.

## Regels
1. Alleen woningen in Groningen, Friesland en Drenthe (database-enum `province_t`, validatie in `src/lib/feeds/normalize.ts` en `listing-input.ts`).
2. Elke schemawijziging is een migratie in `supabase/migrations`.
3. Row level security op elke tabel. Alles aan de makelaarskant vraagt een tweede stap (aal2): via `can_read_office` / `can_write_office` of de restrictive `require_mfa` policy. Zoekerstabellen (favorieten, eigen bezichtigingen, gesprekken) zijn per `auth.uid()` en hebben bewust geen tweede stap. Elke nieuwe tabel krijgt een test in `tests/db.test.ts` die bewijst wie erbij kan en wie niet (bezoeker, collega-kantoor, alleen lezen, zonder tweede stap).
4. Geen service key in de browser. `SUPABASE_SERVICE_ROLE_KEY` alleen in `src/lib/supabase/service.ts` (server-only), alleen voor mail en gebruikslog. Rollen en kantoor komen uit `profiles`, nooit uit de client.
5. Elke uitgaande mail (en later elke betaalde AI-aanroep) gaat via de usage gate `src/lib/usage.ts`: maandbudget, uurlimiet, unieke sleutel, loggen naar `usage_events`.
6. Koppelingen (`/api/feeds/[id]`) gaan via de database-functie `ingest_listings`: alleen de hash van de sleutel staat in de database; geen account of service key nodig. Een foute woning blokkeert de rest niet.
7. Alle teksten in de UI in het Nederlands.
7a. Bezichtigingen worden alleen ingepland via de database-functie `book_viewing` (controleert beschikbaarheid, capaciteit en dubbel boeken); vrije momenten komen uit `viewing_slots`. Een zoeker wordt voor een kantoor pas zichtbaar via een eigen gesprek of bezichtiging (`conversation_contacts`). Nieuwe zoekersrollen: `seeker` (open registratie); makelaars worden uitgenodigd.
8. Publieke pagina's lezen met de anonieme rol (`src/lib/supabase/anon.ts`), zonder cookies. De middleware raakt alleen `/beheer`, `/login`, `/mfa`, `/wachtwoord`.
9. Workflows met wachttijd draaien in Trigger.dev (of Inngest), nooit in een Vercel functie. De dagelijkse alert-cron is kort en blijft een Vercel Cron.
10. Demomodus (`DEMO_MODE=1`) werkt alleen buiten productie en zonder Supabase; nooit afhankelijk van maken.

## Rollen
Eigenaar en beheerder: alle kantoren. Makelaar (`agent`): schrijft alleen bij het eigen kantoor. Alleen lezen: kijkt mee binnen het eigen kantoor. Nieuwe gebruikers beginnen met alleen lezen en zonder kantoor; de eerste gebruiker wordt eigenaar.

## Commando's
npm run dev | npm run build | npm run typecheck | npm test
