-- NNvastgoed — een kantoor mag weer meerdere accounts hebben (de regel "één account per kantoor" is ingetrokken).
-- Doet niets als de regel nooit is aangezet.
drop index if exists profiles_one_agent_per_office;
