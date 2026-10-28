-- NNvastgoed — één makelaarsaccount per kantoor. Teamleden delen het account van hun kantoor.
-- Eigenaar en beheerder staan hierbuiten (die horen bij NNV, ook als ze aan een kantoor gekoppeld zijn).
-- Staan er nu al meerdere makelaarsaccounts bij één kantoor, dan wordt de regel niet aangezet; ruim die eerst op (zie de melding).
do $$
begin
  if exists (select 1 from profiles where role = 'agent' and office_id is not null group by office_id having count(*) > 1) then
    raise notice 'Niet aangezet: er zijn kantoren met meer dan één makelaarsaccount. Zet bij alle kantoren behalve één het account op Alleen lezen of verwijder het, en draai dit bestand opnieuw.';
  else
    create unique index if not exists profiles_one_agent_per_office on profiles (office_id) where role = 'agent' and office_id is not null;
  end if;
end $$;
