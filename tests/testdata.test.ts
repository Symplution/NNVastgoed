import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

// De testgegevens (supabase/seed/testdata.sql) moeten op een echt schema lopen, herhaalbaar zijn en netjes op te ruimen.
const root = join(__dirname, '../supabase');
let db: PGlite;
const count = async (sql: string) => Number((await db.query<{ n: string }>(sql)).rows[0].n);

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create schema auth;
    create table auth.users (instance_id uuid, id uuid primary key, aud text, role text, email text, encrypted_password text,
      email_confirmed_at timestamptz, recovery_sent_at timestamptz, last_sign_in_at timestamptz, raw_app_meta_data jsonb, raw_user_meta_data jsonb,
      created_at timestamptz, updated_at timestamptz, confirmation_token text, email_change text, email_change_token_new text, recovery_token text);
    create table auth.identities (id uuid primary key, user_id uuid references auth.users(id) on delete cascade, provider_id text, identity_data jsonb, provider text,
      last_sign_in_at timestamptz, created_at timestamptz, updated_at timestamptz);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb) $$;
    create function public.crypt(p text, s text) returns text language sql as $$ select 'x' || p $$;
    create function public.gen_salt(t text) returns text language sql as $$ select 'salt' $$;
    create role authenticated; create role anon; grant usage on schema auth to authenticated, anon;
    create schema storage;
    create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
    alter table storage.objects enable row level security;
    grant usage on schema storage to authenticated, anon; grant select, insert, update, delete on storage.objects to authenticated;`);
  for (const f of readdirSync(join(root, 'migrations')).sort()) await db.exec(readFileSync(join(root, 'migrations', f), 'utf8'));
  await db.exec(`insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
    values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(),'authenticated','authenticated','eigenaar@echt.nl','',now(),'{}','{}',now(),now())`);
});

describe('testgegevens', () => {
  const seed = () => readFileSync(join(root, 'seed/testdata.sql'), 'utf8');
  it('lopen op het echte schema, ook twee keer achter elkaar', async () => {
    await db.exec(seed());
    await db.exec(seed());
    expect(await count(`select count(*) n from listings`)).toBe(75);
    expect(await count(`select count(*) n from listings where jsonb_array_length(photos) >= 3`)).toBe(75);
    expect(await count(`select count(*) n from offices`)).toBe(6);
    expect(await count(`select count(*) n from leads`)).toBe(27);
    expect(await count(`select count(*) n from viewings`)).toBe(28);
    expect(await count(`select count(*) n from messages`)).toBe(26);
    expect(await count(`select count(*) n from favorites`)).toBe(23);
    expect(await count(`select count(*) n from auth.users where email like '%@nnv.test'`)).toBe(13);
  });
  it('heeft logo’s, video’s, plattegronden en 360°-foto’s', async () => {
    expect(await count(`select count(*) n from offices where logo_url like '/api/logo/%'`)).toBe(6);
    expect(await count(`select count(*) n from listings where video_url = '/voorbeeld-video.mp4'`)).toBeGreaterThan(8);
    expect(await count(`select count(*) n from listings where jsonb_array_length(floorplans) = 1`)).toBeGreaterThan(60);
    expect(await count(`select count(*) n from listings where jsonb_array_length(photos_360) = 1`)).toBeGreaterThan(10);
  });
  it('vult ook aanmeldingen, koppelingen en gebruik', async () => {
    expect(await count(`select count(*) n from broker_requests where email like '%@nnv.test'`)).toBe(6);
    expect(await count(`select count(distinct status) n from broker_requests`)).toBe(4);
    expect(await count(`select count(*) n from feed_connections`)).toBe(4);
    expect(await count(`select count(*) n from feed_runs`)).toBe(12);
    expect(await count(`select count(*) n from feed_runs where rejected > 0`)).toBeGreaterThanOrEqual(1);
    expect(await count(`select count(*) n from usage_events where unique_key like 'testdata:%'`)).toBe(14);
    expect(await count(`select count(*) n from conversations`)).toBe(8);
    expect(await count(`select count(*) n from saved_searches`)).toBe(6);
    expect(await count(`select count(*) n from leads where listing_id is null or office_id is null`)).toBe(0);
    expect(await count(`select count(*) n from viewings where listing_id is null`)).toBe(0);
    expect(await count(`select count(*) n from favorites where listing_id is null`)).toBe(0);
  });
  it('geeft de testaccounts de juiste rol, en laat de eigenaar met rust', async () => {
    const r = await db.query<{ email: string; role: string; office: string | null }>(`select u.email, p.role, o.slug office from profiles p join auth.users u on u.id = p.id left join offices o on o.id = p.office_id`);
    const by = Object.fromEntries(r.rows.map((x) => [x.email, x]));
    expect(by['eigenaar@echt.nl'].role).toBe('owner');
    expect(by['anna@nnv.test'].role).toBe('seeker');
    expect(by['makelaar.groningen@nnv.test'].role).toBe('agent');
    expect(by['lezer.drenthe@nnv.test'].role).toBe('readonly');
    expect(by['beheer@nnv.test'].role).toBe('admin');
    expect(by['makelaar.hogeland@nnv.test'].office).toBe('hogeland-wonen');
    expect(by['lars@nnv.test'].role).toBe('seeker');
  });
  it('heeft zichtbare woningen, toekomstige én voorbije bezichtigingen', async () => {
    expect(await count(`select count(*) n from listings where status = 'beschikbaar'`)).toBeGreaterThan(30);
    expect(await count(`select count(*) n from viewings where starts_at > now() and status = 'bevestigd'`)).toBeGreaterThanOrEqual(9);
    expect(await count(`select count(*) n from viewings where starts_at < now()`)).toBeGreaterThanOrEqual(4);
  });
  it('voegt met testdata_recreatie.sql alleen recreatiewoningen toe, ook twee keer achter elkaar', async () => {
    const before = await count(`select count(*) n from listings where category = 'recreatie'`);
    expect(before).toBeGreaterThanOrEqual(15);
    await db.exec(`delete from listings where category = 'recreatie'`);
    const sql = readFileSync(join(root, 'seed/testdata_recreatie.sql'), 'utf8');
    await db.exec(sql);
    await db.exec(sql);
    expect(await count(`select count(*) n from listings where category = 'recreatie'`)).toBe(before);
    expect(await count(`select count(*) n from listings where category = 'recreatie' and property_type in ('recreatiewoning','vakantiebungalow','chalet','stacaravan')`)).toBe(before);
    expect(await count(`select count(*) n from listings where category = 'recreatie' and offer = 'huur'`)).toBeGreaterThanOrEqual(1);
    await db.exec(readFileSync(join(root, 'seed/testdata.sql'), 'utf8'));   // daarna het hele bestand: geen dubbele woningen
    expect(await count(`select count(*) n from listings where category = 'recreatie'`)).toBe(before);
  });
  it('ruimt ook losse recreatiewoningen bij een eigen kantoor op, en laat eigen gegevens staan', async () => {
    await db.exec(readFileSync(join(root, 'seed/testdata_verwijderen.sql'), 'utf8'));
    await db.exec(`insert into offices (slug, name, city, province, email) values ('eigen-kantoor', 'Eigen Kantoor', 'Assen', 'drenthe', 'eigen@echt.nl')`);
    await db.exec(`insert into listings (office_id, slug, status, street, house_number, postcode, city, province, asking_price, living_area, rooms, property_type, category) select id, 'eigen-woning', 'beschikbaar', 'Straat', '1', '9401 AA', 'Assen', 'drenthe', 100000, 80, 3, 'tussenwoning', 'woning' from offices where slug = 'eigen-kantoor'`);
    await db.exec(readFileSync(join(root, 'seed/testdata_recreatie.sql'), 'utf8'));
    expect(await count(`select count(*) n from listings where category = 'recreatie'`)).toBeGreaterThanOrEqual(15);   // bij het eigen kantoor
    await db.exec(readFileSync(join(root, 'seed/testdata_verwijderen.sql'), 'utf8'));
    expect(await count(`select count(*) n from listings where category = 'recreatie'`)).toBe(0);
    expect(await count(`select count(*) n from listings where slug = 'eigen-woning'`)).toBe(1);
    expect(await count(`select count(*) n from offices where slug = 'eigen-kantoor'`)).toBe(1);
    await db.exec(`delete from offices where slug = 'eigen-kantoor'`);   // het eigen kantoor van deze test
    await db.exec(readFileSync(join(root, 'seed/testdata.sql'), 'utf8'));   // zodat de volgende test weer iets heeft om op te ruimen
  });
  it('ruimt alles op met testdata_verwijderen.sql', async () => {
    await db.exec(readFileSync(join(root, 'seed/testdata_verwijderen.sql'), 'utf8'));
    expect(await count(`select count(*) n from listings`)).toBe(0);
    expect(await count(`select count(*) n from offices`)).toBe(0);
    expect(await count(`select count(*) n from auth.users`)).toBe(1);
    expect(await count(`select count(*) n from profiles`)).toBe(1);
  });
});
