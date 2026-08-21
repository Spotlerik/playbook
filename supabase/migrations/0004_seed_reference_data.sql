-- ============================================================================
-- 0004_seed_reference_data.sql — referentiedata
-- ============================================================================
-- Herhaalbaar: alles via `on conflict`. Een tweede run wijzigt niets dat je
-- intussen met de hand hebt aangepast, behalve waar dat expliciet de bedoeling
-- is (blocked_domains.kind).
--
-- Draai dit als service_role / in de SQL-editor: RLS wordt dan overgeslagen.
-- Er bestaan op dit moment nog geen profielen, dus er is ook geen manager die
-- deze rijen zou kunnen schrijven.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- app_settings
-- ---------------------------------------------------------------------------
insert into public.app_settings (key, value, description) values
  ('prospect_retention_months', '24'::jsonb,
   'AANNAME, GEEN BELEID. Maanden na afsluiting van de sessie waarna contactnaam en e-mailadres in prospects worden gewist. De sessiedata blijft. 24 en niet 12 omdat open deals gemiddeld ~110 dagen lopen en regelmatig langer dan een jaar. Zodra Spotler de termijn uit HubSpot doorgeeft: hier overschrijven, nergens anders.'),

  ('own_domains', '["spotler.com","spotler.nl"]'::jsonb,
   'Eigen domeinen. Geweigerd als domeinregel (allowed_domain, trusted_domains): bij een verkeerd ingevuld contactadres zou anders iedere Spotler-medewerker elke samenvatting kunnen openen. Als los adres in allowed_emails wel toegestaan.'),

  ('share_default_expiry_days', '90'::jsonb,
   'Standaard vervaltermijn van een deelbare link, in dagen. De rep kan hem per share aanpassen.'),

  ('share_default_blocks', '["summary","discovery","usecases","screens","next_steps"]'::jsonb,
   'Blokken die standaard aanstaan bij een nieuwe share. Deze lijst kan alleen blokken bevatten die überhaupt deelbaar zijn: prijsindicatie en interne notities staan in never_shareable_blocks() en worden er sowieso uit gefilterd, ook als iemand ze hier toevoegt.'),

  ('share_request_rate_limit_per_hour', '10'::jsonb,
   'Maximaal aantal adresverificatie-pogingen per token per uur.'),

  ('share_view_rate_limit_per_hour', '60'::jsonb,
   'Maximaal aantal weergaven per token per uur.')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- teams
-- ---------------------------------------------------------------------------
insert into public.teams (name, market)
values ('NL - New Business & Cross Sell Martech', 'NL')
on conflict (name) do nothing;

-- ---------------------------------------------------------------------------
-- blocked_domains — publieke maildiensten en wegwerpadressen
-- ---------------------------------------------------------------------------
-- In de tabel en niet in code, zodat uitbreiden geen deploy kost.
--
-- Deze lijst veroudert. Overweeg later een onderhouden bron (bijvoorbeeld het
-- free-email-domains pakket) ernaast te zetten; dit dekt vrijwel alles wat je
-- in de praktijk tegenkomt.
--
-- `do update` op kind, zodat een verkeerd geclassificeerd domein bij een
-- volgende run wordt rechtgezet.
-- ---------------------------------------------------------------------------
insert into public.blocked_domains (domain, kind)
select lower(d), 'free' from unnest(array[
  -- vrije maildiensten, wereldwijd
  'gmail.com','googlemail.com','outlook.com','outlook.nl','outlook.de','hotmail.com',
  'hotmail.co.uk','hotmail.nl','hotmail.de','live.com','live.nl','live.co.uk','live.de',
  'msn.com','yahoo.com','yahoo.co.uk','yahoo.de','ymail.com','rocketmail.com',
  'icloud.com','me.com','mac.com','aol.com','aol.de','protonmail.com','proton.me','pm.me',
  'gmx.com','gmx.net','gmx.de','gmx.at','gmx.ch','mail.com','zoho.com','yandex.com',
  'yandex.ru','fastmail.com','tutanota.com','tuta.io','hushmail.com','mailbox.org',
  'posteo.de','qq.com','163.com','126.com','naver.com',
  -- Nederlandse providers
  'ziggo.nl','kpnmail.nl','kpnplanet.nl','planet.nl','home.nl','casema.nl','chello.nl',
  'xs4all.nl','telfort.nl','zonnet.nl','hetnet.nl','upcmail.nl','quicknet.nl',
  'versatel.nl','online.nl','tele2.nl','solcon.nl','wanadoo.nl','freeler.nl',
  'hccnet.nl','zeelandnet.nl','caiway.nl','kabelfoon.nl',
  -- DACH
  'web.de','t-online.de','freenet.de','arcor.de','bluewin.ch','chello.at','a1.net',
  'kabelmail.de','online.de',
  -- UK
  'btinternet.com','sky.com','virginmedia.com','talktalk.net','blueyonder.co.uk',
  'ntlworld.com','tiscali.co.uk','mail.co.uk'
]) as d
on conflict (domain) do update set kind = excluded.kind;

insert into public.blocked_domains (domain, kind)
select lower(d), 'disposable' from unnest(array[
  'mailinator.com','guerrillamail.com','10minutemail.com','tempmail.com',
  'temp-mail.org','throwawaymail.com','yopmail.com','sharklasers.com','trashmail.com',
  'dispostable.com','getnada.com','maildrop.cc'
]) as d
on conflict (domain) do update set kind = excluded.kind;

-- ---------------------------------------------------------------------------
-- product_owners — overgenomen uit de hardgecodeerde OWNER_ROWS in index.html
-- ---------------------------------------------------------------------------
-- owner_profile_id blijft leeg: niet elke eigenaar heeft een playbook-account
-- (Harry, Jasper Werkman), en op het moment van deze migratie bestaan de
-- profielen nog niet. De backfill onderaan koppelt door waar dat wél kan.
-- ---------------------------------------------------------------------------
insert into public.product_owners (product, owner_name, sort_order) values
  ('Activate',        'Sjoerd de Jong, Rick Dekker',                          10),
  ('Commerce Cloud',  'Boris Mileusnic',                                      20),
  ('Mail+',           'Manuela Crielaard, Marthijn Dam Wichers, Sander te Loo', 30),
  ('MailPro',         'Jasper Koenraad',                                      40),
  ('CRM',             'Marthijn Dam Wichers',                                 50),
  ('SendPro',         'Nick van Dijk · Manuela Crielaard',                    60),
  ('Message',         'Boris Mileusnic',                                      70),
  ('FeedbackPro',     'Ivo Klein, Robbert Brouwer',                           80),
  ('Search',          'Rick Dekker',                                          90),
  ('Engage + Chat+',  'Harry',                                               100),
  ('Momice',          'Jasper Werkman',                                      110),
  ('BrandID',         null,                                                  120)
on conflict (product) do nothing;

-- Koppel eigenaren met precies één naam door naar hun profiel, als dat profiel
-- bestaat. Veilig om vaker te draaien: na het aanmaken van de accounts nog een
-- keer uitvoeren vult de rest aan.
update public.product_owners po
   set owner_profile_id = p.id
  from public.profiles p
 where po.owner_profile_id is null
   and po.owner_name is not null
   and po.owner_name = p.full_name;
