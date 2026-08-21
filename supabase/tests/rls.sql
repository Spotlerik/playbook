-- ============================================================================
-- rls.sql — bewijst dat rep A niet bij de data van rep B komt
-- ============================================================================
-- Draaien:
--   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls.sql
-- of plakken in de SQL-editor. Het script rolt zichzelf terug: er blijft niets
-- van achter, ook niet als het slaagt.
--
-- Elke assertie klapt met een FAIL-melding zodra een verboden actie tóch lukt.
-- Geen output = alles dicht.
--
-- Draai dit VOORDAT er echte data in gaat, en opnieuw na elke wijziging aan
-- 0002. Een verkeerd ingestelde policy is hetzelfde lek als de huidige publieke
-- site, maar dan met echte gegevens erin.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- Preflight: mogen we hier testgebruikers aanmaken?
-- ---------------------------------------------------------------------------
-- Deze test zet rijen rechtstreeks in auth.users, omdat profiles daar met een
-- foreign key naar verwijst. Die tabel is van `supabase_auth_admin`; of de rol
-- waarmee jij verbindt erin mag schrijven verschilt per Supabase-versie en per
-- manier van verbinden. Faalt dat, dan zegt dat NIETS over je policies — het is
-- de testopstelling die niet mag, niet de beveiliging die lek is. Daarom een
-- duidelijke melding in plaats van een cryptische permission denied halverwege.
-- ---------------------------------------------------------------------------
do $$
declare probe uuid := gen_random_uuid();
begin
  begin
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                            email_confirmed_at, created_at, updated_at,
                            raw_app_meta_data, raw_user_meta_data)
    values ('00000000-0000-0000-0000-000000000000', probe, 'authenticated', 'authenticated',
            'preflight-' || probe || '@example.test', '', now(), now(), now(),
            '{}'::jsonb, '{}'::jsonb);
    delete from auth.users where id = probe;
  exception when others then
    raise exception E'Deze test kan geen testgebruikers aanmaken in auth.users.\n'
      '  Oorzaak: %\n'
      '  Dit is een beperking van de testopstelling, GEEN uitspraak over je policies.\n'
      '  Verbind als de `postgres`-rol (connection string uit Project Settings -> Database),\n'
      '  of sla deze set over en draai scripts/test-rls.mjs: dat script maakt zijn\n'
      '  gebruikers via de ondersteunde Admin API en dekt dezelfde controles via de\n'
      '  echte HTTP-API.', SQLERRM;
  end;
end $$;

-- ---------------------------------------------------------------------------
-- Opzet — drie gebruikers, twee sessies, twee shares
-- ---------------------------------------------------------------------------
create temporary table t_ids (k text primary key, v uuid);

do $$
declare
  v_team uuid;
  a uuid := gen_random_uuid();
  b uuid := gen_random_uuid();
  m uuid := gen_random_uuid();
  pa uuid; pb uuid; sa uuid; sb uuid; sha uuid; shb uuid;
