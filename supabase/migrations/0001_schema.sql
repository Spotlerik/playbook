-- ============================================================================
-- 0001_schema.sql — Spotler Playbook / Demo Studio, gedeeld datamodel
-- ============================================================================
-- Herhaalbaar (idempotent): elke run is veilig. `create table if not exists`,
-- constraints via DO-blokken, functies via `create or replace`. Zo kun je RLS
-- bijstellen zonder het schema te laten vallen.
--
-- Dit bestand definieert ALLEEN structuur. RLS staat in 0002, de gedeelde
-- samenvatting in 0003, referentiedata in 0004.
--
-- LET OP — projectinstellingen: "Automatically expose new tables" staat UIT en
-- "Enable automatic RLS" staat AAN. Nieuwe tabellen zijn dus niet vanzelf via
-- de Data API bereikbaar. De expliciete GRANTs staan in 0002, samen met de
-- policies die ze afdekken. Grant en policy horen bij elkaar; ze staan daarom
-- in hetzelfde bestand.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Hulpje: constraint toevoegen zonder te klappen als hij er al is.
-- ---------------------------------------------------------------------------
create or replace function public._ensure_constraint(
  p_table text,
  p_name  text,
  p_definition text
) returns void
language plpgsql
as $$
begin
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public' and t.relname = p_table and c.conname = p_name
  ) then
    execute format('alter table public.%I add constraint %I %s', p_table, p_name, p_definition);
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- teams — markten, zodat DACH en UK later zonder verbouwing kunnen
-- ---------------------------------------------------------------------------
create table if not exists public.teams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  market      text not null,
  created_at  timestamptz not null default now()
);

select public._ensure_constraint('teams', 'teams_market_check',
  $$check (market in ('NL','DACH','UK'))$$);
select public._ensure_constraint('teams', 'teams_name_key', $$unique (name)$$);

-- ---------------------------------------------------------------------------
-- profiles — gebruikers; id verwijst naar auth.users
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  full_name         text not null,
  email             text not null unique,
  role              text not null,
  team_id           uuid references public.teams(id),
  hubspot_owner_id  text,
  jiminny_user_id   text,
  created_at        timestamptz not null default now()
);

select public._ensure_constraint('profiles', 'profiles_role_check',
  $$check (role in ('rep','manager'))$$);
-- E-mail altijd kleine letters: twee domeinen (@spotler.com / @spotler.nl) en
-- hoofdlettervarianten zouden anders langs de unique-index glippen.
select public._ensure_constraint('profiles', 'profiles_email_lowercase_check',
  $$check (email = lower(email))$$);

create index if not exists profiles_team_id_idx on public.profiles (team_id);
create index if not exists profiles_role_idx on public.profiles (role);

-- ---------------------------------------------------------------------------
-- prospects — derdengegevens, bewust APART van demo_sessions
-- ---------------------------------------------------------------------------
-- Bedrijfsnaam, contactnaam en e-mailadres zijn gegevens van iemand anders en
-- vallen onder een bewaartermijn die wij niet zelf bepalen. Door ze hier te
-- isoleren is opschonen straks één UPDATE op deze tabel; de sessiedata, de
-- tool-state en alle statistiek blijven intact. Hadden ze in demo_sessions
-- gezeten, dan was elke wijziging van de bewaartermijn een migratie geweest.
-- ---------------------------------------------------------------------------
create table if not exists public.prospects (
  id             uuid primary key default gen_random_uuid(),
  company        text,
  contact_name   text,
  contact_email  text,
  created_at     timestamptz not null default now(),
  -- Toevoeging op het brief-schema, om twee redenen. Praktisch: een prospect
  -- wordt aangemaakt vóór de sessie die ernaar verwijst, dus tussen die twee
  -- inserts is er geen andere manier om eigenaarschap vast te stellen voor RLS.
  -- Inhoudelijk: bij derdengegevens wil je kunnen beantwoorden wie ze heeft
  -- ingevoerd.
  created_by     uuid references public.profiles(id) default auth.uid(),
  -- gevuld zodra de bewaartermijn is toegepast; sessiedata blijft, persoon niet
  anonymized_at  timestamptz
);

-- kolom nagroeien op een database waar 0001 al eens gedraaid heeft
alter table public.prospects add column if not exists created_by uuid references public.profiles(id) default auth.uid();
alter table public.prospects add column if not exists anonymized_at timestamptz;

