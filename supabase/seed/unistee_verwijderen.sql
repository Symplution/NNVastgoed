-- NNvastgoed — alle woningen en koppelingen van Unistee Makelaars verwijderen.
-- Het kantoor zelf (en een eventueel account) blijft staan. Wat bij de woningen hoort gaat mee: leads, bezichtigingen en berichten over die woningen,
-- en bij de koppelingen de logboeken van de aanroepen. Andere kantoren worden niet geraakt.

delete from listings where office_id = (select id from offices where slug = 'unistee-makelaars');
delete from feed_connections where office_id = (select id from offices where slug = 'unistee-makelaars');

select (select count(*) from listings where office_id = (select id from offices where slug = 'unistee-makelaars')) as woningen_over,
       (select count(*) from feed_connections where office_id = (select id from offices where slug = 'unistee-makelaars')) as koppelingen_over,
       (select count(*) from offices where slug = 'unistee-makelaars') as kantoor_blijft;
