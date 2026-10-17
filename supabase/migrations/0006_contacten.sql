-- NNvastgoed — wie een zoeker is, ziet een kantoor alleen als die zoeker zelf een gesprek met dat kantoor begon.
-- Een makelaar kan de tabel profiles of de gebruikers niet lezen; deze functie geeft per gesprek precies de naam,
-- het e-mailadres en het telefoonnummer terug, en alleen voor gesprekken van het eigen kantoor (met tweede stap).
create or replace function public.conversation_contacts()
returns table (conversation_id uuid, full_name text, email text, phone text)
language sql stable security definer set search_path = public, auth as $$
  select c.id, p.full_name, u.email::text, p.phone
  from conversations c
  join profiles p on p.id = c.seeker_id
  join auth.users u on u.id = c.seeker_id
  where public.can_read_office(c.office_id)
$$;
revoke execute on function public.conversation_contacts() from public, anon;
grant execute on function public.conversation_contacts() to authenticated;
