-- NNvastgoed — plattegronden en 360°-foto's bij een woning (naast de foto's en de video).
-- Zelfde vorm als "photos": een lijst van { url, alt }. De bestanden staan in de bucket listing-photos.
alter table listings add column if not exists floorplans jsonb not null default '[]'::jsonb check (jsonb_typeof(floorplans) = 'array' and jsonb_array_length(floorplans) <= 20);
alter table listings add column if not exists photos_360 jsonb not null default '[]'::jsonb check (jsonb_typeof(photos_360) = 'array' and jsonb_array_length(photos_360) <= 20);
