-- NNvastgoed — zoekersaccounts, favorieten, bezichtigingen inplannen en berichten tussen zoeker en makelaar.
-- Zoekers hebben alleen toegang tot hun eigen rijen (auth.uid()); er is geen tweede inlogstap voor ze nodig.
-- Alles aan de makelaarskant loopt via can_read_office / can_write_office en vraagt dus wel een tweede stap (aal2).

-- Open registratie voor zoekers: iedereen die zich aanmeldt wordt zoeker, behalve de allereerste gebruiker (eigenaar).
-- Makelaars worden uitgenodigd en door de eigenaar aan een kantoor gekoppeld met een rol.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    case when (select count(*) from profiles) = 0 then 'owner'::app_role else 'seeker'::app_role end
  );
  return new;
end $$;

alter table profiles add column if not exists phone text check (length(phone) <= 40);

-- Een zoeker heeft geen tweede inlogstap en ziet alleen zijn eigen profiel; voor iedereen anders (makelaars) blijft aal2 verplicht.
drop policy if exists require_mfa on profiles;
create policy require_mfa on profiles as restrictive for all to authenticated
  using (public.is_aal2() or (id = auth.uid() and role = 'seeker'));

-- ───────────────────────── Favorieten ─────────────────────────
create table if not exists favorites (
  user_id uuid not null references profiles (id) on delete cascade,
  listing_id uuid not null references listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);
alter table favorites enable row level security;
grant select, insert, delete on favorites to authenticated;
drop policy if exists favorites_own_select on favorites;
create policy favorites_own_select on favorites for select to authenticated using (user_id = auth.uid());
drop policy if exists favorites_own_insert on favorites;
create policy favorites_own_insert on favorites for insert to authenticated
  with check (user_id = auth.uid() and (select count(*) from favorites f where f.user_id = auth.uid()) < 200);
drop policy if exists favorites_own_delete on favorites;
create policy favorites_own_delete on favorites for delete to authenticated using (user_id = auth.uid());

-- ───────────────────────── Beschikbaarheid voor bezichtigingen ─────────────────────────
-- Per kantoor: op welke dagen en tijden, hoe lang een bezichtiging duurt en hoeveel tegelijk (capaciteit = aantal makelaars).
create table if not exists viewing_rules (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references offices (id) on delete cascade,
  weekday smallint not null check (weekday between 1 and 7),          -- 1 = maandag … 7 = zondag
  start_time time not null,
  end_time time not null,
  slot_minutes integer not null default 30 check (slot_minutes between 10 and 180),
  capacity integer not null default 1 check (capacity between 1 and 20),
  created_at timestamptz not null default now(),
  check (end_time > start_time),
  check (extract(epoch from (end_time - start_time)) / 60 >= slot_minutes)
);
create index if not exists viewing_rules_office_idx on viewing_rules (office_id, weekday);

