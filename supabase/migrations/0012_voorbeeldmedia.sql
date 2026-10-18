-- NNvastgoed — een video of logo mag ook een adres op de eigen site zijn (bijvoorbeeld /voorbeeld-video.mp4 bij de testgegevens).
-- Via het beheer blijft een https-adres verplicht (die controle zit in de app); dit is alleen de ondergrens in de database.
alter table listings drop constraint if exists listings_video_url_check;
alter table listings add constraint listings_video_url_check check (video_url is null or (length(video_url) <= 500 and video_url ~ '^(https://|/[^/])\S*$'));
alter table offices drop constraint if exists offices_logo_url_check;
alter table offices add constraint offices_logo_url_check check (logo_url is null or (length(logo_url) <= 500 and logo_url ~ '^(https://|/[^/])\S*$'));
