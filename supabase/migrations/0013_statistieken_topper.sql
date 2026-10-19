-- NNvastgoed — statistieken per woning en "Topper van de maand".
-- Statistieken: per woning en per dag hoe vaak de woning is getoond, bekeken, bewaard en als brochure gedownload.
-- Berichten en bezichtigingen komen live uit `leads` en `viewings`. Alleen het eigen kantoor (na de tweede inlogstap) leest ze.
-- Topper van de maand: een extra per woning, activeren doet een beheerder (de makelaar kan het alleen aanvragen).

alter table listings add column if not exists topper_until date;
alter table listings add column if not exists topper_requested_at timestamptz;
create index if not exists listings_topper_idx on listings (topper_until) where topper_until is not null;

-- Een ingelogde makelaar kan zichzelf geen topper maken; een beheerder, de feed en de server wel.
create or replace function public.listings_guard_topper()
returns trigger language plpgsql as $$
begin
  if auth.uid() is not null and not public.is_manager() then
    if tg_op = 'INSERT' then new.topper_until := null; else new.topper_until := old.topper_until; end if;
  end if;
  return new;
end $$;
drop trigger if exists listings_guard_topper_trg on listings;
create trigger listings_guard_topper_trg before insert or update on listings for each row execute function public.listings_guard_topper();

-- ───────────────────────── Statistieken ─────────────────────────
create table if not exists listing_stats_daily (
  listing_id uuid not null references listings (id) on delete cascade,
  office_id uuid not null references offices (id) on delete cascade,
  day date not null default current_date,
  impressions integer not null default 0,
  views integer not null default 0,
  saves integer not null default 0,
  brochures integer not null default 0,
  primary key (listing_id, day)
);
create index if not exists listing_stats_office_idx on listing_stats_daily (office_id, day desc);

alter table listing_stats_daily enable row level security;
revoke all on listing_stats_daily from anon, authenticated;
grant select on listing_stats_daily to authenticated;
drop policy if exists listing_stats_select on listing_stats_daily;
create policy listing_stats_select on listing_stats_daily for select to authenticated using (public.can_read_office(office_id));
drop policy if exists require_mfa_select on listing_stats_daily;
create policy require_mfa_select on listing_stats_daily as restrictive for select to authenticated using (public.is_aal2());

-- Tellen mag iedereen, maar alleen via deze functie, alleen voor woningen die online staan en maximaal 24 per keer.
create or replace function public.track_listings(p_kind text, p_ids uuid[])
returns void language plpgsql security definer set search_path = public as $$
declare l record;
begin
  if p_kind not in ('impression', 'view', 'brochure') then raise exception 'Onbekende soort.'; end if;
  for l in select id, office_id, status, updated_at from listings where id = any (p_ids[1:24]) loop
    if not public.listing_is_public(l.status, l.updated_at, l.office_id) then continue; end if;
    insert into listing_stats_daily as s (listing_id, office_id, day, impressions, views, brochures)
      values (l.id, l.office_id, current_date, (p_kind = 'impression')::int, (p_kind = 'view')::int, (p_kind = 'brochure')::int)
      on conflict (listing_id, day) do update set
        impressions = s.impressions + (p_kind = 'impression')::int,
        views = s.views + (p_kind = 'view')::int,
        brochures = s.brochures + (p_kind = 'brochure')::int;
  end loop;
end $$;
revoke all on function public.track_listings(text, uuid[]) from public;
grant execute on function public.track_listings(text, uuid[]) to anon, authenticated;

-- Bewaard als favoriet: telt mee zodra een zoeker het hartje aanzet (weghalen telt niet terug).
create or replace function public.favorites_count_save()
returns trigger language plpgsql security definer set search_path = public as $$
declare o uuid;
begin
  select office_id into o from listings where id = new.listing_id;
  if o is null then return new; end if;
  insert into listing_stats_daily as s (listing_id, office_id, day, saves) values (new.listing_id, o, current_date, 1)
    on conflict (listing_id, day) do update set saves = s.saves + 1;
  return new;
end $$;
drop trigger if exists favorites_count_save_trg on favorites;
create trigger favorites_count_save_trg after insert on favorites for each row execute function public.favorites_count_save();

-- Totalen per woning over de laatste N dagen (of alles). Draait met de rechten van de aanroeper, dus RLS bepaalt wat je ziet.
create or replace function public.listing_stats_totals(p_days integer default null)
returns table (listing_id uuid, impressions bigint, views bigint, saves bigint, brochures bigint)
language sql stable security invoker set search_path = public as $$
  select s.listing_id, sum(s.impressions)::bigint, sum(s.views)::bigint, sum(s.saves)::bigint, sum(s.brochures)::bigint
  from listing_stats_daily s
  where p_days is null or s.day > current_date - p_days
  group by s.listing_id
$$;
grant execute on function public.listing_stats_totals(integer) to authenticated;
