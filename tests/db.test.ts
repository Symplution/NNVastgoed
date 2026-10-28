import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { beforeAll, describe, expect, it } from 'vitest';

// Het databaseschema: wie mag wat (CLAUDE.md regel 4). Een verkoper-makelaar komt niet bij een collega-kantoor.
const root = join(__dirname, '../supabase');
let db: PGlite;
const ids = { owner: '', agentA: '', agentB: '', lezerA: '', nieuw: '', zoekerA: '', zoekerB: '' };
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
  ids.zoekerA = await mk('zoekerA@x.nl');   // nieuwe gebruikers zijn zoeker
  ids.zoekerB = await mk('zoekerB@x.nl');

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
  it('de eerste gebruiker wordt eigenaar, een nieuwe gebruiker is zoeker en zonder kantoor', async () => {
    const r = (await db.query<Row>(`select u.email, p.role, p.office_id from profiles p join auth.users u on u.id = p.id where u.email in ('owner@x.nl') `)).rows;
    expect(r[0].role).toBe('owner');
    const n = await db.query<{ id: string }>(`insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(),'authenticated','authenticated','nieuw@x.nl','',now(),'{}','{}',now(),now()) returning id`);
    ids.nieuw = n.rows[0].id;
    const p = (await db.query<Row>(`select role, office_id from profiles where id = '${ids.nieuw}'`)).rows[0];
    expect(p).toEqual({ role: 'seeker', office_id: null });
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

describe('video en logo', () => {
  const put = (u: string, bucket: string, o: string) => as(u, `insert into storage.objects (bucket_id, name) values ('${bucket}', '${o}/a.bin')`);
  it('een makelaar zet een video en een logo alleen in de map van het eigen kantoor', async () => {
    for (const bucket of ['listing-videos', 'office-logos']) {
      await put(ids.agentA, bucket, office.a);
      await expect(put(ids.agentA, bucket, office.b)).rejects.toThrow();
      await expect(put(ids.lezerA, bucket, office.a)).rejects.toThrow();
      await expect(as(null, `insert into storage.objects (bucket_id, name) values ('${bucket}', '${office.a}/b.bin')`)).rejects.toThrow();
      await expect(as(ids.zoekerA, `insert into storage.objects (bucket_id, name) values ('${bucket}', '${office.a}/b.bin')`)).rejects.toThrow();
      await expect(as(ids.agentA, `insert into storage.objects (bucket_id, name) values ('${bucket}', '${office.a}/c.bin')`, 'aal1')).rejects.toThrow();
      expect(await as(ids.agentB, `delete from storage.objects where bucket_id = '${bucket}' and name like '${office.a}/%' returning 1`)).toHaveLength(0);
    }
  });
  it('een video of logo moet een https-adres zijn, en de woning bewaart één video', async () => {
    expect(await as(ids.agentA, `update listings set video_url = 'https://x.nl/v.mp4' where id = '${listing.pubA}' returning 1`)).toHaveLength(1);
    await expect(as(ids.agentA, `update listings set video_url = 'javascript:alert(1)' where id = '${listing.pubA}'`)).rejects.toThrow();
    await expect(as(ids.agentA, `update offices set logo_url = 'http://x.nl/l.png' where id = '${office.a}'`)).rejects.toThrow();
    expect(await as(ids.agentA, `update listings set video_url = '/voorbeeld-video.mp4' where id = '${listing.pubA}' returning 1`)).toHaveLength(1);   // adres op de eigen site (testgegevens)
    await expect(as(ids.agentA, `update listings set video_url = '//evil.nl/v.mp4' where id = '${listing.pubA}'`)).rejects.toThrow();
    await as(ids.agentA, `update listings set video_url = 'https://x.nl/v.mp4' where id = '${listing.pubA}'`);
    expect(await as(ids.agentA, `update offices set logo_url = 'https://x.nl/l.png' where id = '${office.a}' returning 1`)).toHaveLength(1);
    expect(await as(ids.agentB, `update listings set video_url = 'https://x.nl/hack.mp4' where id = '${listing.pubA}' returning 1`)).toHaveLength(0);   // collega-kantoor
    expect((await as(null, `select video_url from listings where id = '${listing.pubA}'`))[0].video_url).toBe('https://x.nl/v.mp4');   // openbaar zichtbaar
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

// ───────────────────────── Zoekers, bezichtigingen, berichten ─────────────────────────
describe('aanbod: huur, nieuwbouw, bedrijfsruimte', () => {
  const ins = (extra: string) => `insert into listings (office_id, slug, status, street, house_number, postcode, city, province, asking_price, living_area, rooms, property_type${extra.split('|')[0]})
      values ('${office.a}', 'x-${Math.random().toString(36).slice(2)}', 'beschikbaar', 'x', '1', '9711 AA', 'Groningen', 'groningen', 1000, 80, 3, ${extra.split('|')[1]})`;
  it('huur heeft een prijs per maand en koop niet', async () => {
    await db.exec(ins(", offer, price_type|'appartement', 'huur', 'p.m.'"));
    await expect(db.exec(ins(", offer, price_type|'appartement', 'huur', 'k.k.'"))).rejects.toThrow();
    await expect(db.exec(ins(", offer, price_type|'appartement', 'koop', 'p.m.'"))).rejects.toThrow();
    await expect(db.exec(ins(", offer, price_type|'appartement', 'huur', 'p.m.'").replace(', 1000,', ', 5000000,'))).rejects.toThrow();
  });
  it('bedrijfsruimte heeft een bedrijfsruimtesoort', async () => {
    await db.exec(ins(", category|'kantoorruimte', 'bedrijfsruimte'"));
    await expect(db.exec(ins(", category|'kantoorruimte', 'woning'"))).rejects.toThrow();
    await expect(db.exec(ins(", category|'tussenwoning', 'bedrijfsruimte'"))).rejects.toThrow();
  });
  it('recreatie heeft een recreatiesoort, en een recreatiewoning is nooit een gewone woning', async () => {
    await db.exec(ins(", category|'chalet', 'recreatie'"));
    await db.exec(ins(", category|'stacaravan', 'recreatie'"));
    await expect(db.exec(ins(", category|'chalet', 'woning'"))).rejects.toThrow();
    await expect(db.exec(ins(", category|'tussenwoning', 'recreatie'"))).rejects.toThrow();
    await expect(db.exec(ins(", category|'kantoorruimte', 'recreatie'"))).rejects.toThrow();
    await expect(db.exec(ins(", category|'chalet', 'bedrijfsruimte'"))).rejects.toThrow();
    await expect(db.exec(ins(", category|'tent', 'recreatie'"))).rejects.toThrow();
  });
  it('alleen NNV-beheer zet het NVM-lidmaatschap van een kantoor', async () => {
    await expect(as(ids.agentA, `update offices set nvm_member = true where id = '${office.a}'`)).rejects.toThrow(/NVM/);
    await as(ids.owner, `update offices set nvm_member = true where id = '${office.a}'`);
    expect((await as(null, `select nvm_member from offices where id = '${office.a}'`))[0].nvm_member).toBe(true);
    await as(ids.agentA, `update offices set phone = '050 1' where id = '${office.a}'`);   // andere velden mag het kantoor zelf wijzigen
  });
});

describe('zoekers', () => {
  it('een zoeker is geen medewerker: geen leads, geen concepten, geen andermans profiel', async () => {
    expect(await as(ids.zoekerA, `select 1 from leads`)).toHaveLength(0);
    expect(await as(ids.zoekerA, `select 1 from listings where status = 'concept'`)).toHaveLength(0);
    expect(await as(ids.zoekerA, `select 1 from profiles`)).toHaveLength(1);
    expect((await as(ids.zoekerA, `select 1 from listings`)).length).toBeGreaterThan(0);   // het openbare aanbod wel
    expect(await as(ids.zoekerA, `select 1 from feed_connections`)).toHaveLength(0);
    await expect(as(ids.zoekerA, `update profiles set role = 'agent' where id = '${ids.zoekerA}'`)).rejects.toThrow(/eigenaar/);
    await expect(as(ids.zoekerA, `update profiles set office_id = '${office.a}' where id = '${ids.zoekerA}'`)).rejects.toThrow(/eigenaar/);
    expect(await as(ids.zoekerA, `update listings set asking_price = 1 returning 1`)).toHaveLength(0);
  });
  it('een zoeker werkt zonder tweede inlogstap aan zijn eigen gegevens', async () => {
    await as(ids.zoekerA, `update profiles set phone = '06 12345678' where id = '${ids.zoekerA}'`, 'aal1');
    expect((await as(ids.zoekerA, `select phone from profiles`, 'aal1'))[0].phone).toBe('06 12345678');
  });
  it('favorieten zijn privé', async () => {
    await as(ids.zoekerA, `insert into favorites (user_id, listing_id) values ('${ids.zoekerA}', '${listing.pubA}')`, 'aal1');
    expect(await as(ids.zoekerA, `select 1 from favorites`, 'aal1')).toHaveLength(1);
    expect(await as(ids.zoekerB, `select 1 from favorites`, 'aal1')).toHaveLength(0);
    expect(await as(ids.agentA, `select 1 from favorites`)).toHaveLength(0);
    await expect(as(ids.zoekerB, `insert into favorites (user_id, listing_id) values ('${ids.zoekerA}', '${listing.pubB}')`, 'aal1')).rejects.toThrow();
    expect(await as(ids.zoekerB, `delete from favorites returning 1`, 'aal1')).toHaveLength(0);
    await expect(as(null, `select 1 from favorites`)).rejects.toThrow(/permission denied/);
    await as(ids.zoekerA, `delete from favorites`, 'aal1');
  });
});

describe('bezichtigingen', () => {
  const slots = (u: string | null, l = listing.pubA) => as(u, `select slot_start::text as slot_start, slot_end::text as slot_end, free_places from viewing_slots('${l}', 21) order by slot_start`);
  const book = (u: string | null, at: string, l = listing.pubA, email = 'gast@x.nl') =>
    as(u, `select * from book_viewing('${l}', '${at}', 'Jan Gast', '${email}', '06 1', 'graag')`);
  let second: string;

  beforeAll(async () => {
    for (let d = 1; d <= 7; d++) await as(ids.agentA, `insert into viewing_rules (office_id, weekday, start_time, end_time, slot_minutes) values ('${office.a}', ${d}, '09:00', '12:00', 30)`);
    second = (await db.query<{ id: string }>(`insert into listings (office_id, slug, status, street, house_number, postcode, city, province, asking_price, living_area, rooms, property_type)
      values ('${office.a}', 'openbaar-a2', 'beschikbaar', 'tweede', '2', '9711 AA', 'Groningen', 'groningen', 300000, 100, 4, 'tussenwoning') returning id`)).rows[0].id;
  });

  it('de beschikbaarheid is van het eigen kantoor en vraagt de tweede stap', async () => {
    await expect(as(ids.agentB, `insert into viewing_rules (office_id, weekday, start_time, end_time) values ('${office.a}', 1, '09:00', '12:00')`)).rejects.toThrow();
    await expect(as(ids.agentA, `insert into viewing_rules (office_id, weekday, start_time, end_time) values ('${office.a}', 1, '09:00', '12:00')`, 'aal1')).rejects.toThrow();
    expect(await as(ids.agentB, `select 1 from viewing_rules`)).toHaveLength(0);
    expect(await as(ids.zoekerA, `select 1 from viewing_rules`)).toHaveLength(0);
    expect((await as(ids.agentA, `select 1 from viewing_rules`)).length).toBe(7);
    await expect(as(ids.agentA, `insert into viewing_rules (office_id, weekday, start_time, end_time, slot_minutes) values ('${office.a}', 1, '09:00', '09:10', 30)`)).rejects.toThrow();
  });
  it('een bezoeker ziet vrije momenten, in Nederlandse tijd en minimaal 6 uur vooruit', async () => {
    const r = await slots(null);
    expect(r.length).toBeGreaterThan(50);
    expect(r.every((x) => new Date(x.slot_start.replace(' ', 'T') + ':00').getTime() >= Date.now() + 6 * 3_600_000 - 1000)).toBe(true);
    const local = (await db.query<Row>(`select (slot_start at time zone 'Europe/Amsterdam')::time as t from viewing_slots('${listing.pubA}', 21) order by slot_start limit 6`)).rows.map((x) => x.t);
    expect(local.every((t: string) => ['09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00', '11:30:00'].includes(t))).toBe(true);
  });
  it('een concept of woning van een kantoor zonder regels heeft geen momenten', async () => {
    expect(await slots(null, listing.conceptA)).toHaveLength(0);
    expect(await slots(null, listing.pubB)).toHaveLength(0);
    await expect(book(null, (await slots(null))[0].slot_start, listing.conceptA)).rejects.toThrow(/bestaat niet|niet meer beschikbaar/);
  });
  it('inplannen is meteen bevestigd; een tweede keer hetzelfde moment kan niet', async () => {
    const first = (await slots(null))[0];
    const b = (await book(null, first.slot_start))[0];
    expect(b.out_token).toMatch(/^[0-9a-f-]{36}$/);
    expect((await slots(null)).some((x) => x.slot_start === first.slot_start)).toBe(false);
    await expect(book(ids.zoekerA, first.slot_start, listing.pubA, 'ander@x.nl')).rejects.toThrow(/niet meer beschikbaar/);
    // één makelaar (capaciteit 1): een andere woning van hetzelfde kantoor kan op dat moment ook niet
    await expect(book(null, first.slot_start, second, 'derde@x.nl')).rejects.toThrow(/niet meer beschikbaar/);
  });
  it('een moment dat niet bestaat kan niet worden geboekt, ook niet met een tijd die er net naast zit', async () => {
    const t = new Date((await db.query<Row>(`select (slot_start + interval '7 minutes') as t from viewing_slots('${listing.pubA}', 21) order by slot_start offset 3 limit 1`)).rows[0].t);
    await expect(book(null, t.toISOString())).rejects.toThrow(/niet meer beschikbaar/);
    await expect(book(null, '2020-01-01T09:00:00Z')).rejects.toThrow(/niet meer beschikbaar/);
  });
  it('gegevens worden gecontroleerd', async () => {
    const at = (await slots(null))[5].slot_start;
    await expect(as(null, `select * from book_viewing('${listing.pubA}', '${at}', 'J', 'geen-mail', null, null)`)).rejects.toThrow();
    await expect(as(null, `select * from book_viewing('${listing.pubA}', '${at}', 'Jan', 'jan@x.nl', null, null)`)).resolves.toHaveLength(1);
  });
  it('een zoeker ziet zijn eigen bezichtigingen; een gast, een andere zoeker en een ander kantoor niet', async () => {
    const at = (await slots(null))[6].slot_start;
    await book(ids.zoekerA, at, listing.pubA, 'zoekerA@x.nl');
    expect((await as(ids.zoekerA, `select name from viewings`, 'aal1')).length).toBe(1);
    expect(await as(ids.zoekerB, `select 1 from viewings`, 'aal1')).toHaveLength(0);
    await expect(as(null, `select 1 from viewings`)).rejects.toThrow(/permission denied/);
    expect((await as(ids.agentA, `select 1 from viewings`)).length).toBeGreaterThanOrEqual(3);
    expect(await as(ids.agentB, `select 1 from viewings`)).toHaveLength(0);
    expect(await as(ids.agentA, `select 1 from viewings`, 'aal1')).toHaveLength(0);
    expect((await as(ids.lezerA, `select 1 from viewings`)).length).toBeGreaterThanOrEqual(3);
  });
  it('de zoeker annuleert met de sleutel; het moment komt weer vrij; een tweede keer kan niet', async () => {
    const at = (await slots(null))[10].slot_start;
    const b = (await book(null, at, listing.pubA, 'weg@x.nl'))[0];
    expect((await as(null, `select status, address from get_viewing('${b.out_token}')`))[0]).toMatchObject({ status: 'bevestigd' });
    expect((await as(null, `select cancel_viewing('${b.out_token}') as ok`))[0].ok).toBe(true);
    expect((await as(null, `select cancel_viewing('${b.out_token}') as ok`))[0].ok).toBe(false);
    expect((await as(null, `select cancel_viewing(gen_random_uuid()) as ok`))[0].ok).toBe(false);
    expect((await slots(null)).some((x) => x.slot_start === at)).toBe(true);
    expect((await as(ids.agentA, `select cancelled_by from viewings where token = '${b.out_token}'`))[0].cancelled_by).toBe('zoeker');
  });
  it('het kantoor handelt af, maar past wie en wanneer niet aan', async () => {
    const id = (await as(ids.agentA, `select id from viewings where email = 'jan@x.nl'`))[0].id;
    await expect(as(ids.agentA, `update viewings set name = 'Piet' where id = '${id}'`)).rejects.toThrow(/niet worden aangepast/);
    await expect(as(ids.agentA, `update viewings set starts_at = starts_at + interval '1 day' where id = '${id}'`)).rejects.toThrow();
    expect(await as(ids.agentB, `update viewings set status = 'afgerond' where id = '${id}' returning 1`)).toHaveLength(0);
    expect(await as(ids.lezerA, `update viewings set status = 'afgerond' where id = '${id}' returning 1`)).toHaveLength(0);
    await as(ids.agentA, `update viewings set status = 'afgerond' where id = '${id}'`);
    await expect(as(ids.agentA, `update viewings set status = 'bevestigd' where id = '${id}'`)).rejects.toThrow(/al afgehandeld/);
  });
  it('geblokkeerde momenten verdwijnen, en een zoeker kan niets blokkeren', async () => {
    const r = await slots(null); const s = r[20];
    await as(ids.agentA, `insert into viewing_blocks (office_id, starts_at, ends_at, reason) values ('${office.a}', '${s.slot_start}', '${s.slot_end}', 'vakantie')`);
    expect((await slots(null)).some((x) => x.slot_start === s.slot_start)).toBe(false);
    await expect(book(null, s.slot_start)).rejects.toThrow(/niet meer beschikbaar/);
    await expect(as(ids.zoekerA, `insert into viewing_blocks (office_id, starts_at, ends_at) values ('${office.a}', now(), now() + interval '1 day')`)).rejects.toThrow();
  });
  it('de makelaar plant zelf een bezichtiging in, alleen bij eigen woningen', async () => {
    const r = await slots(null); const s = r[30];
    await as(ids.agentA, `insert into viewings (listing_id, office_id, name, email, starts_at, ends_at, source) values ('${listing.pubA}', '${office.a}', 'Telefoon', 't@x.nl', '${s.slot_start}', '${s.slot_end}', 'makelaar')`);
    await expect(as(ids.agentB, `insert into viewings (listing_id, office_id, name, email, starts_at, ends_at, source) values ('${listing.pubA}', '${office.a}', 'Nee', 'n@x.nl', now() + interval '2 days', now() + interval '2 days 1 hour', 'makelaar')`)).rejects.toThrow();
    await expect(as(ids.zoekerA, `insert into viewings (listing_id, office_id, name, email, starts_at, ends_at, source) values ('${listing.pubA}', '${office.a}', 'Nee', 'n@x.nl', now() + interval '2 days', now() + interval '2 days 1 hour', 'site')`, 'aal1')).rejects.toThrow();
  });
  it('een rem op misbruik: maximaal 5 aanvragen per uur per e-mailadres', async () => {
    const r = await slots(null);
    for (let i = 0; i < 5; i++) await book(null, r[40 + i].slot_start, listing.pubA, 'spam2@x.nl');
    await expect(book(null, r[46].slot_start, listing.pubA, 'spam2@x.nl')).rejects.toThrow(/Te veel|zes bezichtigingen/);
  });
});

describe('berichten', () => {
  let conv = '';
  it('een zoeker start een gesprek over een openbare woning, nooit over een concept', async () => {
    conv = (await as(ids.zoekerA, `insert into conversations (listing_id, office_id, seeker_id) values ('${listing.pubA}', '${office.b}', '${ids.zoekerB}') returning id`, 'aal1'))[0].id;
    const c = (await as(ids.zoekerA, `select office_id, seeker_id from conversations`, 'aal1'))[0];
    expect(c).toEqual({ office_id: office.a, seeker_id: ids.zoekerA });   // kantoor en zoeker komen uit de woning en de sessie, niet uit het formulier
    await expect(as(ids.zoekerA, `insert into conversations (listing_id, office_id, seeker_id) values ('${listing.conceptA}', '${office.a}', '${ids.zoekerA}')`, 'aal1')).rejects.toThrow(/niet beschikbaar/);
    await expect(as(ids.zoekerA, `insert into conversations (listing_id, office_id, seeker_id) values ('${listing.pubA}', '${office.a}', '${ids.zoekerA}')`, 'aal1')).rejects.toThrow();   // één gesprek per woning
    await expect(as(null, `insert into conversations (listing_id, office_id, seeker_id) values ('${listing.pubA}', '${office.a}', '${ids.zoekerA}')`)).rejects.toThrow();
  });
  it('alleen de zoeker en het kantoor lezen het gesprek', async () => {
    await as(ids.zoekerA, `insert into messages (conversation_id, sender, body) values ('${conv}', 'zoeker', 'Is de woning nog beschikbaar?')`, 'aal1');
    expect(await as(ids.zoekerA, `select 1 from messages`, 'aal1')).toHaveLength(1);
    expect(await as(ids.zoekerB, `select 1 from messages`, 'aal1')).toHaveLength(0);
    expect(await as(ids.zoekerB, `select 1 from conversations`, 'aal1')).toHaveLength(0);
    expect(await as(ids.agentB, `select 1 from messages`)).toHaveLength(0);
    expect(await as(ids.agentA, `select 1 from messages`)).toHaveLength(1);
    expect(await as(ids.lezerA, `select 1 from messages`)).toHaveLength(1);
    expect(await as(ids.agentA, `select 1 from messages`, 'aal1')).toHaveLength(0);   // zonder tweede stap ziet de makelaar niets
  });
  it('niemand schrijft in andermans gesprek of onder een andere rol', async () => {
    await expect(as(ids.zoekerB, `insert into messages (conversation_id, sender, body) values ('${conv}', 'zoeker', 'Hoi')`, 'aal1')).rejects.toThrow();
    await expect(as(ids.zoekerA, `insert into messages (conversation_id, sender, body) values ('${conv}', 'makelaar', 'Ik ben de makelaar')`, 'aal1')).rejects.toThrow();
    await expect(as(ids.agentB, `insert into messages (conversation_id, sender, body) values ('${conv}', 'makelaar', 'Hoi')`)).rejects.toThrow();
    await expect(as(ids.lezerA, `insert into messages (conversation_id, sender, body) values ('${conv}', 'makelaar', 'Hoi')`)).rejects.toThrow();
    await expect(as(ids.agentA, `insert into messages (conversation_id, sender, body) values ('${conv}', 'makelaar', 'Hoi')`, 'aal1')).rejects.toThrow();
    await expect(as(null, `insert into messages (conversation_id, sender, body) values ('${conv}', 'zoeker', 'Hoi')`)).rejects.toThrow();
  });
  it('de makelaar antwoordt; de afzender komt uit de sessie, niet uit het bericht', async () => {
    await as(ids.agentA, `insert into messages (conversation_id, sender, sender_id, body) values ('${conv}', 'makelaar', '${ids.zoekerA}', 'Ja, kom gerust langs.')`);
    const m = await as(ids.zoekerA, `select sender, sender_id from messages order by created_at`, 'aal1');
    expect(m.map((x) => x.sender)).toEqual(['zoeker', 'makelaar']);
    expect(m[1].sender_id).toBe(ids.agentA);
  });
  it('gelezen markeren kan alleen voor wat de ander schreef, en niets anders aanpassen', async () => {
    expect(await as(ids.zoekerA, `update messages set read_at = now() where sender = 'zoeker' returning 1`, 'aal1')).toHaveLength(0);
    expect(await as(ids.zoekerA, `update messages set read_at = now() where sender = 'makelaar' returning 1`, 'aal1')).toHaveLength(1);
    expect(await as(ids.agentA, `update messages set read_at = now() where sender = 'zoeker' returning 1`)).toHaveLength(1);
    expect(await as(ids.zoekerB, `update messages set read_at = now() returning 1`, 'aal1')).toHaveLength(0);
    await expect(as(ids.zoekerA, `update messages set body = 'aangepast' where sender = 'zoeker'`, 'aal1')).rejects.toThrow(/permission denied/);
  });
  it('de volgorde van gesprekken volgt het laatste bericht', async () => {
    const c = (await as(ids.agentA, `select last_message_at from conversations`))[0];
    const newest = (await as(ids.agentA, `select max(created_at) as t from messages`))[0].t;
    expect(new Date(c.last_message_at).getTime()).toBeGreaterThanOrEqual(new Date(newest).getTime() - 5000);
  });
});

describe('contactgegevens van zoekers', () => {
  it('een kantoor ziet de gegevens van zoekers die hem schreven, een ander kantoor of een zoeker niet', async () => {
    const r = await as(ids.agentA, `select full_name, email from conversation_contacts()`);
    expect(r).toHaveLength(1);
    expect(r[0].email).toBe('zoekerA@x.nl');
    expect(await as(ids.agentB, `select 1 from conversation_contacts()`)).toHaveLength(0);
    expect(await as(ids.zoekerB, `select 1 from conversation_contacts()`, 'aal1')).toHaveLength(0);
    expect(await as(ids.agentA, `select 1 from conversation_contacts()`, 'aal1')).toHaveLength(0);
    await expect(as(null, `select 1 from conversation_contacts()`)).rejects.toThrow(/permission denied/);
  });
  it('een makelaar kan de zoekers zelf niet opvragen', async () => {
    expect(await as(ids.agentA, `select 1 from profiles where id = '${ids.zoekerA}'`)).toHaveLength(0);
  });
});

describe('kaartlocaties', () => {
  let conn = '';
  const item = (ext: string, extra: Row = {}) => ({
    slug: `kaart-${ext.toLowerCase()}`, external_id: ext, status: 'beschikbaar', offer: 'koop', category: 'woning', new_build: false, street: 'Dorpsstraat', house_number: '5', postcode: '8601 AA', city: 'Sneek',
    province: 'friesland', asking_price: 250000, price_type: 'k.k.', living_area: 90, rooms: 4, bedrooms: 2, bathrooms: 1, property_type: 'tussenwoning', features: [], photos: [], ...extra,
  });
  const ingest = (secret: string, items: unknown[]) => as(null, `select public.ingest_listings('${conn}', '${hash(secret)}', '${JSON.stringify(items)}'::jsonb) as r`);
  beforeAll(async () => {
    conn = (await as(ids.agentB, `insert into feed_connections (office_id, name, secret_hash) values ('${office.b}', 'Kaart', '${hash('kaartsleutel')}') returning id`))[0].id;
  });
  it('een koppeling zonder coördinaten laat de bestaande locatie staan', async () => {
    await ingest('kaartsleutel', [item('K1', { lat: 53.0329, lng: 5.6573 }), item('K2')]);
    await ingest('kaartsleutel', [item('K1', { asking_price: 245000 }), item('K2')]);
    const r = (await db.query<Row>(`select external_id, lat, asking_price from listings where external_id in ('K1', 'K2') order by external_id`)).rows;
    expect(r).toEqual([{ external_id: 'K1', lat: 53.0329, asking_price: 245000 }, { external_id: 'K2', lat: null, asking_price: 250000 }]);
  });
  it('de server vraagt de woningen zonder locatie op en zet de locatie erbij, met de sleutel van de koppeling', async () => {
    const todo = await as(null, `select listing_id, postcode, house_number from feed_listings_without_geo('${conn}', '${hash('kaartsleutel')}')`);
    expect(todo.map((x) => x.house_number)).toEqual(['5']);
    const id = todo[0].listing_id;
    expect((await as(null, `select feed_set_geo('${conn}', '${hash('kaartsleutel')}', '[{"id":"${id}","lat":53.03,"lng":5.66}]') as n`))[0].n).toBe(1);
    expect((await as(null, `select feed_set_geo('${conn}', '${hash('kaartsleutel')}', '[{"id":"${id}","lat":52.5,"lng":6.5}]') as n`))[0].n).toBe(0);   // een bestaande locatie wordt niet overschreven
    expect(await as(null, `select 1 from feed_listings_without_geo('${conn}', '${hash('kaartsleutel')}')`)).toHaveLength(0);
  });
  it('met een verkeerde sleutel gebeurt er niets, en een andere koppeling raakt deze woningen niet', async () => {
    await expect(as(null, `select * from feed_listings_without_geo('${conn}', '${hash('fout')}')`)).rejects.toThrow(/Ongeldige/);
    await expect(as(null, `select feed_set_geo('${conn}', '${hash('fout')}', '[]')`)).rejects.toThrow(/Ongeldige/);
    const other = (await as(ids.agentA, `insert into feed_connections (office_id, name, secret_hash) values ('${office.a}', 'Andere', '${hash('anders')}') returning id`))[0].id;
    const id = (await db.query<Row>(`select id from listings where external_id = 'K2'`)).rows[0].id;
    await db.exec(`update listings set lat = null, lng = null where id = '${id}'`);
    expect((await as(null, `select feed_set_geo('${other}', '${hash('anders')}', '[{"id":"${id}","lat":53.1,"lng":5.7}]') as n`))[0].n).toBe(0);
    await expect(as(null, `select feed_set_geo('${conn}', '${hash('kaartsleutel')}', '[{"id":"${id}","lat":10,"lng":5.7}]')`)).rejects.toThrow();   // buiten Noord-Nederland
  });
});


describe('aanmeldingen van makelaars', () => {
  const req = (email = 'info@nieuwkantoor.nl', consent = true) => `insert into broker_requests (office_name, city, province, contact_name, email, consent) values ('Nieuw Kantoor', 'Emmen', 'drenthe', 'Eva', '${email}', ${consent})`;
  it('iedereen kan zich aanmelden, maar niemand buiten het beheer leest mee', async () => {
    await as(null, req());
    await expect(as(null, `select 1 from broker_requests`)).rejects.toThrow(/permission denied/);
    expect(await as(ids.zoekerA, `select 1 from broker_requests`)).toHaveLength(0);
    expect(await as(ids.agentA, `select 1 from broker_requests`)).toHaveLength(0);   // een makelaar is geen beheerder
    expect(await as(ids.owner, `select 1 from broker_requests`, 'aal1')).toHaveLength(0);
    expect((await as(ids.owner, `select 1 from broker_requests`)).length).toBeGreaterThan(0);
  });
  it('alleen een beheerder wijzigt de status; de status bij aanmelden is altijd "nieuw"', async () => {
    await as(null, `insert into broker_requests (office_name, city, province, contact_name, email, consent, status) values ('X Makelaars', 'Assen', 'drenthe', 'Jan', 'jan@x.nl', true, 'aangesloten')`);
    expect((await as(ids.owner, `select status from broker_requests where email = 'jan@x.nl'`))[0].status).toBe('nieuw');
    expect(await as(ids.agentA, `update broker_requests set status = 'afgewezen' returning 1`)).toHaveLength(0);
    expect(await as(ids.owner, `update broker_requests set status = 'in_behandeling' where email = 'jan@x.nl' returning 1`)).toHaveLength(1);
    await expect(as(ids.owner, `update broker_requests set email = 'ander@x.nl' returning 1`)).rejects.toThrow(/permission denied/);
  });
  it('akkoord is verplicht en er geldt een rem per e-mailadres', async () => {
    await expect(as(null, req('zonder@x.nl', false))).rejects.toThrow();
    await as(null, req('spam@x.nl')); await as(null, req('spam@x.nl')); await as(null, req('spam@x.nl'));
    await expect(as(null, req('spam@x.nl'))).rejects.toThrow(/Te veel/);
  });
});

describe('plattegronden en 360°-foto’s', () => {
  it('zijn lijsten, en alleen het eigen kantoor wijzigt ze', async () => {
    expect(await as(ids.agentA, `update listings set floorplans = '[{"url":"https://x.nl/p.jpg"}]', photos_360 = '[{"url":"https://x.nl/360.jpg"}]' where id = '${listing.pubA}' returning 1`)).toHaveLength(1);
    await expect(as(ids.agentA, `update listings set floorplans = '{"url":"https://x.nl"}' where id = '${listing.pubA}'`)).rejects.toThrow();
    expect(await as(ids.agentB, `update listings set floorplans = '[]' where id = '${listing.pubA}' returning 1`)).toHaveLength(0);
    const r = await as(null, `select floorplans, photos_360 from listings where id = '${listing.pubA}'`);
    expect(r[0].floorplans).toHaveLength(1);
    expect(r[0].photos_360).toHaveLength(1);
  });
});

describe('statistieken per woning', () => {
  const track = (kind: string, id: string) => `select public.track_listings('${kind}', array['${id}']::uuid[])`;
  it('een bezoeker telt een weergave, maar alleen voor een woning die online staat', async () => {
    await as(null, track('view', listing.pubA)); await as(null, track('view', listing.pubA)); await as(null, track('impression', listing.pubA)); await as(null, track('brochure', listing.pubA));
    await as(null, track('view', listing.conceptA));
    const r = await as(ids.agentA, `select impressions, views, brochures from listing_stats_daily where listing_id = '${listing.pubA}'`);
    expect(r).toEqual([{ impressions: 1, views: 2, brochures: 1 }]);
    expect(await as(ids.agentA, `select 1 from listing_stats_daily where listing_id = '${listing.conceptA}'`)).toHaveLength(0);
    await expect(as(null, track('klik', listing.pubA))).rejects.toThrow(/Onbekende soort/);
  });
  it('alleen het eigen kantoor leest de cijfers, na de tweede inlogstap; een bezoeker, zoeker en collega-kantoor niet', async () => {
    await expect(as(null, `select 1 from listing_stats_daily`)).rejects.toThrow(/permission denied/);
    expect(await as(ids.zoekerA, `select 1 from listing_stats_daily`)).toHaveLength(0);
    expect(await as(ids.agentB, `select 1 from listing_stats_daily where listing_id = '${listing.pubA}'`)).toHaveLength(0);
    expect(await as(ids.agentA, `select 1 from listing_stats_daily where listing_id = '${listing.pubA}'`, 'aal1')).toHaveLength(0);
    expect(await as(ids.lezerA, `select 1 from listing_stats_daily where listing_id = '${listing.pubA}'`)).toHaveLength(1);
    expect(await as(ids.owner, `select 1 from listing_stats_daily where listing_id = '${listing.pubA}'`)).toHaveLength(1);
  });
  it('niemand schrijft de cijfers zelf, ook geen makelaar', async () => {
    await expect(as(ids.agentA, `update listing_stats_daily set views = 9999 where listing_id = '${listing.pubA}'`)).rejects.toThrow(/permission denied/);
    await expect(as(ids.agentA, `insert into listing_stats_daily (listing_id, office_id) values ('${listing.pubA}', '${office.a}')`)).rejects.toThrow(/permission denied/);
    await expect(as(ids.agentA, `delete from listing_stats_daily`)).rejects.toThrow(/permission denied/);
  });
  it('een hartje telt als bewaard, en de totalen zijn per kantoor', async () => {
    const before = Number((await as(ids.agentA, `select saves from public.listing_stats_totals(30) where listing_id = '${listing.pubA}'`))[0].saves);
    await as(ids.zoekerB, `insert into favorites (user_id, listing_id) values ('${ids.zoekerB}', '${listing.pubA}')`);
    await as(null, track('view', listing.pubB));
    const a = await as(ids.agentA, `select * from public.listing_stats_totals(30)`);
    expect(a).toHaveLength(1);
    expect(a[0]).toMatchObject({ listing_id: listing.pubA, views: 2, saves: before + 1 });
    expect((await as(ids.agentB, `select * from public.listing_stats_totals(null)`)).map((x) => x.listing_id)).toEqual([listing.pubB]);
  });
});

describe('topper van de maand', () => {
  it('een makelaar kan een topper alleen aanvragen; een beheerder activeert', async () => {
    expect(await as(ids.agentA, `update listings set topper_requested_at = now(), topper_until = current_date + 30 where id = '${listing.pubA}' returning topper_requested_at`)).toHaveLength(1);
    expect((await db.query<Row>(`select topper_until, topper_requested_at is not null as aangevraagd from listings where id = '${listing.pubA}'`)).rows[0]).toEqual({ topper_until: null, aangevraagd: true });
    expect(await as(ids.owner, `update listings set topper_until = current_date + 30 where id = '${listing.pubA}' returning 1`)).toHaveLength(1);
    expect(await as(null, `select 1 from listings where topper_until >= current_date`)).toHaveLength(1);
  });
  it('een nieuwe woning van een makelaar begint nooit als topper', async () => {
    const r = await as(ids.agentA, `insert into listings (office_id, slug, status, street, house_number, postcode, city, province, asking_price, living_area, rooms, property_type, topper_until)
      values ('${office.a}', 'zelf-topper', 'concept', 'x', '1', '9711 AA', 'Groningen', 'groningen', 1, 1, 1, 'overig', current_date + 30) returning topper_until`);
    expect(r[0].topper_until).toBeNull();
  });
});

describe('eigen kantoor kiezen', () => {
  const kies = (o: string | null) => `select public.set_my_office(${o ? `'${o}'` : 'null'})`;
  it('eigenaar en beheerder koppelen hun eigen account aan een kantoor, en kunnen dat weer loslaten', async () => {
    await as(ids.owner, kies(office.a));
    expect((await db.query<Row>(`select office_id from profiles where id = '${ids.owner}'`)).rows[0].office_id).toBe(office.a);
    await as(ids.nieuw, kies(office.b));   // is eerder in deze test een beheerder geworden
    expect((await db.query<Row>(`select office_id from profiles where id = '${ids.nieuw}'`)).rows[0].office_id).toBe(office.b);
    await as(ids.owner, kies(null)); await as(ids.nieuw, kies(null));
    expect((await db.query<Row>(`select office_id from profiles where id in ('${ids.owner}', '${ids.nieuw}')`)).rows.every((r) => r.office_id === null)).toBe(true);
  });
  it('een makelaar, alleen-lezen, zoeker of iemand zonder tweede stap kan dit niet', async () => {
    await expect(as(ids.agentA, kies(office.b))).rejects.toThrow(/eigenaar of een beheerder/);
    await expect(as(ids.lezerA, kies(office.b))).rejects.toThrow(/eigenaar of een beheerder/);
    await expect(as(ids.zoekerA, kies(office.b))).rejects.toThrow(/eigenaar of een beheerder/);
    await expect(as(ids.owner, kies(office.b), 'aal1')).rejects.toThrow(/eigenaar of een beheerder/);
    await expect(as(null, kies(office.b))).rejects.toThrow();
  });
  it('een kantoor dat niet bestaat wordt geweigerd, en de rechtstreekse route blijft dicht voor een beheerder', async () => {
    await expect(as(ids.owner, kies('00000000-0000-4000-8000-000000000000'))).rejects.toThrow(/bestaat niet/);
    await expect(as(ids.nieuw, `update profiles set office_id = '${office.a}' where id = '${ids.nieuw}'`)).rejects.toThrow(/eigenaar/);
  });
});

describe('kantoor aanmaken uit een aanmelding', () => {
  it('de eigenaar maakt het kantoor aan met de gegevens van de aanvraag en zet hem op aangesloten; een makelaar kan dat niet', async () => {
    await as(null, `insert into broker_requests (office_name, city, province, contact_name, email, phone, consent) values ('Nieuw Makelaars', 'Emmen', 'drenthe', 'Eva', 'eva@nieuw.nl', '0591 000000', true)`);
    const req = (await as(ids.owner, `select office_name, city, province, email, phone, id from broker_requests where office_name = 'Nieuw Makelaars'`))[0];
    await expect(as(ids.agentA, `insert into offices (slug, name, city, province, email, nvm_member) values ('nieuw-makelaars', 'Nieuw Makelaars', 'Emmen', 'drenthe', 'eva@nieuw.nl', false)`)).rejects.toThrow();
    expect(await as(ids.owner, `insert into offices (slug, name, city, province, email, phone, description, nvm_member) values ('nieuw-makelaars', '${req.office_name}', '${req.city}', '${req.province}', '${req.email}', '${req.phone}', '', false) returning slug`)).toHaveLength(1);
    expect(await as(ids.owner, `update broker_requests set status = 'aangesloten' where id = '${req.id}' returning 1`)).toHaveLength(1);
    expect((await as(null, `select nvm_member from offices where slug = 'nieuw-makelaars'`))[0].nvm_member).toBe(false);
  });
});

describe('banner van een kantoor', () => {
  it('het eigen kantoor zet een banner, een collega-kantoor of zoeker niet, en alleen een https-adres kan', async () => {
    const url = `https://x.supabase.co/storage/v1/object/public/office-logos/${office.a}/banner-1.jpg`;
    expect(await as(ids.agentA, `update offices set banner_url = '${url}' where id = '${office.a}' returning 1`)).toHaveLength(1);
    expect(await as(ids.agentB, `update offices set banner_url = 'https://x.nl/b.jpg' where id = '${office.a}' returning 1`)).toHaveLength(0);
    expect(await as(ids.zoekerA, `update offices set banner_url = 'https://x.nl/b.jpg' where id = '${office.a}' returning 1`)).toHaveLength(0);
    await expect(as(ids.agentA, `update offices set banner_url = 'http://x.nl/b.jpg' where id = '${office.a}'`)).rejects.toThrow();
    await expect(as(ids.agentA, `update offices set banner_url = 'javascript:alert(1)' where id = '${office.a}'`)).rejects.toThrow();
    expect((await as(null, `select banner_url from offices where id = '${office.a}'`))[0].banner_url).toBe(url);
  });
});

describe('één account per kantoor', () => {
  it('een kantoor krijgt hoogstens één makelaarsaccount; alleen-lezen collega’s en NNV-beheer tellen niet mee', async () => {
    // kantoor A heeft al een makelaar (agentA); een tweede makelaar bij A mag niet
    await expect(db.exec(`update profiles set role = 'agent' where id = '${ids.lezerA}'`)).rejects.toThrow(/unique|duplicate/i);
    // een andere kantoor-makelaar kan wel (B heeft agentB), en na verplaatsen van B naar A niet
    await expect(db.exec(`update profiles set office_id = '${office.a}' where id = '${ids.agentB}'`)).rejects.toThrow(/unique|duplicate/i);
    // alleen-lezen en eigenaar/beheerder bij een kantoor mogen wel
    await db.exec(`update profiles set office_id = '${office.a}' where id = '${ids.owner}'`);
    await db.exec(`update profiles set office_id = null where id = '${ids.owner}'`);
  });
});
