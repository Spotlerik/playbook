-- ============================================================================
-- 0002_rls.sql — hulpfuncties, domeinregels, GRANTs en Row-Level Security
-- ============================================================================
-- Herhaalbaar: elke policy wordt eerst gedropt en dan opnieuw aangemaakt, dus
-- je kunt dit bestand zo vaak draaien als nodig terwijl je RLS bijstelt.
--
-- Uitgangspunt: deny by default. Geen enkele tabel is bereikbaar tot hij hier
-- expliciet wordt blootgesteld. `anon` krijgt op GEEN ENKELE tabel rechten —
-- de enige route naar buiten is de RPC in 0003.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Hulpfuncties
-- ---------------------------------------------------------------------------

-- is_manager() leest profiles, maar wordt óók gebruikt IN de policies op
-- profiles. Zonder security definer is dat oneindige recursie: de policy
-- roept de functie aan, de functie leest de tabel, de policy vuurt opnieuw.
-- Definer draait als eigenaar en slaat RLS over, wat de lus doorbreekt.
create or replace function public.is_manager(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid and p.role = 'manager'
  );
$$;

create or replace function public.domain_of(addr text)
returns text
language sql
immutable
as $$
  select case
    when addr is null then null
    when position('@' in addr) = 0 then null
    else lower(split_part(btrim(addr), '@', 2))
  end;
$$;

create or replace function public.is_valid_email(addr text)
returns boolean
language sql
immutable
as $$
  select addr is not null and addr ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$';
$$;

-- Vrije maildienst of wegwerpadres, uit de tabel zodat uitbreiden geen deploy
-- kost. Vergelijking altijd op kleine letters.
create or replace function public.is_blocked_domain(d text, only_kind text default null)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.blocked_domains b
    where b.domain = lower(btrim(d))
      and (only_kind is null or b.kind = only_kind)
  );
$$;

create or replace function public.is_disposable_domain(d text)
returns boolean
language sql
stable
as $$
  select public.is_blocked_domain(d, 'disposable');
$$;

-- Onze eigen domeinen. Als domeinregel geweigerd: bij één verkeerd ingevuld
-- contactadres zou anders iedere Spotler-medewerker elke samenvatting kunnen
-- openen. Als los adres mag het wel.
create or replace function public.is_own_domain(d text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.app_settings s,
         jsonb_array_elements_text(s.value) as own(domain)
    where s.key = 'own_domains'
      and lower(own.domain) = lower(btrim(d))
  );
$$;

-- De kernregel: een exact adres is één persoon, een domein is iedereen. Alleen
-- een echt bedrijfsdomein mag een domeinregel worden.
create or replace function public.domain_allowed_as_rule(d text)
returns boolean
language sql
stable
as $$
  select d is not null
     and btrim(d) <> ''
     and not public.is_blocked_domain(d)
     and not public.is_own_domain(d);
$$;

-- HARDE UITSLUITING, geen instelling. Deze blokken kunnen nooit gedeeld worden,
-- ook niet als included_blocks ze zou bevatten. Bewust hardgecodeerd en
-- IMMUTABLE: dit wijzigen hoort een migratie te zijn die je terugziet in de
-- geschiedenis, geen rij die een manager per ongeluk leeg kan maken.
--
-- 'pricing' hoort hier sinds de tweede ronde ook bij. Eerder was het "standaard
-- uit maar aan te zetten"; dat betekent dat één verkeerde klik genoeg is, en een
-- prijs in een link die blijft bestaan en doorgestuurd kan worden hoort er niet.
-- Wil een rep een prijs delen, dan stuurt hij een offerte.
create or replace function public.never_shareable_blocks()
returns text[]
language sql
immutable
as $$
  select array['internal_notes','rep_notes','coaching_notes','internal','pricing']::text[];
$$;

-- Eigenaarschap. Security definer zodat de RLS van de ene tabel niet die van
-- de andere hoeft te passeren — dat maakt policies onvoorspelbaar traag en
-- moeilijk te lezen.
create or replace function public.owns_session(p_session_id uuid, uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.demo_sessions s
    where s.id = p_session_id and s.rep_id = uid
  );
$$;

