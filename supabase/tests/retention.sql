-- ============================================================================
-- retention.sql — bewijst dat de bewaartermijn één configureerbare waarde is
-- ============================================================================
-- De termijn is een AANNAME, geen beleid: 24 maanden na afsluiting van de
-- sessie. Zodra Spotler de termijn uit HubSpot doorgeeft moet die deze
-- overschrijven met één UPDATE. Deze test bewaakt precies dat: dat de waarde
-- uit app_settings komt en nergens anders vastzit.
--
-- Draaien:
--   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/retention.sql
-- Rolt zichzelf terug.
-- ============================================================================

begin;

create temporary table t3 (k text primary key, v uuid);

do $$
declare
  v_team uuid; rep uuid := gen_random_uuid();
  p_old uuid; p_recent uuid; p_open uuid;
begin
  insert into public.teams (name, market) values ('Retention-test team', 'NL')
  on conflict (name) do update set market = excluded.market returning id into v_team;

  insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                          email_confirmed_at, created_at, updated_at,
                          raw_app_meta_data, raw_user_meta_data)
  values ('00000000-0000-0000-0000-000000000000', rep, 'authenticated', 'authenticated',
          'retention-rep@example.test', '', now(), now(), now(), '{}'::jsonb, '{}'::jsonb);
  insert into public.profiles (id, full_name, email, role, team_id)
  values (rep, 'Retention Rep', 'retention-rep@example.test', 'rep', v_team);

  -- 1. afgesloten, ruim over de termijn heen
  insert into public.prospects (company, contact_name, contact_email, created_by)
  values ('Oud BV', 'Oude Contactpersoon', 'oud@oud-bv.test', rep) returning id into p_old;
  insert into public.demo_sessions (rep_id, prospect_id, status, closed_at)
  values (rep, p_old, 'closed', now() - interval '30 months');

  -- 2. afgesloten, maar nog binnen de termijn
  insert into public.prospects (company, contact_name, contact_email, created_by)
  values ('Recent BV', 'Recente Contactpersoon', 'recent@recent-bv.test', rep) returning id into p_recent;
  insert into public.demo_sessions (rep_id, prospect_id, status, closed_at)
  values (rep, p_recent, 'closed', now() - interval '6 months');

  -- 3. oude sessie afgesloten, maar er loopt er nog één. Een lopend traject mag
  --    je de contactgegevens niet onder de voeten weghalen — dat is de reden
  --    voor 24 maanden en niet 12.
  insert into public.prospects (company, contact_name, contact_email, created_by)
  values ('Loopt Nog BV', 'Actieve Contactpersoon', 'actief@loopt-nog.test', rep) returning id into p_open;
  insert into public.demo_sessions (rep_id, prospect_id, status, closed_at)
  values (rep, p_open, 'closed', now() - interval '30 months');
  insert into public.demo_sessions (rep_id, prospect_id, status)
  values (rep, p_open, 'in_progress');

  insert into t3 values ('old', p_old), ('recent', p_recent), ('open', p_open);
end $$;

create or replace function pg_temp.fail_if(cond boolean, msg text) returns void
language plpgsql as $$
begin
  if cond then raise exception 'FAIL — %', msg; end if;
end $$;

do $$
declare r public.prospects%rowtype; n int;
begin
  update public.app_settings set value = '24'::jsonb where key = 'prospect_retention_months';

  n := public.anonymize_expired_prospects();
  perform pg_temp.fail_if(n <> 1, 'verwacht precies 1 geanonimiseerde prospect, kreeg ' || n);

  select * into r from public.prospects where id = (select v from t3 where k = 'old');
  perform pg_temp.fail_if(r.contact_name is not null, 'contactnaam is niet gewist');
  perform pg_temp.fail_if(r.contact_email is not null, 'contact-e-mailadres is niet gewist');
  perform pg_temp.fail_if(r.anonymized_at is null, 'anonymized_at is niet gezet');
  -- De sessiedata blijft bestaan, dan zonder herleidbare persoon. Bedrijfsnaam
  -- is geen persoonsgegeven en blijft staan.
  perform pg_temp.fail_if(r.company is distinct from 'Oud BV', 'bedrijfsnaam is ten onrechte gewist');
  perform pg_temp.fail_if(
    (select count(*) from public.demo_sessions where prospect_id = r.id) = 0,
    'de sessie is meegewist; alleen de persoon hoort te verdwijnen');

  select * into r from public.prospects where id = (select v from t3 where k = 'recent');
  perform pg_temp.fail_if(r.contact_email is null, 'een prospect binnen de termijn is toch gewist');

  select * into r from public.prospects where id = (select v from t3 where k = 'open');
  perform pg_temp.fail_if(r.contact_email is null,
    'een prospect met een nog lopende sessie is gewist');

  -- Tweede run doet niets meer: anonimiseren is idempotent.
  perform pg_temp.fail_if(public.anonymize_expired_prospects() <> 0,
    'een tweede run anonimiseerde opnieuw');

  -- DE KERN VAN DEZE TEST: de termijn zit alleen in app_settings. Zet hem op 3
  -- maanden en de "recente" prospect moet nu wél meegaan, zonder één regel code.
  update public.app_settings set value = '3'::jsonb where key = 'prospect_retention_months';
  n := public.anonymize_expired_prospects();
  perform pg_temp.fail_if(n <> 1,
    'de bewaartermijn uit app_settings had geen effect — hij zit ergens hardcoded');

  select * into r from public.prospects where id = (select v from t3 where k = 'recent');
  perform pg_temp.fail_if(r.contact_email is not null,
    'na het verkorten van de termijn is de recente prospect niet gewist');
end $$;

do $$ begin raise notice 'Bewaartermijn-test geslaagd.'; end $$;

rollback;
