import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Het bundelbestand (0008 t/m 0012 in één keer) moet op een database met 0001 t/m 0007 werken, en daarna nog eens kunnen.
const root = join(__dirname, '../supabase');
describe('bundel 0008 t/m 0012', () => {
  it('draait op een database met 0001 t/m 0007, en een tweede keer zonder fout', async () => {
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
    for (const f of readdirSync(join(root, 'migrations')).sort().filter((x) => x < '0008')) await db.exec(readFileSync(join(root, 'migrations', f), 'utf8'));
    const bundle = readFileSync(join(root, 'bundels/0008_t_m_0012.sql'), 'utf8');
    await db.exec(bundle);
    await db.exec(bundle);
    const cols = (await db.query<{ column_name: string }>(`select column_name from information_schema.columns where table_name = 'listings' and column_name in ('video_url', 'floorplans', 'photos_360')`)).rows;
    expect(cols).toHaveLength(3);
    expect((await db.query(`select 1 from information_schema.tables where table_name = 'broker_requests'`)).rows).toHaveLength(1);
  }, 60_000);
  it('de twee delen met alle migraties werken op een lege database', async () => {
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
    await db.exec(readFileSync(join(root, 'bundels/nieuwe_database_deel1_0001_t_m_0004.sql'), 'utf8'));
    await db.exec(readFileSync(join(root, 'bundels/nieuwe_database_deel2_0005_t_m_0012.sql'), 'utf8'));
    const n = Number((await db.query<{ n: string }>(`select count(*) n from information_schema.tables where table_schema = 'public' and table_name in ('offices','listings','leads','viewings','conversations','broker_requests','feed_connections')`)).rows[0].n);
    expect(n).toBe(7);
  }, 60_000);
});
