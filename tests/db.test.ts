import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { beforeAll, describe, expect, it } from 'vitest';

// Het databaseschema: wie mag wat (CLAUDE.md regel 4). Een verkoper-makelaar komt niet bij een collega-kantoor.
const root = join(__dirname, '../supabase');
let db: PGlite;
const ids = { owner: '', agentA: '', agentB: '', lezerA: '', nieuw: '' };
const office = { a: '', b: '' };
const listing = { pubA: '', conceptA: '', pubB: '' };
type Row = Record<string, any>;

async function as(user: string | null, sql: string, aal = 'aal2') {
  const role = user ? 'authenticated' : 'anon';
  await db.exec(`set role ${role}; select set_config('request.jwt.claim.sub','${user ?? ''}',false), set_config('request.jwt.claims','{"aal":"${user ? aal : ''}"}',false);`);
  try { return (await db.query(sql)).rows as Row[]; } finally { await db.exec('reset role'); }
}
const hash = (s: string) => createHash('sha256').update(s).digest('hex');
const lead = (l: string, email = 'koper@x.nl') => `insert into leads (listing_id, office_id, name, email, message, consent) values ('${l}', '${office.b}', 'Koper', '${email}', 'Hallo', true)`;

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create schema auth;
    create table auth.users (instance_id uuid, id uuid primary key, aud text, role text, email text, encrypted_password text,
      email_confirmed_at timestamptz, raw_app_meta_data jsonb, raw_user_meta_data jsonb, created_at timestamptz, updated_at timestamptz);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb) $$;
    create role authenticated; create role anon; grant usage on schema auth to authenticated, anon;
    -- Net als bij Supabase: een storage-schema met buckets en objecten.
    create schema storage;
    create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
    alter table storage.objects enable row level security;
    grant usage on schema storage to authenticated, anon; grant select, insert, update, delete on storage.objects to authenticated;`);
  for (const f of readdirSync(join(root, 'migrations')).sort()) await db.exec(readFileSync(join(root, 'migrations', f), 'utf8'));

  const mk = async (email: string) => (await db.query<{ id: string }>(`insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
      values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(),'authenticated','authenticated','${email}','',now(),'{}','{}',now(),now()) returning id`)).rows[0].id;
  ids.owner = await mk('owner@x.nl');        // eerste gebruiker → eigenaar
  ids.agentA = await mk('a@x.nl');
  ids.agentB = await mk('b@x.nl');
  ids.lezerA = await mk('lezer@x.nl');

  const off = async (slug: string, city: string) => (await db.query<{ id: string }>(`insert into offices (slug, name, city, province, email) values ('${slug}', '${slug}', '${city}', 'groningen', '${slug}@x.nl') returning id`)).rows[0].id;
  office.a = await off('kantoor-a', 'Groningen');
  office.b = await off('kantoor-b', 'Assen');
  await db.exec(`update profiles set role = 'agent', office_id = '${office.a}' where id = '${ids.agentA}';
    update profiles set role = 'agent', office_id = '${office.b}' where id = '${ids.agentB}';
    update profiles set role = 'readonly', office_id = '${office.a}' where id = '${ids.lezerA}';`);

  const l = async (o: string, status: string, street: string) => (await db.query<{ id: string }>(`insert into listings (office_id, slug, status, street, house_number, postcode, city, province, asking_price, living_area, rooms, property_type)
      values ('${o}', '${street}', '${status}', '${street}', '1', '9711 AA', 'Groningen', 'groningen', 300000, 100, 4, 'tussenwoning') returning id`)).rows[0].id;
  listing.pubA = await l(office.a, 'beschikbaar', 'openbaar-a');
  listing.conceptA = await l(office.a, 'concept', 'concept-a');
  listing.pubB = await l(office.b, 'beschikbaar', 'openbaar-b');
});

describe('gebruikers en rollen', () => {
  it('de eerste gebruiker wordt eigenaar, een nieuwe gebruiker begint met alleen lezen en zonder kantoor', async () => {
    const r = (await db.query<Row>(`select u.email, p.role, p.office_id from profiles p join auth.users u on u.id = p.id where u.email in ('owner@x.nl') `)).rows;
    expect(r[0].role).toBe('owner');
    const n = await db.query<{ id: string }>(`insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(),'authenticated','authenticated','nieuw@x.nl','',now(),'{}','{}',now(),now()) returning id`);
    ids.nieuw = n.rows[0].id;
    const p = (await db.query<Row>(`select role, office_id from profiles where id = '${ids.nieuw}'`)).rows[0];
    expect(p).toEqual({ role: 'readonly', office_id: null });
  });
  it('niemand verhoogt zijn eigen rol of kiest zijn eigen kantoor', async () => {
    await expect(as(ids.agentA, `update profiles set role = 'owner' where id = '${ids.agentA}'`)).rejects.toThrow(/eigenaar/);
    await expect(as(ids.agentA, `update profiles set office_id = '${office.b}' where id = '${ids.agentA}'`)).rejects.toThrow(/eigenaar/);
    await as(ids.owner, `update profiles set role = 'admin' where id = '${ids.nieuw}'`);
  });
  it('een makelaar ziet alleen het eigen profiel, de eigenaar ziet iedereen', async () => {
    expect(await as(ids.agentA, `select 1 from profiles`)).toHaveLength(1);
    expect((await as(ids.owner, `select 1 from profiles`)).length).toBeGreaterThanOrEqual(5);
  });
});

describe('openbaar aanbod', () => {
  it('een bezoeker ziet alleen woningen die online staan, geen concepten', async () => {
    const r = await as(null, `select slug from listings order by slug`);
    expect(r.map((x) => x.slug)).toEqual(['openbaar-a', 'openbaar-b']);
  });
  it('verkocht verdwijnt na 90 dagen, onder een inactief kantoor staat niets online', async () => {
    const v = (await db.query<{ id: string }>(`insert into listings (office_id, slug, status, street, house_number, postcode, city, province, asking_price, living_area, rooms, property_type)
      values ('${office.a}', 'verkocht-oud', 'verkocht', 'x', '1', '9711 AA', 'Groningen', 'groningen', 1, 1, 1, 'overig') returning id`)).rows[0].id;
    expect(await as(null, `select 1 from listings where id = '${v}'`)).toHaveLength(1);
    await db.exec(`update listings set updated_at = now() - interval '91 days' where id = '${v}'`);
    // de trigger zet updated_at terug op nu; dus direct via een bijgewerkte rij omzeilen
    await db.exec(`alter table listings disable trigger listings_touch_trg; update listings set updated_at = now() - interval '91 days' where id = '${v}'; alter table listings enable trigger listings_touch_trg;`);
    expect(await as(null, `select 1 from listings where id = '${v}'`)).toHaveLength(0);
    await db.exec(`update offices set active = false where id = '${office.b}'`);
    expect(await as(null, `select 1 from listings where id = '${listing.pubB}'`)).toHaveLength(0);
    expect(await as(null, `select 1 from offices where id = '${office.b}'`)).toHaveLength(0);
    await db.exec(`update offices set active = true where id = '${office.b}'`);
  });
  it('een bezoeker kan niets schrijven', async () => {
    await expect(as(null, `insert into listings (office_id, slug, street, house_number, postcode, city, province, asking_price, living_area, rooms, property_type) values ('${office.a}', 'hack', 'x', '1', '9711 AA', 'G', 'groningen', 1, 1, 1, 'overig')`)).rejects.toThrow();
    await expect(as(null, `update listings set asking_price = 1`)).rejects.toThrow();
  });
});

describe('een makelaar en een collega-kantoor', () => {
  it('ziet en wijzigt alleen de woningen van het eigen kantoor, inclusief concepten', async () => {
    const mine = await as(ids.agentA, `select slug from listings where office_id = '${office.a}' order by slug`);
    expect(mine.map((x) => x.slug)).toContain('concept-a');
    const b = await as(ids.agentB, `select slug from listings where status = 'concept'`);
    expect(b).toHaveLength(0);   // concept van kantoor A is onzichtbaar voor kantoor B
    expect(await as(ids.agentB, `update listings set asking_price = 1 where id = '${listing.pubA}' returning 1`)).toHaveLength(0);
    expect(await as(ids.agentB, `delete from listings where id = '${listing.conceptA}' returning 1`)).toHaveLength(0);
    await as(ids.agentA, `update listings set asking_price = 310000 where id = '${listing.pubA}'`);
  });
  it('kan geen woning onder een ander kantoor aanmaken of er naartoe verplaatsen', async () => {
    const ins = (o: string) => `insert into listings (office_id, slug, street, house_number, postcode, city, province, asking_price, living_area, rooms, property_type) values ('${o}', 'nieuw-${Math.random().toString(36).slice(2)}', 'x', '1', '9711 AA', 'G', 'groningen', 1, 1, 1, 'overig')`;
    await expect(as(ids.agentA, ins(office.b))).rejects.toThrow();
    await as(ids.agentA, ins(office.a));
    await expect(as(ids.agentA, `update listings set office_id = '${office.b}' where id = '${listing.pubA}'`)).rejects.toThrow();
  });
  it('alleen-lezen kijkt mee binnen het eigen kantoor maar wijzigt niets', async () => {
    expect((await as(ids.lezerA, `select 1 from listings where status = 'concept'`)).length).toBeGreaterThanOrEqual(1);
    expect(await as(ids.lezerA, `update listings set asking_price = 1 returning 1`)).toHaveLength(0);
    await expect(as(ids.lezerA, `insert into listings (office_id, slug, street, house_number, postcode, city, province, asking_price, living_area, rooms, property_type) values ('${office.a}', 'l', 'x', '1', '9711 AA', 'G', 'groningen', 1, 1, 1, 'overig')`)).rejects.toThrow();
  });
  it('zonder tweede inlogstap geen concepten, geen schrijfrechten', async () => {
    expect(await as(ids.agentA, `select 1 from listings where status = 'concept'`, 'aal1')).toHaveLength(0);
    expect((await as(ids.agentA, `select 1 from listings`, 'aal1')).length).toBeGreaterThan(0);   // het openbare aanbod blijft zichtbaar
    expect(await as(ids.agentA, `update listings set asking_price = 5 where id = '${listing.pubA}' returning 1`, 'aal1')).toHaveLength(0);
    await expect(as(ids.agentA, `insert into listings (office_id, slug, street, house_number, postcode, city, province, asking_price, living_area, rooms, property_type) values ('${office.a}', 'aal1', 'x', '1', '9711 AA', 'G', 'groningen', 1, 1, 1, 'overig')`, 'aal1')).rejects.toThrow();
    expect(await as(ids.owner, `select 1 from profiles`, 'aal1')).toHaveLength(0);
  });
  it('de eigenaar ziet alle kantoren', async () => {
    expect((await as(ids.owner, `select 1 from listings`)).length).toBeGreaterThanOrEqual(4);
  });
});

describe('contactverzoeken', () => {
  it('een bezoeker stuurt een verzoek voor een openbare woning; het kantoor komt uit de woning', async () => {
    await as(null, lead(listing.pubA, 'a@koper.nl'));   // het formulier noemt bewust kantoor B
    const r = await as(ids.agentA, `select office_id from leads where email = 'a@koper.nl'`);
    expect(r[0].office_id).toBe(office.a);
  });
  it('niet voor een concept, en een bezoeker leest nooit mee', async () => {
    await expect(as(null, lead(listing.conceptA))).rejects.toThrow(/niet beschikbaar/);
    await expect(as(null, `select 1 from leads`)).rejects.toThrow(/permission denied/);
  });
  it('alleen het eigen kantoor ziet de verzoeken, en pas na de tweede stap', async () => {
    expect(await as(ids.agentB, `select 1 from leads`)).toHaveLength(0);
    expect((await as(ids.agentA, `select 1 from leads`)).length).toBe(1);
    expect(await as(ids.agentA, `select 1 from leads`, 'aal1')).toHaveLength(0);
    expect(await as(ids.agentB, `update leads set status = 'afgehandeld' returning 1`)).toHaveLength(0);
    expect(await as(ids.agentA, `update leads set status = 'opgepakt' returning 1`)).toHaveLength(1);
  });
  it('een rem op misbruik: maximaal 5 per uur per e-mailadres', async () => {
    for (let i = 0; i < 4; i++) await as(null, lead(listing.pubA, 'spam@koper.nl'));
    await as(null, lead(listing.pubA, 'spam@koper.nl'));
    await expect(as(null, lead(listing.pubA, 'spam@koper.nl'))).rejects.toThrow(/Te veel/);
  });
  it('akkoord met de privacyverklaring is verplicht', async () => {
    await expect(as(null, `insert into leads (listing_id, office_id, name, email, message, consent) values ('${listing.pubA}', '${office.a}', 'K', 'k@k.nl', 'x', false)`)).rejects.toThrow();
  });
});

describe('zoekopdrachten', () => {
  it('een bezoeker slaat een zoekopdracht onbevestigd op en kan hem niet lezen', async () => {
    await as(null, `insert into saved_searches (email, filters) values ('z@x.nl', '{"provincie":"friesland"}')`);
    await expect(as(null, `insert into saved_searches (email, filters, confirmed_at) values ('z2@x.nl', '{}', now())`)).rejects.toThrow();
    await expect(as(null, `select 1 from saved_searches`)).rejects.toThrow(/permission denied/);
    await expect(as(ids.owner, `select 1 from saved_searches`)).rejects.toThrow(/permission denied/);
  });
  it('bevestigen en afmelden gaan met de sleutel uit de mail', async () => {
    const token = (await db.query<{ token: string }>(`select token from saved_searches limit 1`)).rows[0].token;
    expect((await as(null, `select public.confirm_saved_search('${token}') as ok`))[0].ok).toBe(true);
    expect((await as(null, `select public.confirm_saved_search(gen_random_uuid()) as ok`))[0].ok).toBe(false);
    await as(null, `select public.unsubscribe_saved_search('${token}')`);
    const r = (await db.query<Row>(`select confirmed_at, unsubscribed_at from saved_searches limit 1`)).rows[0];
    expect(r.confirmed_at).not.toBeNull(); expect(r.unsubscribed_at).not.toBeNull();
  });
});

describe('koppelingen', () => {
  let conn = '';
  const item = (ext: string, extra: Row = {}) => ({
    slug: `koppeling-${ext}`, external_id: ext, status: 'beschikbaar', street: 'Dorpsstraat', house_number: '5', postcode: '8601 AA', city: 'Sneek',
    province: 'friesland', asking_price: 250000, price_type: 'k.k.', living_area: 90, rooms: 4, bedrooms: 2, bathrooms: 1,
    property_type: 'tussenwoning', features: ['Tuin'], photos: [], ...extra,
  });
  const ingest = (secret: string, items: unknown[], full = false, id = conn) => as(null, `select public.ingest_listings('${id}', '${hash(secret)}', '${JSON.stringify(items).replace(/'/g, "''")}'::jsonb, '[]'::jsonb, ${full}) as r`);

  beforeAll(async () => {
    conn = (await as(ids.agentA, `insert into feed_connections (office_id, name, secret_hash, secret_hint) values ('${office.a}', 'Test', '${hash('geheim')}', 'eim') returning id`))[0].id;
  });
  it('de hash van de sleutel is niet leesbaar vanuit de browser', async () => {
    await expect(as(ids.agentA, `select secret_hash from feed_connections`)).rejects.toThrow();
    expect((await as(ids.agentA, `select id, secret_hint from feed_connections`))).toHaveLength(1);
  });
  it('een koppeling van een ander kantoor is onzichtbaar en een ander kantoor maakt er geen aan', async () => {
    expect(await as(ids.agentB, `select id from feed_connections`)).toHaveLength(0);
    await expect(as(ids.agentB, `insert into feed_connections (office_id, name, secret_hash) values ('${office.a}', 'x', 'h')`)).rejects.toThrow();
  });
  it('met een verkeerde sleutel gebeurt er niets', async () => {
    await expect(ingest('fout', [item('1')])).rejects.toThrow(/Ongeldige/);
    await expect(ingest('geheim', [item('1')], false, '00000000-0000-0000-0000-000000000000')).rejects.toThrow(/Ongeldige/);
  });
  it('met de juiste sleutel komt het aanbod onder het eigen kantoor, en een tweede keer wordt het bijgewerkt', async () => {
    expect((await ingest('geheim', [item('1'), item('2')]))[0].r.verwerkt).toBe(2);
    await ingest('geheim', [item('1', { asking_price: 240000 })]);
    const r = (await db.query<Row>(`select office_id, asking_price, source from listings where external_id = '1'`)).rows;
    expect(r).toEqual([{ office_id: office.a, asking_price: 240000, source: 'koppeling' }]);
    expect((await as(null, `select 1 from listings where external_id is not null`)).length).toBe(2);
  });
  it('een volledige synchronisatie haalt weg wat het kantoor niet meer stuurt, en raakt andere kantoren niet', async () => {
    await ingest('geheim', [item('1')], true);
    const r = (await db.query<Row>(`select external_id, status from listings where external_id is not null order by external_id`)).rows;
    expect(r).toEqual([{ external_id: '1', status: 'beschikbaar' }, { external_id: '2', status: 'ingetrokken' }]);
    expect((await db.query(`select 1 from listings where office_id = '${office.b}' and status = 'beschikbaar'`)).rows).toHaveLength(1);
  });
  it('het resultaat van een run staat bij het kantoor', async () => {
    const runs = await as(ids.agentA, `select received, upserted from feed_runs`);
    expect(runs.length).toBeGreaterThan(0);
    expect(await as(ids.agentB, `select 1 from feed_runs`)).toHaveLength(0);
  });
});

