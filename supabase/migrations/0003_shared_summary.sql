-- ============================================================================
-- 0003_shared_summary.sql — de enige route naar buiten
-- ============================================================================
-- De deelbare samenvattingslink loopt NIET via een publieke leesregel op
-- session_shares. Anonieme bezoekers hebben op geen enkele tabel rechten; ze
-- kunnen uitsluitend de functies in dit bestand aanroepen. Zo staat er nooit
-- meer op straat dan de rep heeft vrijgegeven.
--
-- Herhaalbaar: elke functie wordt eerst gedropt.
--
-- CONTRACT VOOR DE DEMO STUDIO — demo_sessions.state bevat een object onder de
-- sleutel 'blocks', met per samenvattingsblok één sleutel. included_blocks is
-- een array van diezelfde sleutels. Blokken uit never_shareable_blocks() komen
-- er structureel nooit uit, ook niet als ze in included_blocks staan.
-- ============================================================================

-- notified_at hoort bij deze functionaliteit, niet bij het kale schema:
-- de mailer (Edge Function, volgende bouwsessie) markeert hiermee wat verstuurd is.
alter table public.share_access_grants add column if not exists notified_at timestamptz;

-- ---------------------------------------------------------------------------
-- Tokens
-- ---------------------------------------------------------------------------
-- 128-bit random, niet oplopend en niet afgeleid van de sessie-id. base64url
-- zodat hij zonder encoding in een URL past.
create or replace function public.generate_share_token()
returns text
language sql
volatile
as $$
  select translate(encode(gen_random_bytes(16), 'base64'), '+/=', '-_');
$$;

-- Pogingen worden op een hash gelogd, niet op het token zelf: de logtabel is
-- daarmee zelf geen bron van geldige tokens.
create or replace function public.hash_token(t text)
returns text
language sql
immutable
as $$
  select encode(digest(coalesce(t, ''), 'sha256'), 'hex');
$$;