create or replace function public.owns_prospect(p_prospect_id uuid, uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.demo_sessions s
    where s.prospect_id = p_prospect_id and s.rep_id = uid
  ) or exists (
    select 1 from public.prospects p
    where p.id = p_prospect_id and p.created_by = uid
  );
$$;

create or replace function public.owns_share(p_share_id uuid, uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.session_shares sh
    join public.demo_sessions s on s.id = sh.session_id
    where sh.id = p_share_id and s.rep_id = uid
  );
$$;

-- Instellingen met een default, zodat een ontbrekende rij niets stukmaakt.
create or replace function public.app_setting(p_key text, p_default jsonb default null)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce((select s.value from public.app_settings s where s.key = p_key), p_default);
$$;

-- ---------------------------------------------------------------------------
-- 2. Validatietriggers
-- ---------------------------------------------------------------------------
-- Deze regels staan in de database en niet in de frontend, zodat een insert via
-- de API of via een tweede app ze ook niet kan omzeilen. Het zijn triggers en
-- geen CHECK-constraints omdat ze andere tabellen raadplegen — dat mag een
-- CHECK niet.
-- ---------------------------------------------------------------------------

create or replace function public.validate_session_share()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  addr        text;
  clean_blocks jsonb;
begin
  -- Domeinregel: leeg of een echt bedrijfsdomein. Nooit een vrije maildienst,
  -- een wegwerpdomein of een eigen domein.
  if new.allowed_domain is not null then
    new.allowed_domain := lower(btrim(new.allowed_domain));
    if new.allowed_domain = '' then
      new.allowed_domain := null;
    elsif not public.domain_allowed_as_rule(new.allowed_domain) then
      raise exception
        'allowed_domain % is niet toegestaan als domeinregel (vrije maildienst, wegwerpdomein of eigen domein). Voeg het exacte adres toe aan allowed_emails.',
        new.allowed_domain
        using errcode = 'check_violation';
    end if;
  end if;

  -- Losse adressen: elk adres mag, ook op een publiek domein — freelancers en
  -- zzp'ers werken vaak op gmail. Wegwerpadressen weigeren we ook als los
  -- adres: een prospect die een tijdelijk adres gebruikt om je samenvatting te
  -- openen is een signaal dat je niet wil faciliteren.
  if new.allowed_emails is not null then
    for addr in select lower(btrim(e)) from jsonb_array_elements_text(new.allowed_emails) as t(e)
    loop
      if not public.is_valid_email(addr) then
        raise exception 'ongeldig e-mailadres in allowed_emails: %', addr
          using errcode = 'check_violation';
      end if;
      if public.is_disposable_domain(public.domain_of(addr)) then
        raise exception 'wegwerpadres % is niet toegestaan', addr
          using errcode = 'check_violation';
      end if;
    end loop;
    -- genormaliseerd en ontdubbeld opslaan
    select coalesce(jsonb_agg(distinct lower(btrim(e))), '[]'::jsonb)
      into new.allowed_emails
      from jsonb_array_elements_text(new.allowed_emails) as t(e);
  end if;

  -- Structureel niet-deelbare blokken eruit, ongeacht wat de aanroeper stuurt.
  select coalesce(jsonb_agg(distinct b), '[]'::jsonb)
    into clean_blocks
    from jsonb_array_elements_text(new.included_blocks) as t(b)
   where b <> all (public.never_shareable_blocks());
  new.included_blocks := clean_blocks;

  -- Vervaldatum: de rep stelt hem in, standaard 90 dagen.
  if new.expires_at is null then
    new.expires_at := now() + make_interval(days =>
      coalesce((public.app_setting('share_default_expiry_days', '90'::jsonb))::text::int, 90));
  end if;

  return new;
end;
$$;

drop trigger if exists session_shares_validate on public.session_shares;
create trigger session_shares_validate
  before insert or update on public.session_shares
  for each row execute function public.validate_session_share();

