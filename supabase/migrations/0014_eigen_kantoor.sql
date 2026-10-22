-- NNvastgoed — je eigen account aan een kantoor koppelen.
-- Eigenaar en beheerder (na de tweede inlogstap) kunnen hun eigen account aan een kantoor hangen, bijvoorbeeld direct na het aanmaken van dat kantoor.
-- Rollen en andermans kantoor wijzigen blijft alleen voor de eigenaar (profiles_guard).

create or replace function public.profiles_guard()
returns trigger language plpgsql as $$
begin
  if auth.uid() is not null
     and coalesce(current_setting('nnv.eigen_kantoor', true), '') <> 'aan'
     and (new.role is distinct from old.role or new.active is distinct from old.active or new.office_id is distinct from old.office_id)
     and public.current_role_name() is distinct from 'owner' then
    raise exception 'Alleen de eigenaar kan rollen, kantoor of toegang wijzigen.';
  end if;
  return new;
end $$;

create or replace function public.set_my_office(p_office uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.is_manager() or not public.is_aal2() then
    raise exception 'Alleen de eigenaar of een beheerder kan het eigen kantoor kiezen.';
  end if;
  if p_office is not null and not exists (select 1 from offices where id = p_office) then
    raise exception 'Dit kantoor bestaat niet.';
  end if;
  -- Alleen binnen deze ene transactie, en alleen de eigen rij.
  perform set_config('nnv.eigen_kantoor', 'aan', true);
  update profiles set office_id = p_office where id = auth.uid();
  perform set_config('nnv.eigen_kantoor', '', true);
end $$;
revoke all on function public.set_my_office(uuid) from public;
grant execute on function public.set_my_office(uuid) to authenticated;
