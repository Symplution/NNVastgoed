-- Woningfoto's: een openbare bucket (de foto's staan op de site), schrijven alleen in de map van het eigen kantoor.
-- Pad: <office_id>/<bestandsnaam>

create or replace function public.office_from_path(p text)
returns uuid language sql immutable as $$
  select case when (string_to_array(p, '/'))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
              then ((string_to_array(p, '/'))[1])::uuid end
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-photos', 'listing-photos', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy listing_photos_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-photos' and public.office_from_path(name) is not null and public.can_write_office(public.office_from_path(name)));
create policy listing_photos_update on storage.objects for update to authenticated
  using (bucket_id = 'listing-photos' and public.office_from_path(name) is not null and public.can_write_office(public.office_from_path(name)));
create policy listing_photos_delete on storage.objects for delete to authenticated
  using (bucket_id = 'listing-photos' and public.office_from_path(name) is not null and public.can_write_office(public.office_from_path(name)));

-- Wijzigen en verwijderen (en upsert) lezen de rij eerst; daarvoor moet het eigen kantoor zijn foto's kunnen zien.
-- De bestanden zelf zijn openbaar via hun adres, ook zonder deze policy.
create policy listing_photos_select on storage.objects for select to authenticated
  using (bucket_id = 'listing-photos' and public.office_from_path(name) is not null and public.can_read_office(public.office_from_path(name)));