begin
  insert into public.teams (name, market) values ('RLS-test team', 'NL')
  on conflict (name) do update set market = excluded.market
  returning id into v_team;

  -- auth.users rechtstreeks: dit is een test, geen productiepad.
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                          email_confirmed_at, created_at, updated_at,
                          raw_app_meta_data, raw_user_meta_data)
  values
    ('00000000-0000-0000-0000-000000000000', a, 'authenticated', 'authenticated',
     'rls-rep-a@example.test', '', now(), now(), now(), '{}'::jsonb, '{}'::jsonb),
    ('00000000-0000-0000-0000-000000000000', b, 'authenticated', 'authenticated',
     'rls-rep-b@example.test', '', now(), now(), now(), '{}'::jsonb, '{}'::jsonb),
    ('00000000-0000-0000-0000-000000000000', m, 'authenticated', 'authenticated',
     'rls-manager@example.test', '', now(), now(), now(), '{}'::jsonb, '{}'::jsonb);

  insert into public.profiles (id, full_name, email, role, team_id) values
    (a, 'RLS Rep A',   'rls-rep-a@example.test',   'rep',     v_team),
    (b, 'RLS Rep B',   'rls-rep-b@example.test',   'rep',     v_team),
    (m, 'RLS Manager', 'rls-manager@example.test', 'manager', v_team);

  insert into public.prospects (company, contact_name, contact_email, created_by)
  values ('Klant A BV', 'Contact A', 'contact@klant-a.test', a) returning id into pa;
  insert into public.prospects (company, contact_name, contact_email, created_by)
  values ('Klant B BV', 'Contact B', 'contact@klant-b.test', b) returning id into pb;

  insert into public.demo_sessions (rep_id, prospect_id, state)
  values (a, pa, '{"blocks":{"summary":"A"}}'::jsonb) returning id into sa;
  insert into public.demo_sessions (rep_id, prospect_id, state)
  values (b, pb, '{"blocks":{"summary":"B"}}'::jsonb) returning id into sb;

  insert into public.session_shares (session_id, token, included_blocks, allowed_domain)
  values (sa, public.generate_share_token(), '["summary"]'::jsonb, 'klant-a.test') returning id into sha;
  insert into public.session_shares (session_id, token, included_blocks, allowed_domain)
  values (sb, public.generate_share_token(), '["summary"]'::jsonb, 'klant-b.test') returning id into shb;

  insert into public.rep_tool_configs (rep_id, kind, config)
  values (a, 'pricing', '{"marge":10}'::jsonb), (b, 'pricing', '{"marge":20}'::jsonb);

  insert into t_ids (k, v) values
    ('a', a), ('b', b), ('m', m), ('pa', pa), ('pb', pb),
    ('sa', sa), ('sb', sb), ('sha', sha), ('shb', shb), ('team', v_team);
end $$;

-- Rate limiting mag deze test niet in de weg zitten; die wordt apart getest in
-- shared_summary.sql.
insert into public.app_settings (key, value) values ('share_request_rate_limit_per_hour', '100000'::jsonb)
on conflict (key) do update set value = excluded.value;

-- ---------------------------------------------------------------------------
-- Hulpjes
-- ---------------------------------------------------------------------------
create or replace function pg_temp.login(uid uuid) returns void
language plpgsql as $$
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', uid::text, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', uid::text, true);
  perform set_config('role', 'authenticated', true);
end $$;

create or replace function pg_temp.logout() returns void
language plpgsql as $$
begin
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  perform set_config('request.jwt.claim.sub', '', true);
end $$;

create or replace function pg_temp.as_superuser() returns void
language plpgsql as $$
begin
  reset role;
  perform set_config('request.jwt.claims', '', true);
  perform set_config('request.jwt.claim.sub', '', true);
end $$;

-- security definer: de assertieblokken draaien als `authenticated` en die rol
-- heeft geen rechten op de tijdelijke tabel met de test-id's. Dat is een
-- eigenschap van de testopstelling, niet iets dat we willen meten.
create or replace function pg_temp.id(k text) returns uuid
language sql stable security definer as $$ select v from t_ids where t_ids.k = id.k $$;

create or replace function pg_temp.check_zero(label text, cnt bigint) returns void
language plpgsql as $$
begin
  if cnt <> 0 then
    raise exception 'FAIL — % : % rij(en) zichtbaar/geraakt, verwacht 0', label, cnt;
  end if;
end $$;

create or replace function pg_temp.check_eq(label text, actual bigint, expected bigint) returns void
language plpgsql as $$
begin
  if actual <> expected then
    raise exception 'FAIL — % : % gekregen, % verwacht', label, actual, expected;
  end if;
end $$;

-- ===========================================================================
-- REP A
-- ===========================================================================
select pg_temp.login(pg_temp.id('a'));