create or replace function public.validate_trusted_domain()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  new.domain := lower(btrim(new.domain));
  -- Een whitelist met gmail.com erin heft de hele beveiliging op.
  if not public.domain_allowed_as_rule(new.domain) then
    raise exception
      'domein % kan geen vertrouwd domein worden (vrije maildienst, wegwerpdomein of eigen domein)',
      new.domain
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists trusted_domains_validate on public.trusted_domains;
create trigger trusted_domains_validate
  before insert or update on public.trusted_domains
  for each row execute function public.validate_trusted_domain();

-- Rechtenescalatie blokkeren: RLS is rij-niveau, niet kolom-niveau, dus zonder
-- deze trigger kan een rep die zijn eigen profielrij mag schrijven zichzelf
-- `role = 'manager'` geven en daarmee alles openzetten.
create or replace function public.guard_profile_update()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  new.email := lower(btrim(new.email));
  if public.is_manager() then
    return new;
  end if;
  if new.role is distinct from old.role then
    raise exception 'alleen een manager kan de rol wijzigen' using errcode = 'insufficient_privilege';
  end if;
  if new.team_id is distinct from old.team_id then
    raise exception 'alleen een manager kan het team wijzigen' using errcode = 'insufficient_privilege';
  end if;
  if new.email is distinct from old.email then
    raise exception 'alleen een manager kan het e-mailadres wijzigen' using errcode = 'insufficient_privilege';
  end if;
  if new.id is distinct from old.id then
    raise exception 'id is niet wijzigbaar' using errcode = 'insufficient_privilege';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_update on public.profiles;
create trigger profiles_guard_update
  before update on public.profiles
  for each row execute function public.guard_profile_update();

-- ---------------------------------------------------------------------------
-- 3. RLS aan op ALLE tabellen
-- ---------------------------------------------------------------------------
alter table public.teams                enable row level security;
alter table public.profiles             enable row level security;
alter table public.prospects            enable row level security;
alter table public.demo_sessions        enable row level security;
alter table public.session_shares       enable row level security;
alter table public.trusted_domains      enable row level security;
alter table public.blocked_domains      enable row level security;
alter table public.rep_tool_configs     enable row level security;
alter table public.product_owners       enable row level security;
alter table public.app_settings         enable row level security;
alter table public.share_access_grants  enable row level security;
alter table public.share_access_attempts enable row level security;

-- ---------------------------------------------------------------------------
-- 4. GRANTs — welke tabellen via de Data API bereikbaar zijn
-- ---------------------------------------------------------------------------
-- "Automatically expose new tables" staat UIT, dus zonder deze regels bestaat
-- er voor PostgREST niets. Dit blok IS de blootstellingslijst; wat hier niet
-- staat, is niet bereikbaar.
--
-- BLOOTGESTELD aan `authenticated`:
--   teams, profiles, prospects, demo_sessions, session_shares,
--   trusted_domains, blocked_domains, rep_tool_configs, product_owners,
--   app_settings
-- NIET blootgesteld (alleen bereikbaar via de functies in 0003):
--   share_access_grants, share_access_attempts
-- Aan `anon`: niets. Geen enkele tabel.
-- ---------------------------------------------------------------------------
revoke all on all tables in schema public from anon, authenticated;

grant select                         on public.teams            to authenticated;
grant insert, update, delete         on public.teams            to authenticated;
grant select, insert, update, delete on public.profiles         to authenticated;
grant select, insert, update, delete on public.prospects        to authenticated;
grant select, insert, update, delete on public.demo_sessions    to authenticated;
grant select, insert, update, delete on public.session_shares   to authenticated;
grant select, insert, update, delete on public.trusted_domains  to authenticated;
grant select, insert, update, delete on public.blocked_domains  to authenticated;
grant select, insert, update, delete on public.rep_tool_configs to authenticated;
grant select, insert, update, delete on public.product_owners   to authenticated;
grant select, insert, update, delete on public.app_settings     to authenticated;

-- share_access_grants en share_access_attempts krijgen bewust NIETS.
-- RLS staat aan en er zijn geen policies: zelfs met een grant zou er niets
-- doorheen komen, maar zonder grant bestaat de tabel niet eens voor de API.

-- Hulpfuncties zijn niet interessant om zelf aan te roepen; houd ze dicht.
revoke all on function public._ensure_constraint(text, text, text) from public;

