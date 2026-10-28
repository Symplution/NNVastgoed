import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Het aanbod van Unistee Makelaars (supabase/seed/unistee.sql) moet op het echte schema lopen en herhaalbaar zijn.
const root = join(__dirname, '../supabase');
describe('aanbod van Unistee Makelaars', () => {
  it('zet het kantoor en tien woningen neer, ook twee keer achter elkaar, en bezoekers zien ze', async () => {
    const db = new PGlite();
    await db.exec(`create schema auth;
      create table auth.users (instance_id uuid, id uuid primary key, aud text, role text, email text, encrypted_password text, email_confirmed_at timestamptz, raw_app_meta_data jsonb, raw_user_meta_data jsonb, created_at timestamptz, updated_at timestamptz);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb) $$;
      create role authenticated; create role anon; grant usage on schema auth to authenticated, anon;
      create schema storage;
      create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
      create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
      alter table storage.objects enable row level security;
      grant usage on schema storage to authenticated, anon; grant select, insert, update, delete on storage.objects to authenticated;`);
    for (const f of readdirSync(join(root, 'migrations')).sort()) await db.exec(readFileSync(join(root, 'migrations', f), 'utf8'));
    const sql = readFileSync(join(root, 'seed/unistee.sql'), 'utf8');
    await db.exec(sql);
    await db.exec(sql);
    const q = async (s: string) => (await db.query<Record<string, any>>(s)).rows;
    expect(await q(`select count(*)::int n from offices where slug = 'unistee-makelaars'`)).toEqual([{ n: 1 }]);
    expect(await q(`select status, count(*)::int n from listings group by status order by status`)).toEqual([{ status: 'beschikbaar', n: 8 }, { status: 'onder_bod', n: 1 }, { status: 'verkocht', n: 1 }]);
    expect((await q(`select count(*)::int n from listings where jsonb_array_length(photos) >= 10 and description <> '' and asking_price > 0 and lat is not null`))[0].n).toBe(10);
    expect((await q(`select count(*)::int n from listings where postcode !~ '^[1-9][0-9]{3} [A-Z]{2}$'`))[0].n).toBe(0);
    await db.exec(`set role anon`);
    expect((await q(`select count(*)::int n from listings`))[0].n).toBe(10);
    await db.exec(`reset role`);
    // een koppeling erbij en een woning van een ander kantoor, dan alles van Unistee verwijderen
    const o = (await q(`select id from offices where slug = 'unistee-makelaars'`))[0].id;
    await db.exec(`insert into feed_connections (office_id, name, kind, secret_hash) values ('${o}', 'Realworks', 'json', 'x')`);
    await db.exec(`insert into offices (slug, name, city, province, email) values ('ander', 'Ander', 'Assen', 'drenthe', 'a@x.nl')`);
    await db.exec(`insert into listings (office_id, slug, status, street, house_number, postcode, city, province, asking_price, living_area, rooms, property_type) values ((select id from offices where slug = 'ander'), 'ander-1', 'beschikbaar', 'x', '1', '9401 AA', 'Assen', 'drenthe', 1, 1, 1, 'overig')`);
    const cleanup = readFileSync(join(root, 'seed/unistee_verwijderen.sql'), 'utf8');
    await db.exec(cleanup); await db.exec(cleanup);   // herhaalbaar
    expect((await q(`select count(*)::int n from listings where office_id = '${o}'`))[0].n).toBe(0);
    expect((await q(`select count(*)::int n from feed_connections where office_id = '${o}'`))[0].n).toBe(0);
    expect((await q(`select count(*)::int n from offices where slug = 'unistee-makelaars'`))[0].n).toBe(1);
    expect((await q(`select count(*)::int n from listings where slug = 'ander-1'`))[0].n).toBe(1);
  }, 60_000);
});
