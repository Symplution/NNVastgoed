-- NNvastgoed — testgegevens verwijderen (hoort bij testdata.sql). Raakt alleen de testkantoren en accounts op @nnv.test.
delete from saved_searches where email like '%@nnv.test';
delete from broker_requests where email like '%@nnv.test';
delete from usage_events where unique_key like 'testdata:%';
delete from offices where id in ('a0000001-0000-4000-8000-000000000001', 'a0000001-0000-4000-8000-000000000002', 'a0000001-0000-4000-8000-000000000003', 'a0000001-0000-4000-8000-000000000004', 'a0000001-0000-4000-8000-000000000005', 'a0000001-0000-4000-8000-000000000006');   -- woningen, leads, bezichtigingen, gesprekken en beschikbaarheid volgen mee
delete from auth.users where email like '%@nnv.test';          -- profielen en favorieten volgen mee
select (select count(*) from offices) as kantoren_over, (select count(*) from listings) as woningen_over, (select count(*) from auth.users) as accounts_over;