describe('foto-opslag', () => {
  const put = (u: string, o: string, file = 'a.jpg') => as(u, `insert into storage.objects (bucket_id, name) values ('listing-photos', '${o}/${file}')`);
  it('een makelaar uploadt alleen in de map van het eigen kantoor', async () => {
    await put(ids.agentA, office.a);
    await expect(put(ids.agentA, office.b)).rejects.toThrow();
    await expect(put(ids.agentA, 'geen-uuid')).rejects.toThrow();
    await expect(put(ids.lezerA, office.a)).rejects.toThrow();
    
  });
  it('zonder tweede stap, en een bezoeker, uploaden niet; collega-kantoor wist niets', async () => {
    await expect(as(ids.agentA, `insert into storage.objects (bucket_id, name) values ('listing-photos', '${office.a}/x.jpg')`, 'aal1')).rejects.toThrow();
    expect(await as(ids.agentB, `delete from storage.objects where name like '${office.a}/%' returning 1`)).toHaveLength(0);
    expect((await as(ids.agentA, `delete from storage.objects where name like '${office.a}/%' returning 1`)).length).toBeGreaterThan(0);
  });
});

describe('usage', () => {
  it('alleen beheerders lezen het gebruik; schrijven kan niet vanuit de browser', async () => {
    await db.exec(`insert into usage_events (kind, unique_key) values ('mail', 'k1')`);
    expect(await as(ids.agentA, `select 1 from usage_events`)).toHaveLength(0);
    expect(await as(ids.owner, `select 1 from usage_events`)).toHaveLength(1);
    await expect(as(ids.owner, `insert into usage_events (kind, unique_key) values ('mail', 'k2')`)).rejects.toThrow();
  });
});
