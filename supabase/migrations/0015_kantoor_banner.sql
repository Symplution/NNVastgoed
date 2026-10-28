-- NNvastgoed — een banner voor het kantoor, achter het logo op de makelaarskaart bij een woning en bovenaan de kantoorpagina.
-- De afbeelding staat in dezelfde openbare map als het logo (bucket office-logos, map per kantoor); alleen het adres staat hier.
alter table offices add column if not exists banner_url text check (banner_url is null or (length(banner_url) <= 500 and banner_url ~ '^https://'));
