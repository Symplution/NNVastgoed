-- NNvastgoed (NNV) — kernschema
-- Regels: row level security op ELKE tabel, MFA (aal2) verplicht voor alles aan de makelaarskant via
-- de restrictive policy "require_mfa", rollen komen uit "profiles" in de database, nooit uit de browser.
-- Publiek (zonder inlog) kan alleen: openbaar woningaanbod en actieve kantoren lezen, een contactverzoek
-- sturen en een zoekopdracht opslaan.

-- ───────────────────────── Typen ─────────────────────────
create type app_role as enum ('owner', 'admin', 'agent', 'readonly');
create type listing_status as enum ('concept', 'beschikbaar', 'onder_bod', 'onder_voorbehoud', 'verkocht', 'ingetrokken');
create type province_t as enum ('groningen', 'friesland', 'drenthe');

-- ───────────────────────── Kantoren ─────────────────────────
create table offices (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null check (length(name) between 2 and 120),
  city text not null,
  province province_t not null,
  street text,
  postcode text,
  phone text,
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  website text,
  description text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ───────────────────────── Gebruikers ─────────────────────────
-- owner/admin: heel NNV. agent: een makelaar van één kantoor (schrijft). readonly: kijkt mee binnen het eigen kantoor.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role app_role not null default 'readonly',
  office_id uuid references offices (id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.current_role_name()
returns app_role language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid() and active
$$;

create or replace function public.current_office_id()
returns uuid language sql stable security definer set search_path = public as $$
  select office_id from profiles where id = auth.uid() and active
$$;

create or replace function public.is_manager()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role_name() in ('owner', 'admin'), false)
$$;

create or replace function public.is_aal2()
returns boolean language sql stable as $$
  select coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
$$;

-- Mag de gebruiker gegevens van dit kantoor lezen / wijzigen? (Altijd na de tweede inlogstap.)
create or replace function public.can_read_office(o uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_aal2() and (
    public.is_manager()
    or (public.current_role_name() in ('agent', 'readonly') and public.current_office_id() = o)
  )
$$;

create or replace function public.can_write_office(o uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_aal2() and (
    public.is_manager()
    or (public.current_role_name() = 'agent' and public.current_office_id() = o)
  )
$$;

-- De eerste gebruiker wordt eigenaar; iedereen daarna begint met alleen lezen en zonder kantoor.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    case when (select count(*) from profiles) = 0 then 'owner'::app_role else 'readonly'::app_role end
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

insert into profiles (id, full_name, role)
select u.id, coalesce(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1)),
       case when row_number() over (order by u.created_at) = 1 then 'owner'::app_role else 'readonly'::app_role end
from auth.users u
on conflict (id) do nothing;

-- Niemand wijzigt zijn eigen rol, kantoor of status; alleen de eigenaar.
create or replace function public.profiles_guard()
returns trigger language plpgsql as $$
begin
  if auth.uid() is not null
     and (new.role is distinct from old.role or new.active is distinct from old.active or new.office_id is distinct from old.office_id)
     and public.current_role_name() is distinct from 'owner' then
    raise exception 'Alleen de eigenaar kan rollen, kantoor of toegang wijzigen.';
  end if;
  return new;
end $$;
drop trigger if exists profiles_guard_trg on profiles;
create trigger profiles_guard_trg before update on profiles for each row execute function public.profiles_guard();

-- ───────────────────────── Woningen ─────────────────────────
create table listings (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references offices (id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  external_id text,                                   -- id in het systeem van het kantoor (koppeling)
  source text not null default 'handmatig' check (source in ('handmatig', 'koppeling')),
  status listing_status not null default 'concept',
  street text not null,
  house_number text not null,
  house_suffix text,
  postcode text not null check (postcode ~ '^[1-9][0-9]{3} ?[A-Za-z]{2}$'),
  city text not null,
  province province_t not null,
  neighbourhood text,
  lat double precision check (lat between 50 and 54),
  lng double precision check (lng between 3 and 8),
  asking_price integer not null check (asking_price >= 0),
  price_type text not null default 'k.k.' check (price_type in ('k.k.', 'v.o.n.')),
  living_area integer not null check (living_area > 0),
  plot_area integer check (plot_area >= 0),
  rooms integer not null check (rooms >= 0),
  bedrooms integer not null default 0 check (bedrooms >= 0),
  bathrooms integer not null default 1 check (bathrooms >= 0),
  build_year integer check (build_year between 1200 and 2100),
  property_type text not null check (property_type in (
    'appartement', 'tussenwoning', 'hoekwoning', 'twee-onder-een-kap', 'vrijstaand',
    'woonboerderij', 'bungalow', 'herenhuis', 'woonboot', 'bouwgrond', 'overig')),
  energy_label text check (energy_label in ('A++++', 'A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G')),
  description text not null default '',
  features text[] not null default '{}',
  photos jsonb not null default '[]'::jsonb check (jsonb_typeof(photos) = 'array'),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (office_id, external_id)
);
create index listings_public_idx on listings (province, city, asking_price) where status <> 'concept';
create index listings_office_idx on listings (office_id, updated_at desc);

create or replace function public.listings_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if new.status in ('beschikbaar', 'onder_bod', 'onder_voorbehoud', 'verkocht') and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end $$;
drop trigger if exists listings_touch_trg on listings;
create trigger listings_touch_trg before insert or update on listings for each row execute function public.listings_touch();

-- Wat een bezoeker mag zien: aanbod dat online staat; verkocht nog 90 dagen, daarna verdwijnt het.
create or replace function public.listing_is_public(s listing_status, upd timestamptz, o uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select (s in ('beschikbaar', 'onder_bod', 'onder_voorbehoud') or (s = 'verkocht' and upd > now() - interval '90 days'))
         and exists (select 1 from offices where id = o and active)
$$;

-- ───────────────────────── Contactverzoeken ─────────────────────────
create table leads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  office_id uuid not null references offices (id) on delete cascade,
  name text not null check (length(name) between 2 and 120),
  email text not null check (length(email) <= 200 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (length(phone) <= 40),
  message text not null check (length(message) between 1 and 2000),
  kind text not null default 'info' check (kind in ('info', 'bezichtiging')),
  status text not null default 'nieuw' check (status in ('nieuw', 'opgepakt', 'afgehandeld')),
  consent boolean not null check (consent),
  created_at timestamptz not null default now()
);
create index leads_office_idx on leads (office_id, created_at desc);

-- Het kantoor komt uit de woning, nooit uit het formulier. Alleen voor openbare woningen, en een rem op misbruik.
create or replace function public.leads_before_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare l listings;
begin
  select * into l from listings where id = new.listing_id;
  if not found or not public.listing_is_public(l.status, l.updated_at, l.office_id) then
    raise exception 'Deze woning is niet beschikbaar voor een contactverzoek.';
  end if;
  new.office_id := l.office_id;
  new.status := 'nieuw';
  if (select count(*) from leads where lower(email) = lower(new.email) and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Te veel verzoeken. Probeer het later opnieuw.';
  end if;
  if (select count(*) from leads where listing_id = new.listing_id and created_at > now() - interval '1 hour') >= 40 then
    raise exception 'Te veel verzoeken voor deze woning. Probeer het later opnieuw.';
  end if;
  return new;
end $$;
drop trigger if exists leads_before_insert_trg on leads;
create trigger leads_before_insert_trg before insert on leads for each row execute function public.leads_before_insert();

-- ───────────────────────── Zoekopdrachten (e-mailalert) ─────────────────────────
create table saved_searches (
  id uuid primary key default gen_random_uuid(),
  email text not null check (length(email) <= 200 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  filters jsonb not null check (jsonb_typeof(filters) = 'object' and pg_column_size(filters) < 2000),
  token uuid not null unique default gen_random_uuid(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  last_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.saved_searches_before_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from saved_searches where lower(email) = lower(new.email) and created_at > now() - interval '1 day') >= 5 then
    raise exception 'Te veel zoekopdrachten voor dit e-mailadres.';
  end if;
  return new;
end $$;
drop trigger if exists saved_searches_before_insert_trg on saved_searches;
create trigger saved_searches_before_insert_trg before insert on saved_searches for each row execute function public.saved_searches_before_insert();

-- Bevestigen en afmelden gaan met de geheime sleutel uit de mail; een bezoeker kan de tabel zelf niet lezen.
create or replace function public.confirm_saved_search(p_token uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  update saved_searches set confirmed_at = coalesce(confirmed_at, now()), unsubscribed_at = null where token = p_token;
  return found;
end $$;

create or replace function public.unsubscribe_saved_search(p_token uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  update saved_searches set unsubscribed_at = coalesce(unsubscribed_at, now()) where token = p_token;
  return found;
end $$;

-- ───────────────────────── Koppelingen ─────────────────────────
-- Een kantoor koppelt zijn eigen systeem (Realworks, Skarabee, Kolibri, Walvis, eigen software of een ICT-partner)
-- door aanbod naar /api/feeds/<id> te sturen met een geheime sleutel. Alleen de hash van de sleutel staat hier.
create table feed_connections (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references offices (id) on delete cascade,
  name text not null check (length(name) between 2 and 80),
  kind text not null default 'json' check (kind in ('json', 'xml')),
  secret_hash text not null,
  secret_hint text not null default '',
  active boolean not null default true,
  last_run_at timestamptz,
  last_status text,
  last_received integer,
  last_upserted integer,
  created_at timestamptz not null default now()
);

create table feed_runs (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references feed_connections (id) on delete cascade,
  office_id uuid not null references offices (id) on delete cascade,
  at timestamptz not null default now(),
  received integer not null default 0,
  upserted integer not null default 0,
  rejected integer not null default 0,
  errors jsonb not null default '[]'::jsonb
);
create index feed_runs_conn_idx on feed_runs (connection_id, at desc);

-- Alleen het kantoor van deze koppeling en alleen met de juiste sleutel. Draait als eigenaar van de tabellen,
-- zodat de koppeling geen account nodig heeft en er nergens een service key in omloop is.
create or replace function public.ingest_listings(p_connection uuid, p_secret_hash text, p_items jsonb, p_rejected jsonb default '[]'::jsonb, p_full boolean default false)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  c feed_connections;
  n integer;
  total integer;
  rej integer;
begin
  select * into c from feed_connections where id = p_connection and active and secret_hash = p_secret_hash;
  if not found then raise exception 'Ongeldige koppeling of sleutel.' using errcode = '28000'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > 500 then
    raise exception 'Maximaal 500 woningen per aanroep.';
  end if;
  total := jsonb_array_length(p_items);
  rej := coalesce(jsonb_array_length(p_rejected), 0);

  insert into listings (office_id, slug, external_id, source, status, street, house_number, house_suffix, postcode, city, province,
      neighbourhood, lat, lng, asking_price, price_type, living_area, plot_area, rooms, bedrooms, bathrooms, build_year,
      property_type, energy_label, description, features, photos)
  select c.office_id, x.slug, x.external_id, 'koppeling', x.status::listing_status, x.street, x.house_number, x.house_suffix, x.postcode, x.city,
      x.province::province_t, x.neighbourhood, x.lat, x.lng, x.asking_price, x.price_type, x.living_area, x.plot_area, x.rooms,
      coalesce(x.bedrooms, 0), coalesce(x.bathrooms, 1), x.build_year, x.property_type, x.energy_label, coalesce(x.description, ''),
      coalesce(array(select jsonb_array_elements_text(x.features)), '{}'), coalesce(x.photos, '[]'::jsonb)
  from jsonb_to_recordset(p_items) as x(slug text, external_id text, status text, street text, house_number text, house_suffix text,
      postcode text, city text, province text, neighbourhood text, lat double precision, lng double precision, asking_price integer,
      price_type text, living_area integer, plot_area integer, rooms integer, bedrooms integer, bathrooms integer, build_year integer,
      property_type text, energy_label text, description text, features jsonb, photos jsonb)
  on conflict (office_id, external_id) do update set
      status = excluded.status, street = excluded.street, house_number = excluded.house_number, house_suffix = excluded.house_suffix,
      postcode = excluded.postcode, city = excluded.city, province = excluded.province, neighbourhood = excluded.neighbourhood,
      lat = excluded.lat, lng = excluded.lng, asking_price = excluded.asking_price, price_type = excluded.price_type,
      living_area = excluded.living_area, plot_area = excluded.plot_area, rooms = excluded.rooms, bedrooms = excluded.bedrooms,
      bathrooms = excluded.bathrooms, build_year = excluded.build_year, property_type = excluded.property_type,
      energy_label = excluded.energy_label, description = excluded.description, features = excluded.features, photos = excluded.photos;
  get diagnostics n = row_count;

  -- Volledige synchronisatie: wat het kantoor niet meer stuurt, gaat offline.
  if p_full then
    update listings set status = 'ingetrokken'
    where office_id = c.office_id and source = 'koppeling' and status <> 'ingetrokken'
      and external_id not in (select v ->> 'external_id' from jsonb_array_elements(p_items) v);
  end if;

  update feed_connections set last_run_at = now(), last_status = case when rej = 0 then 'ok' else 'gedeeltelijk' end,
      last_received = total + rej, last_upserted = n where id = c.id;
  insert into feed_runs (connection_id, office_id, received, upserted, rejected, errors)
  values (c.id, c.office_id, total + rej, n, rej, coalesce(p_rejected, '[]'::jsonb));

  return jsonb_build_object('ontvangen', total + rej, 'verwerkt', n, 'afgewezen', rej);
end $$;

-- ───────────────────────── Gebruik (usage gate) ─────────────────────────
-- Elke uitgaande mail en elke betaalde AI-aanroep (later de AI-departments) wordt hier gelogd.
-- Schrijven gebeurt alleen server-side; de unieke sleutel voorkomt dubbel versturen.
create table usage_events (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('mail', 'ai')),
  office_id uuid references offices (id) on delete set null,
  unique_key text not null unique,
  units integer not null default 1,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ───────────────────────── Row level security ─────────────────────────
alter table offices enable row level security;
alter table profiles enable row level security;
alter table listings enable row level security;
alter table leads enable row level security;
alter table saved_searches enable row level security;
alter table feed_connections enable row level security;
alter table feed_runs enable row level security;
alter table usage_events enable row level security;

-- Rechten per rol. Row level security bepaalt daarna welke rijen.
revoke all on all tables in schema public from anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on offices, listings to anon, authenticated;
grant insert on leads, saved_searches to anon, authenticated;
grant select, update on profiles to authenticated;
grant insert, update, delete on offices, listings to authenticated;
grant select, update, delete on leads to authenticated;
-- De hash van de sleutel is nooit leesbaar vanuit de browser.
grant select (id, office_id, name, kind, secret_hint, active, last_run_at, last_status, last_received, last_upserted, created_at) on feed_connections to authenticated;
grant insert, delete on feed_connections to authenticated;
grant update (name, active) on feed_connections to authenticated;
grant select on feed_runs, usage_events to authenticated;
grant execute on function public.confirm_saved_search(uuid), public.unsubscribe_saved_search(uuid) to anon, authenticated;
grant execute on function public.ingest_listings(uuid, text, jsonb, jsonb, boolean) to anon, authenticated;
grant execute on function public.current_role_name(), public.current_office_id(), public.is_manager(), public.is_aal2(),
  public.can_read_office(uuid), public.can_write_office(uuid), public.listing_is_public(listing_status, timestamptz, uuid) to anon, authenticated;

-- Streng: wie een tweede inlogstap mist, komt niet bij makelaarsgegevens. Openbare gegevens blijven voor iedereen.
create policy require_mfa on profiles as restrictive for all to authenticated using (public.is_aal2());
create policy require_mfa_select on leads as restrictive for select to authenticated using (public.is_aal2());
create policy require_mfa_update on leads as restrictive for update to authenticated using (public.is_aal2());
create policy require_mfa_delete on leads as restrictive for delete to authenticated using (public.is_aal2());
create policy require_mfa on feed_connections as restrictive for all to authenticated using (public.is_aal2());
create policy require_mfa on feed_runs as restrictive for all to authenticated using (public.is_aal2());
create policy require_mfa on usage_events as restrictive for all to authenticated using (public.is_aal2());
create policy require_mfa_write_insert on listings as restrictive for insert to authenticated with check (public.is_aal2());
create policy require_mfa_write_update on listings as restrictive for update to authenticated using (public.is_aal2());
create policy require_mfa_write_delete on listings as restrictive for delete to authenticated using (public.is_aal2());
create policy require_mfa_write_insert on offices as restrictive for insert to authenticated with check (public.is_aal2());
create policy require_mfa_write_update on offices as restrictive for update to authenticated using (public.is_aal2());
create policy require_mfa_write_delete on offices as restrictive for delete to authenticated using (public.is_aal2());

-- Profielen: eigen profiel, of als beheerder alles.
create policy profiles_select on profiles for select to authenticated using (id = auth.uid() or public.is_manager());
create policy profiles_update on profiles for update to authenticated
  using (id = auth.uid() or public.current_role_name() = 'owner') with check (id = auth.uid() or public.current_role_name() = 'owner');

-- Kantoren: actieve kantoren zijn openbaar; wijzigen door NNV-beheer, of een makelaar aan het eigen kantoor.
create policy offices_public on offices for select to anon, authenticated using (active);
create policy offices_staff on offices for select to authenticated using (public.can_read_office(id));
create policy offices_insert on offices for insert to authenticated with check (public.is_manager());
create policy offices_update on offices for update to authenticated using (public.can_write_office(id)) with check (public.can_write_office(id));
create policy offices_delete on offices for delete to authenticated using (public.current_role_name() = 'owner');

-- Woningen: openbaar aanbod voor iedereen; concepten en alles van het eigen kantoor voor de makelaar.
create policy listings_public on listings for select to anon, authenticated using (public.listing_is_public(status, updated_at, office_id));
create policy listings_staff_select on listings for select to authenticated using (public.can_read_office(office_id));
create policy listings_insert on listings for insert to authenticated with check (public.can_write_office(office_id));
create policy listings_update on listings for update to authenticated using (public.can_write_office(office_id)) with check (public.can_write_office(office_id));
create policy listings_delete on listings for delete to authenticated using (public.can_write_office(office_id));

-- Contactverzoeken: iedereen mag er een sturen (de trigger controleert de woning); lezen alleen het eigen kantoor.
create policy leads_insert on leads for insert to anon, authenticated with check (true);
create policy leads_select on leads for select to authenticated using (public.can_read_office(office_id));
create policy leads_update on leads for update to authenticated using (public.can_write_office(office_id)) with check (public.can_write_office(office_id));
create policy leads_delete on leads for delete to authenticated using (public.is_manager());

-- Zoekopdrachten: alleen aanmaken, onbevestigd. Lezen kan alleen de server met de service key (verzenden van alerts).
create policy saved_searches_insert on saved_searches for insert to anon, authenticated
  with check (confirmed_at is null and unsubscribed_at is null and last_sent_at is null);

-- Koppelingen en runs: alleen het eigen kantoor.
create policy feed_connections_select on feed_connections for select to authenticated using (public.can_read_office(office_id));
create policy feed_connections_insert on feed_connections for insert to authenticated with check (public.can_write_office(office_id));
create policy feed_connections_update on feed_connections for update to authenticated using (public.can_write_office(office_id)) with check (public.can_write_office(office_id));
create policy feed_connections_delete on feed_connections for delete to authenticated using (public.can_write_office(office_id));
create policy feed_runs_select on feed_runs for select to authenticated using (public.can_read_office(office_id));

-- Gebruik: beheerders lezen mee; schrijven gebeurt met de service key op de server.
create policy usage_events_select on usage_events for select to authenticated using (public.is_manager());
