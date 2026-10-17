-- NNvastgoed — de rol "zoeker": iemand die een woning zoekt en een account heeft voor favorieten, bezichtigingen en berichten.
-- Een nieuwe waarde van een enum kan pas in een volgende transactie worden gebruikt; daarom staat dit los van 0005.
alter type app_role add value if not exists 'seeker';
