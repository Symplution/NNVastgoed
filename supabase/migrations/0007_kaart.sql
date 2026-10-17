-- NNvastgoed — kaartlocaties.
-- 1. Een koppeling die geen coördinaten meestuurt, wist de coördinaten die we al hadden niet meer.
-- 2. De server zoekt de locatie van woningen zonder coördinaten op (PDOK Locatieserver) en zet ze erbij. Dat gaat met dezelfde
--    sleutel als de koppeling zelf, dus zonder account en zonder service key.

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
      lat = coalesce(excluded.lat, listings.lat), lng = coalesce(excluded.lng, listings.lng), asking_price = excluded.asking_price, price_type = excluded.price_type,
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


create or replace function public.feed_listings_without_geo(p_connection uuid, p_secret_hash text, p_limit integer default 100)
returns table (listing_id uuid, postcode text, house_number text, house_suffix text, city text)
language plpgsql stable security definer set search_path = public as $$
declare c feed_connections;
begin
  select * into c from feed_connections where id = p_connection and active and secret_hash = p_secret_hash;
  if not found then raise exception 'Ongeldige koppeling of sleutel.' using errcode = '28000'; end if;
  return query
    select l.id, l.postcode, l.house_number, l.house_suffix, l.city from listings l
    where l.office_id = c.office_id and l.source = 'koppeling' and l.lat is null and l.status <> 'ingetrokken'
    order by l.updated_at desc limit least(greatest(coalesce(p_limit, 100), 1), 200);
end $$;

create or replace function public.feed_set_geo(p_connection uuid, p_secret_hash text, p_updates jsonb)
returns integer
language plpgsql security definer set search_path = public as $$
declare c feed_connections; n integer := 0; u jsonb; k integer;
begin
  select * into c from feed_connections where id = p_connection and active and secret_hash = p_secret_hash;
  if not found then raise exception 'Ongeldige koppeling of sleutel.' using errcode = '28000'; end if;
  if jsonb_typeof(p_updates) <> 'array' or jsonb_array_length(p_updates) > 200 then raise exception 'Maximaal 200 locaties per aanroep.'; end if;
  for u in select * from jsonb_array_elements(p_updates) loop
    -- alleen woningen van dit kantoor uit de koppeling, en alleen als er nog geen locatie is
    update listings set lat = (u ->> 'lat')::double precision, lng = (u ->> 'lng')::double precision
    where id = (u ->> 'id')::uuid and office_id = c.office_id and source = 'koppeling' and lat is null;
    get diagnostics k = row_count;
    n := n + k;
  end loop;
  return n;
end $$;

grant execute on function public.feed_listings_without_geo(uuid, text, integer), public.feed_set_geo(uuid, text, jsonb) to anon, authenticated;