-- Momenten waarop het kantoor niet beschikbaar is (vakantie, een feestdag).
create table if not exists viewing_blocks (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references offices (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text check (length(reason) <= 200),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index if not exists viewing_blocks_office_idx on viewing_blocks (office_id, starts_at);

-- ───────────────────────── Bezichtigingen ─────────────────────────
create table if not exists viewings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  office_id uuid not null references offices (id) on delete cascade,
  seeker_id uuid references profiles (id) on delete set null,       -- leeg bij een gast
  name text not null check (length(name) between 2 and 120),
  email text not null check (length(email) <= 200 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (length(phone) <= 40),
  note text check (length(note) <= 1000),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'bevestigd' check (status in ('bevestigd', 'geannuleerd', 'afgerond', 'niet_verschenen')),
  cancelled_by text check (cancelled_by in ('zoeker', 'makelaar')),
  token uuid not null unique default gen_random_uuid(),             -- de sleutel in de mail: bekijken en annuleren zonder account
  source text not null default 'site' check (source in ('site', 'makelaar')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index if not exists viewings_office_idx on viewings (office_id, starts_at);
create index if not exists viewings_seeker_idx on viewings (seeker_id, starts_at);
-- Eén woning heeft op één moment maar één bezichtiging.
create unique index if not exists viewings_listing_slot_uq on viewings (listing_id, starts_at) where status in ('bevestigd');

create or replace function public.viewings_before_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare l listings;
begin
  select * into l from listings where id = new.listing_id;
  if not found then raise exception 'Deze woning bestaat niet.'; end if;
  new.office_id := l.office_id;                                       -- het kantoor komt uit de woning, nooit uit de aanvraag
  if new.starts_at < now() - interval '1 hour' then raise exception 'Een bezichtiging kan niet in het verleden liggen.'; end if;
  return new;
end $$;
drop trigger if exists viewings_before_insert_trg on viewings;
create trigger viewings_before_insert_trg before insert on viewings for each row execute function public.viewings_before_insert();

-- Na het inplannen verandert alleen de status (en wie annuleerde); wie, wat en wanneer liggen vast.
create or replace function public.viewings_guard()
returns trigger language plpgsql as $$
begin
  if new.listing_id is distinct from old.listing_id or new.office_id is distinct from old.office_id or new.seeker_id is distinct from old.seeker_id
     or new.name is distinct from old.name or new.email is distinct from old.email or new.starts_at is distinct from old.starts_at
     or new.ends_at is distinct from old.ends_at or new.token is distinct from old.token then
    raise exception 'Een bezichtiging kan niet worden aangepast; annuleer hem en plan een nieuwe.';
  end if;
  if old.status in ('geannuleerd', 'afgerond', 'niet_verschenen') and new.status is distinct from old.status then
    raise exception 'Deze bezichtiging is al afgehandeld.';
  end if;
  if new.status = 'geannuleerd' and new.cancelled_by is null then new.cancelled_by := 'makelaar'; end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists viewings_guard_trg on viewings;
create trigger viewings_guard_trg before update on viewings for each row execute function public.viewings_guard();

-- Vrije momenten voor een woning, uit de beschikbaarheid van het kantoor, min wat al bezet of geblokkeerd is.
-- Tijden volgen de Nederlandse klok (zomer- en wintertijd). Minimaal 6 uur vooruit; een woning kan alleen als hij online staat.
create or replace function public.viewing_slots(p_listing uuid, p_days integer default 21)
returns table (slot_start timestamptz, slot_end timestamptz, free_places integer)
language plpgsql stable security definer set search_path = public as $$
declare l listings; today date;
begin
  select * into l from listings where id = p_listing;
  if not found or l.status not in ('beschikbaar', 'onder_bod', 'onder_voorbehoud') or not public.listing_is_public(l.status, l.updated_at, l.office_id) then
    return;
  end if;
  p_days := least(greatest(coalesce(p_days, 21), 1), 60);
  today := (now() at time zone 'Europe/Amsterdam')::date;
  return query
  select s.t, s.t + s.m * interval '1 minute',
         s.cap - (select count(*)::int from viewings v where v.office_id = l.office_id and v.starts_at = s.t and v.status = 'bevestigd')
  from (
    select ((d.day + r.start_time + g.i * r.slot_minutes * interval '1 minute') at time zone 'Europe/Amsterdam') as t, r.slot_minutes as m, r.capacity as cap
    from (select (today + n)::date as day from generate_series(0, p_days) n) d
    join viewing_rules r on r.office_id = l.office_id and r.weekday = extract(isodow from d.day)::int
    cross join lateral generate_series(0, (extract(epoch from (r.end_time - r.start_time)) / 60)::int / r.slot_minutes - 1) as g(i)
  ) s
  where s.t >= now() + interval '6 hours'
    and not exists (select 1 from viewing_blocks b where b.office_id = l.office_id and s.t < b.ends_at and s.t + s.m * interval '1 minute' > b.starts_at)
    and not exists (select 1 from viewings v where v.listing_id = l.id and v.starts_at = s.t and v.status = 'bevestigd')
    and s.cap - (select count(*)::int from viewings v where v.office_id = l.office_id and v.starts_at = s.t and v.status = 'bevestigd') > 0
  order by s.t;
end $$;

-- Inplannen: de database controleert zelf dat het moment vrij is, dus het kan nooit dubbel of buiten de beschikbaarheid.
create or replace function public.book_viewing(p_listing uuid, p_starts_at timestamptz, p_name text, p_email text, p_phone text default null, p_note text default null)
returns table (out_id uuid, out_token uuid, out_start timestamptz, out_end timestamptz)
language plpgsql security definer set search_path = public as $$
declare l listings; s record; v viewings; v_email text := lower(trim(p_email));
begin
  select * into l from listings where id = p_listing;
  if not found then raise exception 'Deze woning bestaat niet.'; end if;
  -- Twee mensen die tegelijk hetzelfde moment kiezen komen na elkaar langs deze controle.
  perform pg_advisory_xact_lock(hashtext(l.office_id::text || p_starts_at::text));
  select * into s from public.viewing_slots(p_listing, 60) x where x.slot_start = p_starts_at;
  if not found then raise exception 'Dit moment is niet meer beschikbaar. Kies een ander moment.'; end if;
  if (select count(*) from viewings where lower(viewings.email) = v_email and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Te veel aanvragen. Probeer het later opnieuw.';
  end if;
  if (select count(*) from viewings where lower(viewings.email) = v_email and status = 'bevestigd' and viewings.starts_at > now()) >= 6 then
    raise exception 'Je hebt al zes bezichtigingen gepland. Annuleer er eerst een.';
  end if;
  insert into viewings (listing_id, office_id, seeker_id, name, email, phone, note, starts_at, ends_at, status)
  values (p_listing, l.office_id, auth.uid(), trim(p_name), v_email, nullif(trim(p_phone), ''), nullif(trim(p_note), ''), s.slot_start, s.slot_end, 'bevestigd')
  returning * into v;
  return query select v.id, v.token, v.starts_at, v.ends_at;
end $$;

-- Een bezichtiging met de sleutel uit de mail bekijken of annuleren, zonder account. Alleen deze ene bezichtiging.
create or replace function public.get_viewing(p_token uuid)
returns table (id uuid, starts_at timestamptz, ends_at timestamptz, status text, name text, listing_slug text, address text, city text, office_name text, office_phone text, office_email text)
language sql stable security definer set search_path = public as $$
  select v.id, v.starts_at, v.ends_at, v.status, v.name, l.slug,
         l.street || ' ' || l.house_number || coalesce(l.house_suffix, ''), l.city, o.name, o.phone, o.email
  from viewings v join listings l on l.id = v.listing_id join offices o on o.id = v.office_id
  where v.token = p_token
$$;

create or replace function public.cancel_viewing(p_token uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  update viewings set status = 'geannuleerd', cancelled_by = 'zoeker'
  where token = p_token and status = 'bevestigd' and starts_at > now();
  return found;
end $$;

-- ───────────────────────── Berichten ─────────────────────────
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  office_id uuid not null references offices (id) on delete cascade,
  seeker_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  unique (listing_id, seeker_id)
);
create index if not exists conversations_office_idx on conversations (office_id, last_message_at desc);
create index if not exists conversations_seeker_idx on conversations (seeker_id, last_message_at desc);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  sender text not null check (sender in ('zoeker', 'makelaar')),
  sender_id uuid references profiles (id) on delete set null,
  body text not null check (length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists messages_conv_idx on messages (conversation_id, created_at);

create or replace function public.conversations_before_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare l listings;
begin
  select * into l from listings where id = new.listing_id;
  if not found or not public.listing_is_public(l.status, l.updated_at, l.office_id) then
    raise exception 'Deze woning is niet beschikbaar voor een gesprek.';
  end if;
  new.office_id := l.office_id;
  new.seeker_id := auth.uid();
  if (select count(*) from conversations where seeker_id = auth.uid() and created_at > now() - interval '1 day') >= 20 then
    raise exception 'Te veel gesprekken. Probeer het morgen opnieuw.';
  end if;
  return new;
end $$;
drop trigger if exists conversations_before_insert_trg on conversations;
create trigger conversations_before_insert_trg before insert on conversations for each row execute function public.conversations_before_insert();

-- Wie in dit gesprek mag schrijven: de zoeker van het gesprek, of een makelaar van het kantoor (met tweede stap).
create or replace function public.message_allowed(p_conversation uuid, p_sender text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from conversations c where c.id = p_conversation and (
      (p_sender = 'zoeker' and c.seeker_id = auth.uid())
      or (p_sender = 'makelaar' and public.can_write_office(c.office_id))))
$$;

create or replace function public.conversation_visible(p_conversation uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from conversations c where c.id = p_conversation and (c.seeker_id = auth.uid() or public.can_read_office(c.office_id)))
$$;

create or replace function public.messages_before_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.sender_id := auth.uid();
  new.read_at := null;
  if (select count(*) from messages where sender_id = auth.uid() and created_at > now() - interval '1 hour') >= 60 then
    raise exception 'Te veel berichten. Probeer het later opnieuw.';
  end if;
  update conversations set last_message_at = now() where id = new.conversation_id;
  return new;
end $$;
drop trigger if exists messages_before_insert_trg on messages;
create trigger messages_before_insert_trg before insert on messages for each row execute function public.messages_before_insert();

-- ───────────────────────── Rechten en row level security ─────────────────────────
alter table viewing_rules enable row level security;
alter table viewing_blocks enable row level security;
alter table viewings enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

grant select, insert, update, delete on viewing_rules, viewing_blocks to authenticated;
grant select, insert, update on viewings to authenticated;
grant select, insert on conversations to authenticated;
grant select, insert on messages to authenticated;
grant update (read_at) on messages to authenticated;
grant execute on function public.viewing_slots(uuid, integer), public.book_viewing(uuid, timestamptz, text, text, text, text),
  public.get_viewing(uuid), public.cancel_viewing(uuid) to anon, authenticated;
grant execute on function public.message_allowed(uuid, text), public.conversation_visible(uuid) to authenticated;

-- Beschikbaarheid: alleen het eigen kantoor (en NNV-beheer), met tweede stap.
drop policy if exists require_mfa on viewing_rules;
create policy require_mfa on viewing_rules as restrictive to authenticated using (public.is_aal2());
drop policy if exists require_mfa on viewing_blocks;
create policy require_mfa on viewing_blocks as restrictive to authenticated using (public.is_aal2());
drop policy if exists viewing_rules_select on viewing_rules;
create policy viewing_rules_select on viewing_rules for select to authenticated using (public.can_read_office(office_id));
drop policy if exists viewing_rules_write on viewing_rules;
create policy viewing_rules_write on viewing_rules for all to authenticated using (public.can_write_office(office_id)) with check (public.can_write_office(office_id));
drop policy if exists viewing_blocks_select on viewing_blocks;
create policy viewing_blocks_select on viewing_blocks for select to authenticated using (public.can_read_office(office_id));
drop policy if exists viewing_blocks_write on viewing_blocks;
create policy viewing_blocks_write on viewing_blocks for all to authenticated using (public.can_write_office(office_id)) with check (public.can_write_office(office_id));

-- Bezichtigingen: de zoeker ziet de eigene; het kantoor ziet die van zijn woningen. Inplannen kan alleen via book_viewing
-- (zoekers) of door de makelaar zelf (bijvoorbeeld na een telefoontje).
drop policy if exists viewings_seeker_select on viewings;
create policy viewings_seeker_select on viewings for select to authenticated using (seeker_id = auth.uid());
drop policy if exists viewings_staff_select on viewings;
create policy viewings_staff_select on viewings for select to authenticated using (public.can_read_office(office_id));
drop policy if exists viewings_staff_insert on viewings;
create policy viewings_staff_insert on viewings for insert to authenticated
  with check (source = 'makelaar' and public.can_write_office((select l.office_id from listings l where l.id = listing_id)));
drop policy if exists viewings_staff_update on viewings;
create policy viewings_staff_update on viewings for update to authenticated using (public.can_write_office(office_id)) with check (public.can_write_office(office_id));

-- Gesprekken en berichten.
drop policy if exists conversations_select on conversations;
create policy conversations_select on conversations for select to authenticated using (seeker_id = auth.uid() or public.can_read_office(office_id));
drop policy if exists conversations_insert on conversations;
create policy conversations_insert on conversations for insert to authenticated with check (seeker_id = auth.uid());
drop policy if exists messages_select on messages;
create policy messages_select on messages for select to authenticated using (public.conversation_visible(conversation_id));
drop policy if exists messages_insert on messages;
create policy messages_insert on messages for insert to authenticated with check (public.message_allowed(conversation_id, sender));
-- Gelezen markeren: alleen wat de ander schreef.
drop policy if exists messages_mark_read on messages;
create policy messages_mark_read on messages for update to authenticated
  using (
    (sender = 'makelaar' and exists (select 1 from conversations c where c.id = conversation_id and c.seeker_id = auth.uid()))
    or (sender = 'zoeker' and exists (select 1 from conversations c where c.id = conversation_id and public.can_write_office(c.office_id))))
  with check (true);
