-- NNvastgoed — migraties 0008 t/m 0012 in één keer (aanmeldingen, video en logo, recreatie, plattegronden, voorbeeldmedia).
-- Veilig om meer dan één keer te draaien. Vereist: 0001 t/m 0007 zijn al gedraaid.

-- ═══════════ 0008_aanmeldingen ═══════════
-- NNvastgoed — aanmeldingen van makelaarskantoren die willen aansluiten.
-- Iedereen mag een aanmelding sturen (met een rem op misbruik); alleen eigenaar en beheerder (na de tweede inlogstap) lezen en behandelen ze.

create table if not exists broker_requests (
  id uuid primary key default gen_random_uuid(),
  office_name text not null check (length(office_name) between 2 and 120),
  city text not null check (length(city) between 2 and 80),
  province province_t not null,
  kvk text check (kvk is null or kvk ~ '^[0-9]{8}$'),
  nvm_member boolean not null default false,
  contact_name text not null check (length(contact_name) between 2 and 120),
  email text not null check (length(email) <= 200 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (phone is null or length(phone) <= 40),
  software text check (software is null or length(software) <= 80),
  listing_count integer check (listing_count is null or listing_count between 0 and 100000),
  message text check (message is null or length(message) <= 2000),
  consent boolean not null check (consent),
  status text not null default 'nieuw' check (status in ('nieuw', 'in_behandeling', 'aangesloten', 'afgewezen')),
  created_at timestamptz not null default now()
);
create index if not exists broker_requests_created_idx on broker_requests (created_at desc);

create or replace function public.broker_requests_before_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.status := 'nieuw';
  if (select count(*) from broker_requests where lower(email) = lower(new.email) and created_at > now() - interval '1 day') >= 3 then
    raise exception 'Te veel aanmeldingen met dit e-mailadres.';
  end if;
  if (select count(*) from broker_requests where created_at > now() - interval '1 hour') >= 60 then
    raise exception 'Te veel aanmeldingen. Probeer het later opnieuw.';
  end if;
  return new;
end $$;
drop trigger if exists broker_requests_before_insert_trg on broker_requests;
create trigger broker_requests_before_insert_trg before insert on broker_requests for each row execute function public.broker_requests_before_insert();

alter table broker_requests enable row level security;
revoke all on broker_requests from anon, authenticated;
grant insert on broker_requests to anon, authenticated;
grant select on broker_requests to authenticated;
grant update (status) on broker_requests to authenticated;

drop policy if exists broker_requests_insert on broker_requests;
create policy broker_requests_insert on broker_requests for insert to anon, authenticated with check (consent);
drop policy if exists broker_requests_select on broker_requests;
create policy broker_requests_select on broker_requests for select to authenticated using (public.is_manager() and public.is_aal2());
drop policy if exists broker_requests_update on broker_requests;
create policy broker_requests_update on broker_requests for update to authenticated using (public.is_manager() and public.is_aal2()) with check (public.is_manager() and public.is_aal2());
drop policy if exists require_mfa_select on broker_requests;
create policy require_mfa_select on broker_requests as restrictive for select to authenticated using (public.is_aal2());
drop policy if exists require_mfa_update on broker_requests;
create policy require_mfa_update on broker_requests as restrictive for update to authenticated using (public.is_aal2());

-- ═══════════ 0009_media ═══════════
-- NNvastgoed — één video per woning en een logo per kantoor.
-- De video en het logo staan in openbare buckets (ze zijn op de site te zien); schrijven alleen in de map van het eigen kantoor.
-- Pad: <office_id>/<bestandsnaam>, zoals bij de woningfoto's.

alter table listings add column if not exists video_url text check (video_url is null or (length(video_url) <= 500 and video_url ~ '^https://\S+$'));
alter table offices add column if not exists logo_url text check (logo_url is null or (length(logo_url) <= 500 and logo_url ~ '^https://\S+$'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-videos', 'listing-videos', true, 52428800, array['video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do nothing;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('office-logos', 'office-logos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

do $$
declare b text;
begin
  foreach b in array array['listing-videos', 'office-logos'] loop
    execute format('drop policy if exists %I on storage.objects', replace(b, '-', '_') || '_insert');
    execute format($p$create policy %I on storage.objects for insert to authenticated
      with check (bucket_id = %L and public.office_from_path(name) is not null and public.can_write_office(public.office_from_path(name)))$p$, replace(b, '-', '_') || '_insert', b);
    execute format('drop policy if exists %I on storage.objects', replace(b, '-', '_') || '_update');
    execute format($p$create policy %I on storage.objects for update to authenticated
      using (bucket_id = %L and public.office_from_path(name) is not null and public.can_write_office(public.office_from_path(name)))$p$, replace(b, '-', '_') || '_update', b);
    execute format('drop policy if exists %I on storage.objects', replace(b, '-', '_') || '_delete');
    execute format($p$create policy %I on storage.objects for delete to authenticated
      using (bucket_id = %L and public.office_from_path(name) is not null and public.can_write_office(public.office_from_path(name)))$p$, replace(b, '-', '_') || '_delete', b);
    execute format('drop policy if exists %I on storage.objects', replace(b, '-', '_') || '_select');
    execute format($p$create policy %I on storage.objects for select to authenticated
      using (bucket_id = %L and public.office_from_path(name) is not null and public.can_read_office(public.office_from_path(name)))$p$, replace(b, '-', '_') || '_select', b);
  end loop;
end $$;

-- ═══════════ 0010_recreatie ═══════════
-- NNvastgoed — recreatiewoningen: een eigen categorie naast woning en bedrijfsruimte, met eigen soorten.
alter table listings drop constraint if exists listings_category_check;
alter table listings add constraint listings_category_check check (category in ('woning', 'bedrijfsruimte', 'recreatie'));

alter table listings drop constraint if exists listings_property_type_check;
alter table listings add constraint listings_property_type_check check (property_type in (
  'appartement', 'tussenwoning', 'hoekwoning', 'twee-onder-een-kap', 'vrijstaand', 'woonboerderij', 'bungalow', 'herenhuis', 'woonboot', 'bouwgrond',
  'kantoorruimte', 'bedrijfshal', 'winkelruimte', 'horecapand',
  'recreatiewoning', 'vakantiebungalow', 'chalet', 'stacaravan',
  'overig'));

-- De categorie volgt uit de soort; "overig" mag bij elke categorie.
alter table listings drop constraint if exists listings_category_type_ck;
alter table listings add constraint listings_category_type_ck check (
  property_type = 'overig'
  or ((category = 'bedrijfsruimte') = (property_type in ('kantoorruimte', 'bedrijfshal', 'winkelruimte', 'horecapand'))
      and (category = 'recreatie') = (property_type in ('recreatiewoning', 'vakantiebungalow', 'chalet', 'stacaravan'))));

-- ═══════════ 0011_plattegronden ═══════════
-- NNvastgoed — plattegronden en 360°-foto's bij een woning (naast de foto's en de video).
-- Zelfde vorm als "photos": een lijst van { url, alt }. De bestanden staan in de bucket listing-photos.
alter table listings add column if not exists floorplans jsonb not null default '[]'::jsonb check (jsonb_typeof(floorplans) = 'array' and jsonb_array_length(floorplans) <= 20);
alter table listings add column if not exists photos_360 jsonb not null default '[]'::jsonb check (jsonb_typeof(photos_360) = 'array' and jsonb_array_length(photos_360) <= 20);

-- ═══════════ 0012_voorbeeldmedia ═══════════
-- NNvastgoed — een video of logo mag ook een adres op de eigen site zijn (bijvoorbeeld /voorbeeld-video.mp4 bij de testgegevens).
-- Via het beheer blijft een https-adres verplicht (die controle zit in de app); dit is alleen de ondergrens in de database.
alter table listings drop constraint if exists listings_video_url_check;
alter table listings add constraint listings_video_url_check check (video_url is null or (length(video_url) <= 500 and video_url ~ '^(https://|/[^/])\S*$'));
alter table offices drop constraint if exists offices_logo_url_check;
alter table offices add constraint offices_logo_url_check check (logo_url is null or (length(logo_url) <= 500 and logo_url ~ '^(https://|/[^/])\S*$'));