-- ---------------------------------------------------------------------------
-- Rate limiting
-- ---------------------------------------------------------------------------
-- Zodat tokens aflopen ook technisch onmogelijk is. Telt per token-hash, dus
-- een onbekend token telt óók mee — anders is juist het raden ongelimiteerd.
-- Retourneert true als de poging is toegestaan.
create or replace function public.register_share_attempt(p_token text, p_kind text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_hash  text := public.hash_token(p_token);
  v_limit int;
  v_count int;
begin
  v_limit := coalesce(
    (public.app_setting(
       case when p_kind = 'request' then 'share_request_rate_limit_per_hour'
            else 'share_view_rate_limit_per_hour' end,
       case when p_kind = 'request' then '10'::jsonb else '60'::jsonb end
     ))::text::int, 10);

  select count(*) into v_count
    from public.share_access_attempts a
   where a.token_hash = v_hash
     and a.kind = p_kind
     and a.created_at > now() - interval '1 hour';

  insert into public.share_access_attempts (token_hash, kind) values (v_hash, p_kind);

  return v_count < v_limit;
end;
$$;

-- ---------------------------------------------------------------------------
-- Toegangslijst — drie lagen, die samen gelden
-- ---------------------------------------------------------------------------
--   1. het domein van het contactpersoon (allowed_domain), automatisch afgeleid
--   2. losse adressen die de rep later toevoegt (allowed_emails)
--   3. de door managers beheerde whitelist (trusted_domains)
-- Wegwerpadressen vallen er in alle drie de lagen uit.
-- ---------------------------------------------------------------------------
create or replace function public.email_may_access_share(p_share_id uuid, p_email text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_share   public.session_shares%rowtype;
  v_email   text := lower(btrim(p_email));
  v_domain  text := public.domain_of(v_email);
begin
  if not public.is_valid_email(v_email) then
    return false;
  end if;

  -- Een tijdelijk adres om je samenvatting te openen is een signaal dat je niet
  -- wil faciliteren — ook niet als los adres.
  if public.is_disposable_domain(v_domain) then
    return false;
  end if;

  select * into v_share from public.session_shares where id = p_share_id;
  if not found then
    return false;
  end if;

  -- laag 2: exact adres. Elk domein mag hier, ook gmail — freelancers en
  -- zzp'ers werken daarop.
  if v_share.allowed_emails ? v_email then
    return true;
  end if;

  -- laag 1: domein van het contactpersoon
  if v_share.allowed_domain is not null and v_share.allowed_domain = v_domain then
    return true;
  end if;

  -- laag 3: whitelist van managers
  if exists (select 1 from public.trusted_domains t where t.domain = v_domain) then
    return true;
  end if;

  return false;
end;
$$;

-- ---------------------------------------------------------------------------
-- Share aanmaken — met de automatisch afgeleide domeinregel
-- ---------------------------------------------------------------------------
-- Het afleiden van allowed_domain uit het contactadres hoort hier en niet in de
-- frontend: de rep hoeft er niets voor te doen, en een publiek domein wordt
-- stilzwijgend géén domeinregel (dan blijft allowed_domain leeg en moet de rep
-- het exacte adres toevoegen).
-- ---------------------------------------------------------------------------
drop function if exists public.create_session_share(uuid, jsonb, int);
create function public.create_session_share(
  p_session_id      uuid,
  p_included_blocks jsonb default null,
  p_expiry_days     int default null
) returns public.session_shares
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_contact_email text;
  v_domain        text;
  v_blocks        jsonb;
  v_days          int;
  v_row           public.session_shares%rowtype;
begin
  if not (public.owns_session(p_session_id) or public.is_manager()) then
    raise exception 'geen toegang tot deze sessie' using errcode = 'insufficient_privilege';
  end if;

  select p.contact_email into v_contact_email
    from public.demo_sessions s
    left join public.prospects p on p.id = s.prospect_id
   where s.id = p_session_id;

  v_domain := public.domain_of(v_contact_email);
  if v_domain is not null and not public.domain_allowed_as_rule(v_domain) then
    -- publiek of eigen domein: geen domeinregel, de rep voegt het exacte adres toe
    v_domain := null;
  end if;

  -- Prijsindicatie standaard uit: van alle blokken is dit de enige die
  -- commercieel tegen je kan werken als de link wordt doorgestuurd. De rep mag
  -- hem aanzetten, maar dat moet een bewuste keuze zijn.
  v_blocks := coalesce(p_included_blocks,
    public.app_setting('share_default_blocks', '["summary","discovery","usecases","screens","next_steps"]'::jsonb));

  v_days := coalesce(p_expiry_days,
    (public.app_setting('share_default_expiry_days', '90'::jsonb))::text::int, 90);

  insert into public.session_shares (session_id, token, included_blocks, allowed_domain, expires_at)
  values (p_session_id, public.generate_share_token(), v_blocks, v_domain, now() + make_interval(days => v_days))
  returning * into v_row;

  return v_row;
end;
$$;

-- ---------------------------------------------------------------------------
-- Losse adressen toevoegen/verwijderen
-- ---------------------------------------------------------------------------
-- Eén schrijfpad voor zowel de rep als de manager, zodat de validatie op één
-- plek staat. Managers hebben bewust géén UPDATE-policy op session_shares: die
-- zou rij-breed zijn en dus ook included_blocks en expires_at openzetten.
-- ---------------------------------------------------------------------------
drop function if exists public.add_share_email(uuid, text);
create function public.add_share_email(p_share_id uuid, p_email text)
returns public.session_shares
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_email text := lower(btrim(p_email));
  v_row   public.session_shares%rowtype;
begin
  if not (public.owns_share(p_share_id) or public.is_manager()) then
    raise exception 'geen toegang tot deze share' using errcode = 'insufficient_privilege';
  end if;
  if not public.is_valid_email(v_email) then
    raise exception 'ongeldig e-mailadres: %', p_email using errcode = 'check_violation';
  end if;
  if public.is_disposable_domain(public.domain_of(v_email)) then
    raise exception 'wegwerpadres % is niet toegestaan', v_email using errcode = 'check_violation';
  end if;

  update public.session_shares
     set allowed_emails = case
           when allowed_emails ? v_email then allowed_emails
           else allowed_emails || to_jsonb(v_email)
         end
   where id = p_share_id
  returning * into v_row;

  return v_row;
end;
$$;

drop function if exists public.remove_share_email(uuid, text);
create function public.remove_share_email(p_share_id uuid, p_email text)
returns public.session_shares
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_email text := lower(btrim(p_email));
  v_row   public.session_shares%rowtype;
begin
  if not (public.owns_share(p_share_id) or public.is_manager()) then
    raise exception 'geen toegang tot deze share' using errcode = 'insufficient_privilege';
  end if;

  update public.session_shares
     set allowed_emails = coalesce((
           select jsonb_agg(e) from jsonb_array_elements_text(allowed_emails) as t(e)
            where e <> v_email
         ), '[]'::jsonb)
   where id = p_share_id
  returning * into v_row;

  -- Ingetrokken toegang moet ook lopende sessies raken, anders blijft iemand
  -- die je net hebt verwijderd nog 24 uur binnen.
  delete from public.share_access_grants
   where share_id = p_share_id and email = v_email;

  return v_row;
end;
$$;

-- ---------------------------------------------------------------------------
-- Stap 1 van de ontvangerflow: bedrijfsnaam tonen op de invulpagina
-- ---------------------------------------------------------------------------
-- Bedrijfsnaam bovenaan, zodat een verkeerde ontvanger meteen ziet dat het niet
-- voor hem is. Meer dan dat geeft deze functie niet: geen blokken, geen namen,
-- geen contactgegevens.
-- ---------------------------------------------------------------------------
drop function if exists public.get_share_gate(text);
create function public.get_share_gate(share_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_company text;
begin
  if not public.register_share_attempt(share_token, 'request') then
    return null;
  end if;

  select p.company into v_company
    from public.session_shares sh
    join public.demo_sessions s on s.id = sh.session_id
    left join public.prospects p on p.id = s.prospect_id
   where sh.token = share_token
     and sh.revoked_at is null
     and (sh.expires_at is null or sh.expires_at > now());

  if not found then
    return null;
  end if;

  return jsonb_build_object('company', v_company);
end;
$$;

-- ---------------------------------------------------------------------------
-- Stap 2: adres invullen
-- ---------------------------------------------------------------------------
-- Staat het adres op de toegangslijst, dan komt er een toegangsmail. Zo niet,
-- dan geen mail en geen melding dat het adres niet klopte. Deze functie geeft
-- daarom ALTIJD hetzelfde antwoord — onbekend token, verlopen token,
-- ingetrokken token en een adres dat er niet op staat zijn van buitenaf niet te
-- onderscheiden. Ook een geblokkeerde poging door rate limiting ziet er zo uit.
-- ---------------------------------------------------------------------------
drop function if exists public.request_shared_summary_access(text, text);
create function public.request_shared_summary_access(share_token text, recipient_email text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_share_id uuid;
  v_email    text := lower(btrim(recipient_email));
  v_generic  jsonb := jsonb_build_object(
    'ok', true,
    'message', 'Als dit adres toegang heeft, is er een e-mail onderweg. Kijk ook in je spam-map.'
  );
begin
  if not public.register_share_attempt(share_token, 'request') then
    return v_generic;
  end if;

  select sh.id into v_share_id
    from public.session_shares sh
   where sh.token = share_token
     and sh.revoked_at is null
     and (sh.expires_at is null or sh.expires_at > now());

  if v_share_id is null or not public.email_may_access_share(v_share_id, v_email) then
    return v_generic;
  end if;

  insert into public.share_access_grants (share_id, email, grant_token, expires_at)
  values (v_share_id, v_email, public.generate_share_token() || public.generate_share_token(), now() + interval '24 hours');

  -- De mail zelf verstuurt een Edge Function die op notified_at is null let.
  -- Die hoort bij de bouw van de samenvattingspagina, niet bij dit fundament.
  return v_generic;
end;
$$;

-- ---------------------------------------------------------------------------
-- Stap 3: de samenvatting zelf
-- ---------------------------------------------------------------------------
-- Controleert het token, of hij niet is ingetrokken en niet is verlopen,
-- verhoogt view_count, en geeft alleen de vrijgegeven blokken terug.
--
-- p_access_grant komt uit de toegangsmail. Zonder geldig grant-token geeft deze
-- functie NULL — het bezit van de link alleen is niet genoeg.
-- ---------------------------------------------------------------------------
drop function if exists public.get_shared_summary(text);
drop function if exists public.get_shared_summary(text, text);
create function public.get_shared_summary(share_token text, p_access_grant text default null)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_share   public.session_shares%rowtype;
  v_state   jsonb;
  v_company text;
  v_created timestamptz;
  v_blocks  jsonb := '{}'::jsonb;
  v_key     text;
  v_grant   public.share_access_grants%rowtype;
begin
  if not public.register_share_attempt(share_token, 'view') then
    return null;
  end if;

  select sh.* into v_share
    from public.session_shares sh
   where sh.token = share_token
     and sh.revoked_at is null
     and (sh.expires_at is null or sh.expires_at > now());

  if not found then
    return null;
  end if;

  -- Toegang bewijzen. Geen grant, verkeerde share of verlopen grant geven
  -- allemaal hetzelfde: niets.
  if p_access_grant is null then
    return null;
  end if;

  select g.* into v_grant
    from public.share_access_grants g
   where g.grant_token = p_access_grant
     and g.share_id = v_share.id
     and g.expires_at > now();

  if not found then
    return null;
  end if;

  -- Nog steeds op de lijst? Toegang die de rep intussen heeft ingetrokken mag
  -- niet blijven werken omdat de grant nog geldig is.
  if not public.email_may_access_share(v_share.id, v_grant.email) then
    return null;
  end if;

  if v_grant.consumed_at is null then
    update public.share_access_grants set consumed_at = now() where id = v_grant.id;
  end if;

  select s.state, s.created_at, p.company
    into v_state, v_created, v_company
    from public.demo_sessions s
    left join public.prospects p on p.id = s.prospect_id
   where s.id = v_share.session_id;

  -- Alleen de vrijgegeven blokken, en nooit de structureel uitgesloten blokken.
  -- Die filtering staat óók in de write-trigger; hier nog een keer, zodat een
  -- rij die op een andere manier in de tabel is gekomen alsnog niets lekt.
  for v_key in
    select b from jsonb_array_elements_text(v_share.included_blocks) as t(b)
     where b <> all (public.never_shareable_blocks())
  loop
    if v_state -> 'blocks' ? v_key then
      v_blocks := v_blocks || jsonb_build_object(v_key, v_state -> 'blocks' -> v_key);
    end if;
  end loop;

  update public.session_shares
     set view_count = view_count + 1
   where id = v_share.id;

  return jsonb_build_object(
    'company', v_company,
    'created_at', v_created,
    'expires_at', v_share.expires_at,
    'blocks', v_blocks
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Bewaartermijn
-- ---------------------------------------------------------------------------
-- Eén configureerbare waarde (app_settings.prospect_retention_months), niet
-- hardcoded op meerdere plekken. Aanname, geen beleid: 24 maanden na afsluiting
-- van de sessie. Zodra Spotler de termijn uit HubSpot doorgeeft, is dat een
-- UPDATE op één rij.
--
-- Contactnaam en e-mailadres gaan eruit; de sessiedata blijft bestaan, dan
-- zonder herleidbare persoon. Bedrijfsnaam blijft: dat is geen persoonsgegeven.
-- ---------------------------------------------------------------------------
drop function if exists public.anonymize_expired_prospects();
create function public.anonymize_expired_prospects()
returns int
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_months int := coalesce((public.app_setting('prospect_retention_months', '24'::jsonb))::text::int, 24);
  v_count  int;
begin
  with expired as (
    select distinct p.id
      from public.prospects p
      join public.demo_sessions s on s.prospect_id = p.id
     where p.anonymized_at is null
     group by p.id
    having max(s.closed_at) is not null
       and max(s.closed_at) < now() - make_interval(months => v_months)
       and count(*) filter (where s.status <> 'closed') = 0
  )
  update public.prospects p
     set contact_name = null,
         contact_email = null,
         anonymized_at = now()
    from expired e
   where p.id = e.id;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- EXECUTE-rechten
-- ---------------------------------------------------------------------------
-- Dit is de complete lijst van wat een niet-ingelogde bezoeker kan aanroepen.
-- Alles wat hier niet staat, is voor anon onbereikbaar.
-- ---------------------------------------------------------------------------
revoke all on function public.get_share_gate(text) from public;
revoke all on function public.request_shared_summary_access(text, text) from public;
revoke all on function public.get_shared_summary(text, text) from public;
revoke all on function public.create_session_share(uuid, jsonb, int) from public;
revoke all on function public.add_share_email(uuid, text) from public;
revoke all on function public.remove_share_email(uuid, text) from public;
revoke all on function public.anonymize_expired_prospects() from public;
revoke all on function public.register_share_attempt(text, text) from public;
revoke all on function public.email_may_access_share(uuid, text) from public;

grant execute on function public.get_share_gate(text)                        to anon, authenticated;
grant execute on function public.request_shared_summary_access(text, text)   to anon, authenticated;
grant execute on function public.get_shared_summary(text, text)              to anon, authenticated;

grant execute on function public.create_session_share(uuid, jsonb, int)      to authenticated;
grant execute on function public.add_share_email(uuid, text)                 to authenticated;
grant execute on function public.remove_share_email(uuid, text)              to authenticated;

-- register_share_attempt en email_may_access_share zijn interne stappen van de
-- functies hierboven; niemand roept ze rechtstreeks aan.
-- anonymize_expired_prospects draait als geplande taak onder service_role.
