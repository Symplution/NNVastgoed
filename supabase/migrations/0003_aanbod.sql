-- NNvastgoed — koop én huur, nieuwbouw en bedrijfsruimte, en het NVM-lidmaatschap van een kantoor.
--   offer      koop of huur; bij huur is asking_price de huurprijs per maand (price_type 'p.m.')
--   category   woning of bedrijfsruimte
--   new_build  nieuwbouw (een woning kan nieuwbouw én koop of huur zijn)

alter table listings
  add column if not exists offer text not null default 'koop',
  add column if not exists category text not null default 'woning',
  add column if not exists new_build boolean not null default false;

alter table listings drop constraint if exists listings_offer_check;
alter table listings add constraint listings_offer_check check (offer in ('koop', 'huur'));
alter table listings drop constraint if exists listings_category_check;
alter table listings add constraint listings_category_check check (category in ('woning', 'bedrijfsruimte'));

alter table listings drop constraint if exists listings_price_type_check;
alter table listings add constraint listings_price_type_check check (price_type in ('k.k.', 'v.o.n.', 'p.m.'));

alter table listings drop constraint if exists listings_property_type_check;
alter table listings add constraint listings_property_type_check check (property_type in (
  'appartement', 'tussenwoning', 'hoekwoning', 'twee-onder-een-kap', 'vrijstaand',
  'woonboerderij', 'bungalow', 'herenhuis', 'woonboot', 'bouwgrond',
  'kantoorruimte', 'bedrijfshal', 'winkelruimte', 'horecapand', 'overig'));

-- Huur heeft een prijs per maand, koop niet; bedrijfsruimte heeft een bedrijfsruimtesoort.
alter table listings drop constraint if exists listings_offer_price_ck;
alter table listings add constraint listings_offer_price_ck check ((offer = 'huur') = (price_type = 'p.m.'));
alter table listings drop constraint if exists listings_category_type_ck;
alter table listings add constraint listings_category_type_ck check (
  property_type = 'overig'
  or (category = 'bedrijfsruimte') = (property_type in ('kantoorruimte', 'bedrijfshal', 'winkelruimte', 'horecapand')));

-- Een huurprijs van meer dan een ton per maand is een tikfout.
alter table listings drop constraint if exists listings_rent_max_ck;
alter table listings add constraint listings_rent_max_ck check (offer = 'koop' or asking_price <= 100000);

create index if not exists listings_offer_idx on listings (offer, category, province, asking_price) where status <> 'concept';

-- NVM-lid: een kantoor zegt het niet zelf; alleen NNV-beheer zet dit aan na controle.
alter table offices add column if not exists nvm_member boolean not null default false;

create or replace function public.offices_guard()
returns trigger language plpgsql as $$
begin
  if auth.uid() is not null and new.nvm_member is distinct from old.nvm_member and not public.is_manager() then
    raise exception 'Alleen NNV-beheer kan het NVM-lidmaatschap wijzigen.';
  end if;
  return new;
end $$;
drop trigger if exists offices_guard_trg on offices;
create trigger offices_guard_trg before update on offices for each row execute function public.offices_guard();

-- De koppeling kent de nieuwe velden ook. Een foute waarde breekt de hele aanroep niet: dat vangt de app per woning af.
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

  insert into listings (office_id, slug, external_id, source, status, offer, category, new_build, street, house_number, house_suffix, postcode, city, province,
      neighbourhood, lat, lng, asking_price, price_type, living_area, plot_area, rooms, bedrooms, bathrooms, build_year,
      property_type, energy_label, description, features, photos)
  select c.office_id, x.slug, x.external_id, 'koppeling', x.status::listing_status, coalesce(x.offer, 'koop'), coalesce(x.category, 'woning'), coalesce(x.new_build, false),
      x.street, x.house_number, x.house_suffix, x.postcode, x.city,
      x.province::province_t, x.neighbourhood, x.lat, x.lng, x.asking_price, x.price_type, x.living_area, x.plot_area, x.rooms,
      coalesce(x.bedrooms, 0), coalesce(x.bathrooms, 1), x.build_year, x.property_type, x.energy_label, coalesce(x.description, ''),
      coalesce(array(select jsonb_array_elements_text(x.features)), '{}'), coalesce(x.photos, '[]'::jsonb)
  from jsonb_to_recordset(p_items) as x(slug text, external_id text, status text, offer text, category text, new_build boolean, street text, house_number text, house_suffix text,
      postcode text, city text, province text, neighbourhood text, lat double precision, lng double precision, asking_price integer,
      price_type text, living_area integer, plot_area integer, rooms integer, bedrooms integer, bathrooms integer, build_year integer,
      property_type text, energy_label text, description text, features jsonb, photos jsonb)
  on conflict (office_id, external_id) do update set
      status = excluded.status, offer = excluded.offer, category = excluded.category, new_build = excluded.new_build,
      street = excluded.street, house_number = excluded.house_number, house_suffix = excluded.house_suffix,
      postcode = excluded.postcode, city = excluded.city, province = excluded.province, neighbourhood = excluded.neighbourhood,
      lat = excluded.lat, lng = excluded.lng, asking_price = excluded.asking_price, price_type = excluded.price_type,
      living_area = excluded.living_area, plot_area = excluded.plot_area, rooms = excluded.rooms, bedrooms = excluded.bedrooms,
      bathrooms = excluded.bathrooms, build_year = excluded.build_year, property_type = excluded.property_type,
      energy_label = excluded.energy_label, description = excluded.description, features = excluded.features, photos = excluded.photos;
  get diagnostics n = row_count;

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
