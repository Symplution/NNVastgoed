# NNvastgoed (NNV)

## Wat dit is
Woningportaal voor makelaars en woningzoekers in Noord-Nederland: Groningen, Friesland en Drenthe (Noord Nederlands Vastgoed).
Publieke site (zoeken, woning, makelaars, zoekopdracht met e-mailalert) en een beheer voor makelaars (woningen, leads, koppelingen).
Draait op GitHub, Vercel (fra1) en Supabase (EU, Frankfurt). Later komen er AI-departments bij (zie `/beheer/ai`); die zijn een aparte, bewust gebouwde verbinding met de app `ai-departments`.

## Regels
1. Alleen woningen in Groningen, Friesland en Drenthe (database-enum `province_t`, validatie in `src/lib/feeds/normalize.ts` en `listing-input.ts`).
2. Elke schemawijziging is een migratie in `supabase/migrations`.
3. Row level security op elke tabel, plus de restrictive `require_mfa` policy voor alles aan de makelaarskant. Elke nieuwe tabel krijgt een test in `tests/db.test.ts` die bewijst wie erbij kan en wie niet (bezoeker, collega-kantoor, alleen lezen, zonder tweede stap).
4. Geen service key in de browser. `SUPABASE_SERVICE_ROLE_KEY` alleen in `src/lib/supabase/service.ts` (server-only), alleen voor mail en gebruikslog. Rollen en kantoor komen uit `profiles`, nooit uit de client.
5. Elke uitgaande mail (en later elke betaalde AI-aanroep) gaat via de usage gate `src/lib/usage.ts`: maandbudget, uurlimiet, unieke sleutel, loggen naar `usage_events`.
6. Koppelingen (`/api/feeds/[id]`) gaan via de database-functie `ingest_listings`: alleen de hash van de sleutel staat in de database; geen account of service key nodig. Een foute woning blokkeert de rest niet.
7. Alle teksten in de UI in het Nederlands.
8. Publieke pagina's lezen met de anonieme rol (`src/lib/supabase/anon.ts`), zonder cookies. De middleware raakt alleen `/beheer`, `/login`, `/mfa`, `/wachtwoord`.
9. Workflows met wachttijd draaien in Trigger.dev (of Inngest), nooit in een Vercel functie. De dagelijkse alert-cron is kort en blijft een Vercel Cron.
10. Demomodus (`DEMO_MODE=1`) werkt alleen buiten productie en zonder Supabase; nooit afhankelijk van maken.

## Rollen
Eigenaar en beheerder: alle kantoren. Makelaar (`agent`): schrijft alleen bij het eigen kantoor. Alleen lezen: kijkt mee binnen het eigen kantoor. Nieuwe gebruikers beginnen met alleen lezen en zonder kantoor; de eerste gebruiker wordt eigenaar.

## Commando's
npm run dev | npm run build | npm run typecheck | npm test
