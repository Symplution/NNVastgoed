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