do $$
declare n bigint; ok boolean;
begin
  -- De kernvraag van deze hele test.
  select count(*) into n from public.demo_sessions where id = pg_temp.id('sb');
  perform pg_temp.check_zero('rep A leest sessie van rep B', n);

  select count(*) into n from public.demo_sessions;
  perform pg_temp.check_eq('rep A ziet alleen eigen sessies', n, 1);

  update public.demo_sessions set state = '{"hacked":true}'::jsonb where id = pg_temp.id('sb');
  get diagnostics n = row_count;
  perform pg_temp.check_zero('rep A schrijft sessie van rep B', n);

  delete from public.demo_sessions where id = pg_temp.id('sb');
  get diagnostics n = row_count;
  perform pg_temp.check_zero('rep A verwijdert sessie van rep B', n);

  -- Een sessie op naam van iemand anders aanmaken moet hard falen.
  ok := false;
  begin
    insert into public.demo_sessions (rep_id) values (pg_temp.id('b'));
  exception when others then ok := true;
  end;
  if not ok then raise exception 'FAIL — rep A maakt sessie aan op naam van rep B'; end if;

  -- prospects: alleen via de eigen sessie
  select count(*) into n from public.prospects where id = pg_temp.id('pb');
  perform pg_temp.check_zero('rep A leest prospect van rep B', n);

  select count(*) into n from public.prospects where id = pg_temp.id('pa');
  perform pg_temp.check_eq('rep A leest eigen prospect', n, 1);

  update public.prospects set contact_email = 'x@y.test' where id = pg_temp.id('pb');
  get diagnostics n = row_count;
  perform pg_temp.check_zero('rep A schrijft prospect van rep B', n);

  -- session_shares
  select count(*) into n from public.session_shares where id = pg_temp.id('shb');
  perform pg_temp.check_zero('rep A leest share van rep B', n);

  update public.session_shares set revoked_at = null where id = pg_temp.id('shb');
  get diagnostics n = row_count;
  perform pg_temp.check_zero('rep A schrijft share van rep B', n);

  ok := false;
  begin
    perform public.add_share_email(pg_temp.id('shb'), 'indringer@partner.test');
  exception when others then ok := true;
  end;
  if not ok then raise exception 'FAIL — rep A voegt adres toe aan share van rep B'; end if;

  -- rep_tool_configs
  select count(*) into n from public.rep_tool_configs where rep_id = pg_temp.id('b');
  perform pg_temp.check_zero('rep A leest tool-config van rep B', n);

  update public.rep_tool_configs set config = '{}'::jsonb where rep_id = pg_temp.id('b');
  get diagnostics n = row_count;
  perform pg_temp.check_zero('rep A schrijft tool-config van rep B', n);

  -- profiles: lezen mag (teampagina, ranglijsten), schrijven alleen eigen rij
  select count(*) into n from public.profiles;
  perform pg_temp.check_eq('rep A leest alle profielen', n, 3);

  update public.profiles set full_name = 'Gekaapt' where id = pg_temp.id('b');
  get diagnostics n = row_count;
  perform pg_temp.check_zero('rep A schrijft profiel van rep B', n);

  -- rechtenescalatie
  ok := false;
  begin
    update public.profiles set role = 'manager' where id = pg_temp.id('a');
  exception when others then ok := true;
  end;
  if not ok then raise exception 'FAIL — rep A maakt zichzelf manager'; end if;

  ok := false;
  begin
    update public.profiles set team_id = null where id = pg_temp.id('a');
  exception when others then ok := true;
  end;
  if not ok then raise exception 'FAIL — rep A wijzigt eigen team'; end if;

  -- beheertabellen: lezen mag, schrijven niet
  select count(*) into n from public.trusted_domains;   -- geen fout: lezen mag
  select count(*) into n from public.blocked_domains;
  if n = 0 then raise exception 'FAIL — blocked_domains is leeg; draai 0004 eerst'; end if;

  ok := false;
  begin
    insert into public.trusted_domains (domain) values ('partner-a.test');
  exception when others then ok := true;
  end;
  if not ok then raise exception 'FAIL — rep A schrijft in trusted_domains'; end if;

  ok := false;
  begin
    insert into public.blocked_domains (domain, kind) values ('rep-a-verzint.test', 'free');
  exception when others then ok := true;
  end;
  if not ok then raise exception 'FAIL — rep A schrijft in blocked_domains'; end if;

  update public.app_settings set value = '1'::jsonb where key = 'prospect_retention_months';
  get diagnostics n = row_count;
  perform pg_temp.check_zero('rep A wijzigt de bewaartermijn', n);

  ok := false;
  begin
    insert into public.product_owners (product, owner_name) values ('Verzonnen', 'Rep A');
  exception when others then ok := true;
  end;
  if not ok then raise exception 'FAIL — rep A schrijft in product_owners'; end if;

  -- eigen rijen moeten juist wél werken, anders test je alleen dat alles dicht is
  update public.demo_sessions set icp = 'retail' where id = pg_temp.id('sa');
  get diagnostics n = row_count;
  perform pg_temp.check_eq('rep A schrijft eigen sessie', n, 1);

  update public.profiles set full_name = 'RLS Rep A' where id = pg_temp.id('a');
  get diagnostics n = row_count;
  perform pg_temp.check_eq('rep A schrijft eigen profiel', n, 1);

  perform public.add_share_email(pg_temp.id('sha'), 'partner@adviesbureau.test');

  -- de niet-blootgestelde tabellen bestaan niet voor een gewone gebruiker
  ok := false;
  begin
    perform count(*) from public.share_access_grants;
  exception when others then ok := true;
  end;
  if not ok then raise exception 'FAIL — rep A leest share_access_grants'; end if;

  ok := false;
  begin
    perform count(*) from public.share_access_attempts;
  exception when others then ok := true;
  end;
  if not ok then raise exception 'FAIL — rep A leest share_access_attempts'; end if;
