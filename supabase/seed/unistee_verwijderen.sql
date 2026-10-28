-- NNvastgoed — alle woningen en koppelingen van Unistee Makelaars verwijderen.
-- Het kantoor zelf (en een eventueel account) blijft staan. Wat bij de woningen hoort gaat mee: leads, bezichtigingen en berichten over die woningen,
-- en bij de koppelingen de logboeken van de aanroepen. Andere kantoren worden niet geraakt.

-- 1. Alle woningen en koppelingen van het kantoor Unistee (op naam, dus ook als het kantoor een andere korte naam heeft gekregen)
delete from listings where office_id in (select id from offices where slug = 'unistee-makelaars' or name ilike 'unistee%');
delete from feed_connections where office_id in (select id from offices where slug = 'unistee-makelaars' or name ilike 'unistee%');

-- 2. De tien woningen die erbij gezet waren, ook als ze (per ongeluk) onder een ander kantoor staan
delete from listings where slug in ('minervalaan-17-assen', 'parkweg-13-haren-gn', 'parkweg-102-haren-gn', 'anna-bijnspad-23-haren-gn', 'meerweg-135-haren-gn', 'schepperij-12-meerstad', 'burgemeester-de-dreuplein-106-assen', 's-o-j-palmelaan-191-groningen', 'meeuwerderweg-131-1-groningen', 'nesciolaan-139-haren-gn');

-- Controle: dit moet overal 0 zijn
select (select count(*) from listings where office_id in (select id from offices where slug = 'unistee-makelaars' or name ilike 'unistee%')
          or slug in ('minervalaan-17-assen', 'parkweg-13-haren-gn', 'parkweg-102-haren-gn', 'anna-bijnspad-23-haren-gn', 'meerweg-135-haren-gn', 'schepperij-12-meerstad', 'burgemeester-de-dreuplein-106-assen', 's-o-j-palmelaan-191-groningen', 'meeuwerderweg-131-1-groningen', 'nesciolaan-139-haren-gn')) as woningen_over,
       (select count(*) from feed_connections where office_id in (select id from offices where slug = 'unistee-makelaars' or name ilike 'unistee%')) as koppelingen_over,
       (select count(*) from offices where slug = 'unistee-makelaars' or name ilike 'unistee%') as kantoren_blijven;