-- ---------------------------------------------------------------------------
-- 5. Policies
-- ---------------------------------------------------------------------------
-- Alle policies zijn `to authenticated`. `anon` komt in geen enkele policy
-- voor, dus voor een niet-ingelogde bezoeker bestaat er geen rij.
-- ---------------------------------------------------------------------------

-- teams — rep leest, manager schrijft
drop policy if exists teams_select on public.teams;
create policy teams_select on public.teams
  for select to authenticated using (true);

drop policy if exists teams_insert on public.teams;
create policy teams_insert on public.teams
  for insert to authenticated with check (public.is_manager());

drop policy if exists teams_update on public.teams;
create policy teams_update on public.teams
  for update to authenticated using (public.is_manager()) with check (public.is_manager());

drop policy if exists teams_delete on public.teams;
create policy teams_delete on public.teams
  for delete to authenticated using (public.is_manager());

-- profiles — iedereen ingelogd leest alle rijen (teampagina, ranglijsten);
-- schrijven alleen de eigen rij, met de guard-trigger tegen rolwijziging.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated using (true);

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert to authenticated with check (public.is_manager());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_manager())
  with check (id = auth.uid() or public.is_manager());

drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete on public.profiles
  for delete to authenticated using (public.is_manager());

-- prospects — rep via de eigen sessie, manager leest alles
drop policy if exists prospects_select on public.prospects;
create policy prospects_select on public.prospects
  for select to authenticated
  using (public.is_manager() or public.owns_prospect(id));

-- Insert is bewust ruim: de prospect wordt aangemaakt vóór de sessie die
-- ernaar verwijst, dus op dat moment bestaat de eigendomsrelatie nog niet.
-- created_by (default auth.uid()) legt hem alsnog vast, en de WITH CHECK zorgt
-- dat niemand een rij op naam van een ander kan zetten.
drop policy if exists prospects_insert on public.prospects;
create policy prospects_insert on public.prospects
  for insert to authenticated
  with check (created_by is null or created_by = auth.uid());

drop policy if exists prospects_update on public.prospects;
create policy prospects_update on public.prospects
  for update to authenticated
  using (public.owns_prospect(id))
  with check (public.owns_prospect(id));

drop policy if exists prospects_delete on public.prospects;
create policy prospects_delete on public.prospects
  for delete to authenticated using (public.owns_prospect(id));

-- demo_sessions — rep volledige rechten op eigen rijen, manager leest alles
drop policy if exists demo_sessions_select on public.demo_sessions;
create policy demo_sessions_select on public.demo_sessions
  for select to authenticated
  using (rep_id = auth.uid() or public.is_manager());

drop policy if exists demo_sessions_insert on public.demo_sessions;
create policy demo_sessions_insert on public.demo_sessions
  for insert to authenticated with check (rep_id = auth.uid());

-- Let op: een manager mag lezen, niet schrijven. Coachen is niet hetzelfde als
-- de sessie van een ander aanpassen.
drop policy if exists demo_sessions_update on public.demo_sessions;
create policy demo_sessions_update on public.demo_sessions
  for update to authenticated
  using (rep_id = auth.uid()) with check (rep_id = auth.uid());

drop policy if exists demo_sessions_delete on public.demo_sessions;
create policy demo_sessions_delete on public.demo_sessions
  for delete to authenticated using (rep_id = auth.uid());

-- session_shares — rep volledige rechten op shares van eigen sessies,
-- manager leest alles. Managers voegen adressen toe via add_share_email()
-- (0003) en niet via een UPDATE-policy: RLS is rij-niveau, dus een
-- schrijfrecht op de rij zou ook included_blocks en expires_at openzetten.
drop policy if exists session_shares_select on public.session_shares;
create policy session_shares_select on public.session_shares
  for select to authenticated
  using (public.owns_session(session_id) or public.is_manager());

drop policy if exists session_shares_insert on public.session_shares;
create policy session_shares_insert on public.session_shares
  for insert to authenticated with check (public.owns_session(session_id));

drop policy if exists session_shares_update on public.session_shares;
create policy session_shares_update on public.session_shares
  for update to authenticated
  using (public.owns_session(session_id)) with check (public.owns_session(session_id));

