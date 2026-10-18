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