end $$;

-- ===========================================================================
-- MANAGER
-- ===========================================================================
select pg_temp.as_superuser();
select pg_temp.login(pg_temp.id('m'));

do $$
declare n bigint; ok boolean;
begin
  select count(*) into n from public.demo_sessions;
  perform pg_temp.check_eq('manager leest alle sessies', n, 2);

  select count(*) into n from public.prospects;
  perform pg_temp.check_eq('manager leest alle prospects', n, 2);

  select count(*) into n from public.session_shares;
  perform pg_temp.check_eq('manager leest alle shares', n, 2);

  select count(*) into n from public.rep_tool_configs;
  perform pg_temp.check_eq('manager leest alle tool-configs', n, 2);

  -- Lezen is niet hetzelfde als schrijven: coachen mag, de sessie van een
  -- ander aanpassen niet.
  update public.demo_sessions set state = '{"door":"manager"}'::jsonb where id = pg_temp.id('sb');
  get diagnostics n = row_count;
  perform pg_temp.check_zero('manager schrijft sessie van een rep', n);

  -- adressen toevoegen aan elke share mag wel, via de RPC
  perform public.add_share_email(pg_temp.id('sha'), 'manager-toevoeging@partner.test');

  insert into public.trusted_domains (domain, label) values ('adwise.test', 'Partner - Adwise');

  -- Een whitelist met gmail.com erin heft de hele beveiliging op.
  ok := false;
  begin
    insert into public.trusted_domains (domain) values ('gmail.com');
  exception when others then ok := true;
  end;
  if not ok then raise exception 'FAIL — gmail.com toegelaten als vertrouwd domein'; end if;

  -- eigen domein als domeinregel: ook nee
  ok := false;
  begin
    insert into public.trusted_domains (domain) values ('spotler.com');
  exception when others then ok := true;
  end;
  if not ok then raise exception 'FAIL — spotler.com toegelaten als vertrouwd domein'; end if;

  ok := false;
  begin
    insert into public.trusted_domains (domain) values ('mailinator.com');
  exception when others then ok := true;
  end;
  if not ok then raise exception 'FAIL — wegwerpdomein toegelaten als vertrouwd domein'; end if;

  update public.app_settings set value = '24'::jsonb where key = 'prospect_retention_months';
  get diagnostics n = row_count;
  perform pg_temp.check_eq('manager wijzigt de bewaartermijn', n, 1);

  insert into public.product_owners (product, owner_name) values ('Testproduct', 'Iemand');
end $$;

-- ===========================================================================
-- ANONIEM — mag helemaal niets, behalve de RPC's uit 0003
-- ===========================================================================
select pg_temp.as_superuser();
select pg_temp.logout();

do $$
declare ok boolean; tbl text;
begin
  foreach tbl in array array[
    'teams','profiles','prospects','demo_sessions','session_shares',
    'trusted_domains','blocked_domains','rep_tool_configs','product_owners',
    'app_settings','share_access_grants','share_access_attempts'
  ] loop
    ok := false;
    begin
      execute format('select count(*) from public.%I', tbl);
    exception when others then ok := true;
    end;
    if not ok then
      raise exception 'FAIL — anon leest public.% (verwacht: permission denied)', tbl;
    end if;
  end loop;
end $$;

select pg_temp.as_superuser();

do $$ begin raise notice 'RLS-test geslaagd — alle verboden acties zijn geweigerd.'; end $$;

rollback;
