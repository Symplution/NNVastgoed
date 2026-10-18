-- NNvastgoed — recreatiewoningen: een eigen categorie naast woning en bedrijfsruimte, met eigen soorten.
alter table listings drop constraint if exists listings_category_check;
alter table listings add constraint listings_category_check check (category in ('woning', 'bedrijfsruimte', 'recreatie'));

alter table listings drop constraint if exists listings_property_type_check;
alter table listings add constraint listings_property_type_check check (property_type in (
  'appartement', 'tussenwoning', 'hoekwoning', 'twee-onder-een-kap', 'vrijstaand', 'woonboerderij', 'bungalow', 'herenhuis', 'woonboot', 'bouwgrond',
  'kantoorruimte', 'bedrijfshal', 'winkelruimte', 'horecapand',
  'recreatiewoning', 'vakantiebungalow', 'chalet', 'stacaravan',
  'overig'));

-- De categorie volgt uit de soort; "overig" mag bij elke categorie.
alter table listings drop constraint if exists listings_category_type_ck;
alter table listings add constraint listings_category_type_ck check (
  property_type = 'overig'
  or ((category = 'bedrijfsruimte') = (property_type in ('kantoorruimte', 'bedrijfshal', 'winkelruimte', 'horecapand'))
      and (category = 'recreatie') = (property_type in ('recreatiewoning', 'vakantiebungalow', 'chalet', 'stacaravan'))));