-- ---------------------------------------------------------------------------
-- demo_sessions — één rij per demo-sessie
-- ---------------------------------------------------------------------------
create table if not exists public.demo_sessions (
  id            uuid primary key default gen_random_uuid(),
  rep_id        uuid not null references public.profiles(id),
  prospect_id   uuid references public.prospects(id),
  status        text not null default 'in_progress',
  language      text,
  currency      text,
  icp           text,
  screens       jsonb,
  -- het volledige toolstate-object, precies zoals de demo studio het nu al in
  -- localStorage schrijft. Normaliseren voordat je weet welke velden je
  -- bevraagt is werk zonder afnemer.
  state         jsonb not null default '{}'::jsonb,
  current_step  int,
  max_reached   int,
  view          text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- moment waarop de sessie is afgesloten; startpunt van de bewaartermijn
  closed_at     timestamptz
);

select public._ensure_constraint('demo_sessions', 'demo_sessions_status_check',
  $$check (status in ('in_progress','closed'))$$);

create index if not exists demo_sessions_rep_id_idx on public.demo_sessions (rep_id);
create index if not exists demo_sessions_prospect_id_idx on public.demo_sessions (prospect_id);
create index if not exists demo_sessions_closed_at_idx on public.demo_sessions (closed_at)
  where closed_at is not null;

-- ---------------------------------------------------------------------------
-- session_shares — deelbare samenvattingslinks
-- ---------------------------------------------------------------------------
create table if not exists public.session_shares (
  id                uuid primary key default gen_random_uuid(),
  session_id        uuid not null references public.demo_sessions(id) on delete cascade,
  token             text not null unique,
  included_blocks   jsonb not null,
  allowed_domain    text,
  allowed_emails    jsonb not null default '[]'::jsonb,
  expires_at        timestamptz,
  revoked_at        timestamptz,
  view_count        int not null default 0,
  created_at        timestamptz not null default now()
);

select public._ensure_constraint('session_shares', 'session_shares_blocks_is_array',
  $$check (jsonb_typeof(included_blocks) = 'array')$$);
select public._ensure_constraint('session_shares', 'session_shares_emails_is_array',
  $$check (jsonb_typeof(allowed_emails) = 'array')$$);
select public._ensure_constraint('session_shares', 'session_shares_domain_lowercase',
  $$check (allowed_domain is null or allowed_domain = lower(allowed_domain))$$);

create index if not exists session_shares_session_id_idx on public.session_shares (session_id);

-- ---------------------------------------------------------------------------
-- trusted_domains — vaste domeinen, beheerd door managers
-- ---------------------------------------------------------------------------
create table if not exists public.trusted_domains (
  id          uuid primary key default gen_random_uuid(),
  domain      text not null unique,
  label       text,
  added_by    uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);

select public._ensure_constraint('trusted_domains', 'trusted_domains_lowercase',
  $$check (domain = lower(domain))$$);

-- ---------------------------------------------------------------------------
-- blocked_domains — publieke/vrije maildomeinen die nooit een domeinregel mogen
-- worden. In de tabel en niet in code, zodat uitbreiden geen deploy kost.
-- ---------------------------------------------------------------------------
create table if not exists public.blocked_domains (
  id      uuid primary key default gen_random_uuid(),
  domain  text not null unique,
  kind    text not null
);

select public._ensure_constraint('blocked_domains', 'blocked_domains_kind_check',
  $$check (kind in ('free','disposable'))$$);
select public._ensure_constraint('blocked_domains', 'blocked_domains_lowercase',
  $$check (domain = lower(domain))$$);

