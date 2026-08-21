-- ============================================================================
-- shared_summary.sql — testset voor de enige route naar buiten
-- ============================================================================
-- De RLS-test dekt de tabellen. get_shared_summary is de enige functie die
-- anoniem bereikbaar is, dus die krijgt zijn eigen testset.
--
-- Draaien:
--   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/shared_summary.sql
-- Rolt zichzelf terug. Geen output behalve de slotmelding = alles goed.
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

create temporary table t2 (k text primary key, v text);

do $$
declare
  v_team uuid; rep uuid := gen_random_uuid();
  pr uuid; sess uuid; sh uuid; tok text;
begin
  insert into public.teams (name, market) values ('Share-test team', 'NL')
  on conflict (name) do update set market = excluded.market returning id into v_team;

  insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                          email_confirmed_at, created_at, updated_at,
                          raw_app_meta_data, raw_user_meta_data)
  values ('00000000-0000-0000-0000-000000000000', rep, 'authenticated', 'authenticated',
          'share-rep@example.test', '', now(), now(), now(), '{}'::jsonb, '{}'::jsonb);

  insert into public.profiles (id, full_name, email, role, team_id)
  values (rep, 'Share Rep', 'share-rep@example.test', 'rep', v_team);

  insert into public.prospects (company, contact_name, contact_email, created_by)
  values ('Acme Retail BV', 'Jan Klant', 'jan@acme-retail.test', rep) returning id into pr;

  insert into public.demo_sessions (rep_id, prospect_id, state)
  values (rep, pr, jsonb_build_object('blocks', jsonb_build_object(
    'summary',        'De samenvatting',
    'discovery',      'De pijnpunten',
    'pricing',        'Indicatie EUR 24.000',
    'internal_notes', 'Budget zit bij de CFO, contact is zwak'
  ))) returning id into sess;

  tok := public.generate_share_token();
  insert into public.session_shares (session_id, token, included_blocks, allowed_domain)
  values (sess, tok, '["summary","discovery"]'::jsonb, 'acme-retail.test') returning id into sh;

  insert into t2 values ('rep', rep::text), ('sess', sess::text), ('share', sh::text), ('token', tok);
end $$;

-- Rate limiting apart testen, niet hier in de weg laten lopen.
insert into public.app_settings (key, value) values
  ('share_request_rate_limit_per_hour', '100000'::jsonb),
  ('share_view_rate_limit_per_hour', '100000'::jsonb)
on conflict (key) do update set value = excluded.value;

create or replace function pg_temp.v(k text) returns text
language sql stable as $$ select t2.v from t2 where t2.k = v.k $$;

-- Doe alsof de eigenaar van de sessie is ingelogd, zodat auth.uid() klopt en
-- add_share_email() de eigendomscontrole passeert. De rol blijft bewust
-- superuser: dit bestand test de functielogica, en de helpers moeten bij
-- share_access_grants kunnen — dat is precies de tabel die voor gewone
-- gebruikers dicht hoort te zitten. De tabelrechten zelf worden in rls.sql
-- getest.
select set_config('request.jwt.claim.sub', pg_temp.v('rep'), true);

-- Vraagt toegang aan en haalt het grant-token op zoals de toegangsmail dat zou
-- doen. Geeft null als DEZE aanvraag geen grant heeft opgeleverd.
--
-- Het opruimen vooraf is essentieel: zonder dat zou het hulpje een grant uit een
-- eerdere stap teruggeven en zou "verlopen token geeft geen toegang" ten
-- onrechte falen. De test moet meten wat deze aanroep doet, niet wat er nog
-- van een vorige over is.
create or replace function pg_temp.grant_for(p_token text, p_email text) returns text
language plpgsql as $$
declare g text;
begin
  delete from public.share_access_grants where email = lower(btrim(p_email));
  perform public.request_shared_summary_access(p_token, p_email);
  select grant_token into g
    from public.share_access_grants
   where email = lower(btrim(p_email))
   order by created_at desc limit 1;
  return g;
end $$;

create or replace function pg_temp.fail_if(cond boolean, msg text) returns void
language plpgsql as $$
begin
  if cond then raise exception 'FAIL — %', msg; end if;
end $$;