drop policy if exists session_shares_delete on public.session_shares;
create policy session_shares_delete on public.session_shares
  for delete to authenticated using (public.owns_session(session_id));

-- trusted_domains — rep leest, manager beheert
drop policy if exists trusted_domains_select on public.trusted_domains;
create policy trusted_domains_select on public.trusted_domains
  for select to authenticated using (true);

drop policy if exists trusted_domains_insert on public.trusted_domains;
create policy trusted_domains_insert on public.trusted_domains
  for insert to authenticated with check (public.is_manager());

drop policy if exists trusted_domains_update on public.trusted_domains;
create policy trusted_domains_update on public.trusted_domains
  for update to authenticated using (public.is_manager()) with check (public.is_manager());

drop policy if exists trusted_domains_delete on public.trusted_domains;
create policy trusted_domains_delete on public.trusted_domains
  for delete to authenticated using (public.is_manager());

-- blocked_domains — rep leest, manager beheert
drop policy if exists blocked_domains_select on public.blocked_domains;
create policy blocked_domains_select on public.blocked_domains
  for select to authenticated using (true);

drop policy if exists blocked_domains_insert on public.blocked_domains;
create policy blocked_domains_insert on public.blocked_domains
  for insert to authenticated with check (public.is_manager());

drop policy if exists blocked_domains_update on public.blocked_domains;
create policy blocked_domains_update on public.blocked_domains
  for update to authenticated using (public.is_manager()) with check (public.is_manager());

drop policy if exists blocked_domains_delete on public.blocked_domains;
create policy blocked_domains_delete on public.blocked_domains
  for delete to authenticated using (public.is_manager());

-- rep_tool_configs — rep volledige rechten op eigen rijen, manager leest alles
drop policy if exists rep_tool_configs_select on public.rep_tool_configs;
create policy rep_tool_configs_select on public.rep_tool_configs
  for select to authenticated
  using (rep_id = auth.uid() or public.is_manager());

drop policy if exists rep_tool_configs_insert on public.rep_tool_configs;
create policy rep_tool_configs_insert on public.rep_tool_configs
  for insert to authenticated with check (rep_id = auth.uid());

drop policy if exists rep_tool_configs_update on public.rep_tool_configs;
create policy rep_tool_configs_update on public.rep_tool_configs
  for update to authenticated
  using (rep_id = auth.uid()) with check (rep_id = auth.uid());

drop policy if exists rep_tool_configs_delete on public.rep_tool_configs;
create policy rep_tool_configs_delete on public.rep_tool_configs
  for delete to authenticated using (rep_id = auth.uid());

-- product_owners — iedereen ingelogd leest, manager schrijft
drop policy if exists product_owners_select on public.product_owners;
create policy product_owners_select on public.product_owners
  for select to authenticated using (true);

drop policy if exists product_owners_insert on public.product_owners;
create policy product_owners_insert on public.product_owners
  for insert to authenticated with check (public.is_manager());

drop policy if exists product_owners_update on public.product_owners;
create policy product_owners_update on public.product_owners
  for update to authenticated using (public.is_manager()) with check (public.is_manager());

drop policy if exists product_owners_delete on public.product_owners;
create policy product_owners_delete on public.product_owners
  for delete to authenticated using (public.is_manager());

-- app_settings — iedereen ingelogd leest, alleen managers schrijven
drop policy if exists app_settings_select on public.app_settings;
create policy app_settings_select on public.app_settings
  for select to authenticated using (true);

drop policy if exists app_settings_insert on public.app_settings;
create policy app_settings_insert on public.app_settings
  for insert to authenticated with check (public.is_manager());

drop policy if exists app_settings_update on public.app_settings;
create policy app_settings_update on public.app_settings
  for update to authenticated using (public.is_manager()) with check (public.is_manager());

drop policy if exists app_settings_delete on public.app_settings;
create policy app_settings_delete on public.app_settings
  for delete to authenticated using (public.is_manager());

-- share_access_grants en share_access_attempts: RLS aan, GEEN policies.
-- Deny by default betekent hier letterlijk: niemand, nooit, behalve de
-- security-definer functies in 0003.