-- ---------------------------------------------------------------------------
-- rep_tool_configs — pricing- en cssgen-configuratie van de rep
-- ---------------------------------------------------------------------------
create table if not exists public.rep_tool_configs (
  id          uuid primary key default gen_random_uuid(),
  rep_id      uuid not null references public.profiles(id),
  kind        text not null,
  config      jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

select public._ensure_constraint('rep_tool_configs', 'rep_tool_configs_kind_check',
  $$check (kind in ('pricing','cssgen'))$$);
-- één config per rep per soort — anders is "de" pricing-config van een rep
-- ambigu en moet elke lezer een keuzeregel verzinnen
select public._ensure_constraint('rep_tool_configs', 'rep_tool_configs_rep_kind_key',
  $$unique (rep_id, kind)$$);

-- ---------------------------------------------------------------------------
-- product_owners — vervangt de hardgecodeerde OWNER_ROWS in de bundle
-- ---------------------------------------------------------------------------
-- Stond als lijst met echte namen in index.html, in een publieke repo. Zelfde
-- probleem als de rep-dataset, dus in dezelfde slag hierheen.
-- owner_name is vrije tekst omdat niet elke eigenaar een playbook-account heeft
-- (Harry, Jasper Werkman); owner_profile_id koppelt door als dat wel zo is.
-- ---------------------------------------------------------------------------
create table if not exists public.product_owners (
  id                uuid primary key default gen_random_uuid(),
  product           text not null unique,
  owner_name        text,
  owner_profile_id  uuid references public.profiles(id),
  notes             text,
  sort_order        int not null default 0,
  created_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- app_settings — één plek voor waarden die zonder deploy moeten kunnen wijzigen
-- ---------------------------------------------------------------------------
-- De bewaartermijn hoort hier en nergens anders: zodra Spotler de termijn uit
-- HubSpot doorgeeft, is dat een UPDATE en geen code-wijziging op vijf plekken.
-- ---------------------------------------------------------------------------
create table if not exists public.app_settings (
  key         text primary key,
  value       jsonb not null,
  description text,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references public.profiles(id)
);

-- ---------------------------------------------------------------------------
-- share_access_grants — geverifieerde toegang tot één samenvatting
-- ---------------------------------------------------------------------------
-- De ontvanger logt niet in. Hij vult zijn adres in, krijgt (als het adres op
-- de toegangslijst staat) een mail met een grant-token, en dat token geeft
-- toegang tot uitsluitend die ene share.
-- ---------------------------------------------------------------------------
create table if not exists public.share_access_grants (
  id           uuid primary key default gen_random_uuid(),
  share_id     uuid not null references public.session_shares(id) on delete cascade,
  email        text not null,
  grant_token  text not null unique,
  expires_at   timestamptz not null,
  consumed_at  timestamptz,
  created_at   timestamptz not null default now()
);

select public._ensure_constraint('share_access_grants', 'share_access_grants_email_lowercase',
  $$check (email = lower(email))$$);

create index if not exists share_access_grants_share_id_idx on public.share_access_grants (share_id);

-- ---------------------------------------------------------------------------
-- share_access_attempts — grondstof voor rate limiting
-- ---------------------------------------------------------------------------
-- Alleen de security-definer functies schrijven hier; niemand heeft er GRANTs
-- op. Bewust géén FK naar session_shares: een poging op een onbekend token moet
-- ook geteld worden, anders is het token-raden juist ongelimiteerd.
-- ---------------------------------------------------------------------------
create table if not exists public.share_access_attempts (
  id          bigserial primary key,
  token_hash  text not null,
  kind        text not null,
  created_at  timestamptz not null default now()
);

select public._ensure_constraint('share_access_attempts', 'share_access_attempts_kind_check',
  $$check (kind in ('request','view'))$$);

create index if not exists share_access_attempts_lookup_idx
  on public.share_access_attempts (token_hash, kind, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at bijhouden
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists demo_sessions_touch_updated_at on public.demo_sessions;
create trigger demo_sessions_touch_updated_at
  before update on public.demo_sessions
  for each row execute function public.touch_updated_at();

drop trigger if exists rep_tool_configs_touch_updated_at on public.rep_tool_configs;
create trigger rep_tool_configs_touch_updated_at
  before update on public.rep_tool_configs
  for each row execute function public.touch_updated_at();

drop trigger if exists app_settings_touch_updated_at on public.app_settings;
create trigger app_settings_touch_updated_at
  before update on public.app_settings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- demo_sessions.closed_at automatisch zetten/wissen op statuswissel
-- ---------------------------------------------------------------------------
-- De bewaartermijn rekent vanaf afsluiting, dus closed_at mag niet afhangen van
-- de discipline van de aanroeper.
-- ---------------------------------------------------------------------------
create or replace function public.demo_sessions_sync_closed_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'closed' and new.closed_at is null then
    new.closed_at := now();
  elsif new.status <> 'closed' then
    new.closed_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists demo_sessions_sync_closed_at on public.demo_sessions;
create trigger demo_sessions_sync_closed_at
  before insert or update on public.demo_sessions
  for each row execute function public.demo_sessions_sync_closed_at();
