-- NNvastgoed — een notitie bij een lead (door het kantoor), te zien bij Leads en bij Contacten.
alter table leads add column if not exists note text check (note is null or length(note) <= 2000);
alter table leads add column if not exists note_at timestamptz;

-- Een bezoeker kan nooit zelf een notitie meesturen; en de tijd van de notitie volgt de wijziging.
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
  new.note := null;
  new.note_at := null;
  if (select count(*) from leads where lower(email) = lower(new.email) and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Te veel verzoeken. Probeer het later opnieuw.';
  end if;
  if (select count(*) from leads where listing_id = new.listing_id and created_at > now() - interval '1 hour') >= 40 then
    raise exception 'Te veel verzoeken voor deze woning. Probeer het later opnieuw.';
  end if;
  return new;
end $$;

create or replace function public.leads_note_touch()
returns trigger language plpgsql as $$
begin
  if new.note is distinct from old.note then
    new.note := nullif(btrim(coalesce(new.note, '')), '');
    new.note_at := case when new.note is null then null else now() end;
  end if;
  return new;
end $$;
drop trigger if exists leads_note_touch_trg on leads;
create trigger leads_note_touch_trg before update on leads for each row execute function public.leads_note_touch();