-- ===========================================================================
do $$
declare
  tok text := pg_temp.v('token');
  g   text;
  res jsonb;
  vc  int;
  ok  boolean;
begin
  -- -----------------------------------------------------------------------
  -- 1. geldig token + adres binnen allowed_domain -> toegang, view_count +1
  -- -----------------------------------------------------------------------
  g := pg_temp.grant_for(tok, 'collega@acme-retail.test');
  perform pg_temp.fail_if(g is null, 'adres binnen allowed_domain kreeg geen toegang');

  select view_count into vc from public.session_shares where token = tok;
  perform pg_temp.fail_if(vc <> 0, 'view_count stond niet op 0 voor de eerste weergave');

  res := public.get_shared_summary(tok, g);
  perform pg_temp.fail_if(res is null, 'geldige combinatie token+grant gaf niets terug');
  perform pg_temp.fail_if(res->>'company' is distinct from 'Acme Retail BV',
    'bedrijfsnaam ontbreekt in het antwoord');

  select view_count into vc from public.session_shares where token = tok;
  perform pg_temp.fail_if(vc <> 1, 'view_count is niet met 1 opgehoogd');

  -- -----------------------------------------------------------------------
  -- 2. adres buiten het domein -> geen toegang, en geen melding waarom
  -- -----------------------------------------------------------------------
  perform pg_temp.fail_if(pg_temp.grant_for(tok, 'iemand@ander-bedrijf.test') is not null,
    'adres buiten het domein kreeg toegang');

  perform pg_temp.fail_if(
    (public.request_shared_summary_access(tok, 'iemand@ander-bedrijf.test'))->>'ok' <> 'true',
    'geweigerd adres kreeg een ander antwoord dan een geaccepteerd adres');

  -- -----------------------------------------------------------------------
  -- 5. onbekend token -> exact hetzelfde antwoord als een geweigerd adres
  -- -----------------------------------------------------------------------
  perform pg_temp.fail_if(
    public.request_shared_summary_access('bestaat-niet-dit-token', 'wie@dan-ook.test')
      is distinct from
    public.request_shared_summary_access(tok, 'iemand@ander-bedrijf.test'),
    'onbekend token is te onderscheiden van een geweigerd adres');

  perform pg_temp.fail_if(public.get_shared_summary('bestaat-niet-dit-token', 'wat-dan-ook') is not null,
    'onbekend token gaf een samenvatting terug');

  -- -----------------------------------------------------------------------
  -- Zonder grant is de link alleen niet genoeg
  -- -----------------------------------------------------------------------
  perform pg_temp.fail_if(public.get_shared_summary(tok) is not null,
    'token zonder geverifieerd adres gaf de samenvatting vrij');

  perform pg_temp.fail_if(public.get_shared_summary(tok, 'verzonnen-grant') is not null,
    'verzonnen grant-token gaf de samenvatting vrij');

  -- -----------------------------------------------------------------------
  -- 9. nooit meer dan wat in included_blocks staat
  -- -----------------------------------------------------------------------
  res := public.get_shared_summary(tok, g);
  perform pg_temp.fail_if((res->'blocks') ? 'pricing',
    'prijsindicatie zat in het antwoord terwijl included_blocks hem niet bevat');
  perform pg_temp.fail_if((res->'blocks') ? 'internal_notes',
    'interne notities zaten in het antwoord');
  perform pg_temp.fail_if(not ((res->'blocks') ? 'summary'),
    'vrijgegeven blok summary ontbreekt');
  perform pg_temp.fail_if(not ((res->'blocks') ? 'discovery'),
    'vrijgegeven blok discovery ontbreekt');
  perform pg_temp.fail_if((select count(*) from jsonb_object_keys(res->'blocks')) <> 2,
    'het antwoord bevat meer blokken dan vrijgegeven');
  -- geen contactgegevens van derden in een link die kan worden doorgestuurd
  perform pg_temp.fail_if(res::text like '%jan@acme-retail.test%',
    'het contact-e-mailadres lekt mee in de gedeelde samenvatting');
  perform pg_temp.fail_if(res::text like '%Jan Klant%',
    'de contactnaam lekt mee in de gedeelde samenvatting');

  -- -----------------------------------------------------------------------
  -- 10. interne notities EN prijsindicatie zijn HARDE uitsluitingen
  -- -----------------------------------------------------------------------
  -- Ook als included_blocks ze expliciet bevat. De write-trigger filtert ze er
  -- al uit; hier controleren we het eindresultaat. Prijsindicatie zat eerst in
  -- de "standaard uit maar aan te zetten"-categorie; dat is bewust strenger
  -- gemaakt, want één verkeerde klik is dan genoeg en een prijs in een
  -- blijvende, doorstuurbare URL hoort er niet.
  update public.session_shares
     set included_blocks = '["summary","discovery","internal_notes","rep_notes","pricing"]'::jsonb
   where token = tok;

  perform pg_temp.fail_if(
    (select included_blocks from public.session_shares where token = tok) ? 'internal_notes',
    'internal_notes bleef in included_blocks staan na een schrijfactie');
  perform pg_temp.fail_if(
    (select included_blocks from public.session_shares where token = tok) ? 'pricing',
    'pricing bleef in included_blocks staan na een schrijfactie');

  res := public.get_shared_summary(tok, g);
  perform pg_temp.fail_if((res->'blocks') ? 'internal_notes',
    'interne notities kwamen mee terwijl ze expliciet waren toegevoegd');
  perform pg_temp.fail_if((res->'blocks') ? 'pricing',
    'prijsindicatie kwam mee terwijl die expliciet was toegevoegd');

  -- Ook via create_session_share() met een expliciete blokkenlijst komt hij er
  -- niet doorheen — de rep kan hem dus ook bij het aanmaken niet aanzetten.
  perform pg_temp.fail_if(
    (public.create_session_share(pg_temp.v('sess')::uuid, '["summary","pricing"]'::jsonb)).included_blocks ? 'pricing',
    'prijsindicatie glipte binnen via create_session_share');

  update public.session_shares set included_blocks = '["summary","discovery"]'::jsonb where token = tok;

  -- -----------------------------------------------------------------------
  -- 4. ingetrokken token -> geweigerd
  -- -----------------------------------------------------------------------
  update public.session_shares set revoked_at = now() where token = tok;
  perform pg_temp.fail_if(public.get_shared_summary(tok, g) is not null,
    'ingetrokken token gaf nog steeds toegang');
  perform pg_temp.fail_if(public.get_share_gate(tok) is not null,
    'ingetrokken token toont nog steeds de bedrijfsnaam');
  update public.session_shares set revoked_at = null where token = tok;

  -- -----------------------------------------------------------------------
  -- 3. verlopen token -> geweigerd
  -- -----------------------------------------------------------------------
  update public.session_shares set expires_at = now() - interval '1 day' where token = tok;
  perform pg_temp.fail_if(public.get_shared_summary(tok, g) is not null,
    'verlopen token gaf nog steeds toegang');
  perform pg_temp.fail_if(pg_temp.grant_for(tok, 'collega@acme-retail.test') is not null,
    'verlopen token gaf nog steeds een toegangsmail');
  update public.session_shares set expires_at = now() + interval '90 days' where token = tok;

  -- -----------------------------------------------------------------------
  -- Ingetrokken toegang werkt meteen, niet pas als de grant verloopt
  -- -----------------------------------------------------------------------
  g := pg_temp.grant_for(tok, 'collega@acme-retail.test');
  perform pg_temp.fail_if(public.get_shared_summary(tok, g) is null, 'opzet mislukt');
  update public.session_shares set allowed_domain = null where token = tok;
  perform pg_temp.fail_if(public.get_shared_summary(tok, g) is not null,
    'na het intrekken van de domeinregel bleef een bestaande grant werken');
  update public.session_shares set allowed_domain = 'acme-retail.test' where token = tok;

  -- -----------------------------------------------------------------------
  -- 6. een geblokkeerd domein als allowed_domain -> insert faalt
  -- -----------------------------------------------------------------------
  ok := false;
  begin
    update public.session_shares set allowed_domain = 'gmail.com' where token = tok;
  exception when others then ok := true;
  end;
  perform pg_temp.fail_if(not ok, 'gmail.com werd geaccepteerd als allowed_domain');

  ok := false;
  begin
    update public.session_shares set allowed_domain = 'mailinator.com' where token = tok;
  exception when others then ok := true;
  end;
  perform pg_temp.fail_if(not ok, 'een wegwerpdomein werd geaccepteerd als allowed_domain');

  -- -----------------------------------------------------------------------
  -- 8. eigen domein: als domeinregel nee, als los adres ja
  -- -----------------------------------------------------------------------
  ok := false;
  begin
    update public.session_shares set allowed_domain = 'spotler.com' where token = tok;
  exception when others then ok := true;
  end;
  perform pg_temp.fail_if(not ok, 'spotler.com werd geaccepteerd als allowed_domain');

  perform public.add_share_email(pg_temp.v('share')::uuid, 'erik.dekock@spotler.com');
  perform pg_temp.fail_if(pg_temp.grant_for(tok, 'erik.dekock@spotler.com') is null,
    'een eigen adres werd geweigerd als los adres');

  -- publiek domein als los adres moet juist wél werken: zzp'ers zitten op gmail
  perform public.add_share_email(pg_temp.v('share')::uuid, 'de.freelancer@gmail.com');
  perform pg_temp.fail_if(pg_temp.grant_for(tok, 'de.freelancer@gmail.com') is null,
    'een gmail-adres werd geweigerd als los adres');

  -- -----------------------------------------------------------------------
  -- 7. wegwerpadres als los adres -> geweigerd
  -- -----------------------------------------------------------------------
  ok := false;
  begin
    perform public.add_share_email(pg_temp.v('share')::uuid, 'wegwerp@mailinator.com');
  exception when others then ok := true;
  end;
  perform pg_temp.fail_if(not ok, 'een wegwerpadres werd geaccepteerd als los adres');

  ok := false;
  begin
    update public.session_shares set allowed_emails = '["wegwerp@yopmail.com"]'::jsonb where token = tok;
  exception when others then ok := true;
  end;
  perform pg_temp.fail_if(not ok, 'een wegwerpadres glipte via een directe update naar binnen');

  -- -----------------------------------------------------------------------
  -- Verwijderde adressen verliezen hun toegang meteen
  -- -----------------------------------------------------------------------
  perform public.remove_share_email(pg_temp.v('share')::uuid, 'de.freelancer@gmail.com');
  perform pg_temp.fail_if(pg_temp.grant_for(tok, 'de.freelancer@gmail.com') is not null,
    'een verwijderd adres kreeg nog steeds toegang');

  -- -----------------------------------------------------------------------
  -- De whitelist van managers werkt als derde laag
  -- -----------------------------------------------------------------------
  insert into public.trusted_domains (domain, label) values ('adwise-partner.test', 'Partner - Adwise')
  on conflict (domain) do nothing;
  perform pg_temp.fail_if(pg_temp.grant_for(tok, 'consultant@adwise-partner.test') is null,
    'een vertrouwd partnerdomein kreeg geen toegang');

  -- -----------------------------------------------------------------------
  -- De gate toont de bedrijfsnaam en verder niets
  -- -----------------------------------------------------------------------
  res := public.get_share_gate(tok);
  perform pg_temp.fail_if(res->>'company' is distinct from 'Acme Retail BV',
    'de gate toont de bedrijfsnaam niet');
  perform pg_temp.fail_if((select count(*) from jsonb_object_keys(res)) <> 1,
    'de gate geeft meer terug dan de bedrijfsnaam');
end $$;

-- ===========================================================================
-- Rate limiting — tokens aflopen moet ook technisch onmogelijk zijn
-- ===========================================================================
do $$
declare tok text := pg_temp.v('token'); i int;
begin
  update public.app_settings set value = '3'::jsonb where key = 'share_view_rate_limit_per_hour';
  delete from public.share_access_attempts;

  for i in 1..3 loop
    perform public.get_shared_summary(tok, 'onzin');
  end loop;

  -- de vierde poging binnen het uur wordt geweigerd, ongeacht of hij klopt
  perform pg_temp.fail_if(
    public.get_shared_summary(tok, (select grant_token from public.share_access_grants
                                     order by created_at desc limit 1)) is not null,
    'rate limiting greep niet in na het overschrijden van de limiet');
end $$;

do $$ begin raise notice 'get_shared_summary-testset geslaagd.'; end $$;

rollback;
