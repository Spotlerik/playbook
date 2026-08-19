#!/usr/bin/env node
// ============================================================================
// test-rls.mjs — RLS testen zoals de browser hem tegenkomt
// ============================================================================
// supabase/tests/rls.sql test de policies in de database. Dit script test iets
// anders en aanvullends: of PostgREST + de policies + de anon key SAMEN
// dichtzitten. Twee echte clients met de PUBLIEKE anon key, allebei echt
// ingelogd, precies zoals de frontend het doet.
//
// Dit is de test die moet slagen voordat de anon key in de repo mag.
//
// Draaien:
//   cd scripts && npm install
//   SUPABASE_URL=... SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=... node test-rls.mjs
//
// De service_role key wordt alleen gebruikt om de testgebruikers aan te maken
// en achteraf op te ruimen — nooit voor de assertions zelf. De echte accounts
// worden niet aangeraakt.
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

function loadEnvFile() {
  const path = join(HERE, '.env');
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnvFile();

const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Ontbrekend: SUPABASE_URL, SUPABASE_ANON_KEY en SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SUFFIX = randomBytes(4).toString('hex');
const PASSWORD = randomBytes(24).toString('base64url');
const people = {
  a: { email: `rls-test-a-${SUFFIX}@example.test`, name: 'RLS Test A', role: 'rep' },
  b: { email: `rls-test-b-${SUFFIX}@example.test`, name: 'RLS Test B', role: 'rep' },
  m: { email: `rls-test-m-${SUFFIX}@example.test`, name: 'RLS Test M', role: 'manager' },
};

let passed = 0;
const failures = [];

function check(label, condition, detail = '') {
  if (condition) {
    passed++;
    console.log(`  ok    ${label}`);
  } else {
    failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

// Een geweigerde lees-actie levert in PostgREST geen fout op maar een lege
// resultset — dat is precies het gedrag dat we willen bewijzen.
function readsNothing(label, { data, error }) {
  check(label, !error && Array.isArray(data) && data.length === 0,
    error ? `fout: ${error.message}` : `${data?.length} rij(en) zichtbaar`);
}

// Een geweigerde schrijfactie levert óf een fout (42501 / policy violation) óf
// nul geraakte rijen. Beide zijn goed; wat níet mag is dat de rij verandert.
function writesNothing(label, { data, error }) {
  check(label, !!error || (Array.isArray(data) && data.length === 0),
    'de schrijfactie is doorgekomen');
}

async function main() {
  console.log(`Supabase: ${SUPABASE_URL}\n`);
  const ids = {};
  const clients = {};

  try {
    // ---- opzet met service_role -------------------------------------------
    console.log('opzet…');
    const { data: team, error: teamErr } = await admin
      .from('teams').upsert({ name: `RLS-test ${SUFFIX}`, market: 'NL' }, { onConflict: 'name' })
      .select('id').single();
    if (teamErr) throw teamErr;

    for (const [key, p] of Object.entries(people)) {
      const { data, error } = await admin.auth.admin.createUser({
        email: p.email, password: PASSWORD, email_confirm: true,
      });
      if (error) throw error;
      ids[key] = data.user.id;
      const { error: pErr } = await admin.from('profiles').insert({
        id: data.user.id, full_name: p.name, email: p.email, role: p.role, team_id: team.id,
      });
      if (pErr) throw pErr;
    }

    const { data: prospects, error: prErr } = await admin.from('prospects').insert([
      { company: 'Klant A BV', contact_name: 'Contact A', contact_email: 'contact@klant-a.test', created_by: ids.a },
      { company: 'Klant B BV', contact_name: 'Contact B', contact_email: 'contact@klant-b.test', created_by: ids.b },
    ]).select('id');
    if (prErr) throw prErr;
    ids.pa = prospects[0].id;
    ids.pb = prospects[1].id;

    const { data: sessions, error: sErr } = await admin.from('demo_sessions').insert([
      { rep_id: ids.a, prospect_id: ids.pa, state: { blocks: { summary: 'A' } } },
      { rep_id: ids.b, prospect_id: ids.pb, state: { blocks: { summary: 'B' } } },
    ]).select('id');
    if (sErr) throw sErr;
    ids.sa = sessions[0].id;
    ids.sb = sessions[1].id;

    const { data: shares, error: shErr } = await admin.from('session_shares').insert([
      { session_id: ids.sa, token: `tok-a-${SUFFIX}`, included_blocks: ['summary'], allowed_domain: 'klant-a.test' },
      { session_id: ids.sb, token: `tok-b-${SUFFIX}`, included_blocks: ['summary'], allowed_domain: 'klant-b.test' },
    ]).select('id');
    if (shErr) throw shErr;
    ids.sha = shares[0].id;
    ids.shb = shares[1].id;

    await admin.from('rep_tool_configs').insert([
      { rep_id: ids.a, kind: 'pricing', config: { marge: 10 } },
      { rep_id: ids.b, kind: 'pricing', config: { marge: 20 } },
    ]);

    // ---- inloggen met de PUBLIEKE anon key --------------------------------
    for (const key of ['a', 'b', 'm']) {
      clients[key] = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { error } = await clients[key].auth.signInWithPassword({
        email: people[key].email, password: PASSWORD,
      });
      if (error) throw new Error(`inloggen als ${key} mislukt: ${error.message}`);
    }
    clients.anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const A = clients.a, M = clients.m, ANON = clients.anon;

    // ---- rep A vs rep B ---------------------------------------------------
    console.log('\nrep A tegen de data van rep B');
    readsNothing('sessie van rep B is onzichtbaar',
      await A.from('demo_sessions').select('*').eq('id', ids.sb));
    check('rep A ziet uitsluitend de eigen sessie',
      (await A.from('demo_sessions').select('id')).data?.length === 1);
    writesNothing('sessie van rep B is niet te wijzigen',
      await A.from('demo_sessions').update({ icp: 'gekaapt' }).eq('id', ids.sb).select());
    writesNothing('sessie van rep B is niet te verwijderen',
      await A.from('demo_sessions').delete().eq('id', ids.sb).select());
    writesNothing('sessie aanmaken op naam van rep B faalt',
      await A.from('demo_sessions').insert({ rep_id: ids.b }).select());

    readsNothing('prospect van rep B is onzichtbaar',
      await A.from('prospects').select('*').eq('id', ids.pb));
    writesNothing('prospect van rep B is niet te wijzigen',
      await A.from('prospects').update({ contact_email: 'x@y.test' }).eq('id', ids.pb).select());

    readsNothing('share van rep B is onzichtbaar',
      await A.from('session_shares').select('*').eq('id', ids.shb));
    writesNothing('share van rep B is niet te wijzigen',
      await A.from('session_shares').update({ revoked_at: null }).eq('id', ids.shb).select());

    const addToB = await A.rpc('add_share_email', { p_share_id: ids.shb, p_email: 'indringer@partner.test' });
    check('adres toevoegen aan de share van rep B faalt', !!addToB.error);

    readsNothing('tool-config van rep B is onzichtbaar',
      await A.from('rep_tool_configs').select('*').eq('rep_id', ids.b));

    // ---- profielen en rechtenescalatie ------------------------------------
    console.log('\nprofielen');
    check('rep A leest wel alle profielen (teampagina, ranglijsten)',
      ((await A.from('profiles').select('id')).data?.length ?? 0) >= 3);
    writesNothing('profiel van rep B is niet te wijzigen',
      await A.from('profiles').update({ full_name: 'Gekaapt' }).eq('id', ids.b).select());
    writesNothing('rep A kan zichzelf geen manager maken',
      await A.from('profiles').update({ role: 'manager' }).eq('id', ids.a).select());

    const stillRep = await admin.from('profiles').select('role').eq('id', ids.a).single();
    check('rol van rep A is daadwerkelijk onveranderd', stillRep.data?.role === 'rep',
      `rol is nu ${stillRep.data?.role}`);

    // ---- beheertabellen ---------------------------------------------------
    console.log('\nbeheertabellen');
    writesNothing('rep A kan geen vertrouwd domein toevoegen',
      await A.from('trusted_domains').insert({ domain: `rep-a-${SUFFIX}.test` }).select());
    writesNothing('rep A kan de bewaartermijn niet wijzigen',
      await A.from('app_settings').update({ value: 1 }).eq('key', 'prospect_retention_months').select());
    writesNothing('rep A kan geen producteigenaar toevoegen',
      await A.from('product_owners').insert({ product: `Verzonnen ${SUFFIX}` }).select());

    const grantsA = await A.from('share_access_grants').select('*');
    check('share_access_grants is niet blootgesteld', !!grantsA.error);
    const attemptsA = await A.from('share_access_attempts').select('*');
    check('share_access_attempts is niet blootgesteld', !!attemptsA.error);

    // ---- eigen rijen moeten juist wél werken ------------------------------
    console.log('\neigen rijen van rep A');
    check('rep A schrijft de eigen sessie',
      !(await A.from('demo_sessions').update({ icp: 'retail' }).eq('id', ids.sa).select()).error);
    check('rep A voegt een adres toe aan de eigen share',
      !(await A.rpc('add_share_email', { p_share_id: ids.sha, p_email: 'partner@adviesbureau.test' })).error);

    // ---- manager ----------------------------------------------------------
    console.log('\nmanager');
    check('manager leest alle sessies',
      ((await M.from('demo_sessions').select('id')).data?.length ?? 0) >= 2);
    writesNothing('manager schrijft de sessie van een rep niet',
      await M.from('demo_sessions').update({ icp: 'door-manager' }).eq('id', ids.sb).select());
    check('manager voegt wel een adres toe aan elke share',
      !(await M.rpc('add_share_email', { p_share_id: ids.sha, p_email: 'manager@partner.test' })).error);
    check('manager kan gmail.com niet als vertrouwd domein toevoegen',
      !!(await M.from('trusted_domains').insert({ domain: 'gmail.com' }).select()).error);
    check('manager kan spotler.com niet als vertrouwd domein toevoegen',
      !!(await M.from('trusted_domains').insert({ domain: 'spotler.com' }).select()).error);

    // ---- anoniem ----------------------------------------------------------
    console.log('\nanoniem, met dezelfde publieke anon key');
    for (const table of ['profiles', 'teams', 'demo_sessions', 'prospects', 'session_shares',
                         'trusted_domains', 'blocked_domains', 'rep_tool_configs',
                         'product_owners', 'app_settings']) {
      const res = await ANON.from(table).select('*').limit(1);
      check(`anon komt niet bij ${table}`, !!res.error || res.data?.length === 0,
        `${res.data?.length} rij(en) zichtbaar`);
    }

    const anonSummary = await ANON.rpc('get_shared_summary', { share_token: `tok-a-${SUFFIX}` });
    check('anon krijgt geen samenvatting zonder geverifieerd adres',
      !anonSummary.error && anonSummary.data === null);

    const anonRequest = await ANON.rpc('request_shared_summary_access', {
      share_token: `tok-a-${SUFFIX}`, recipient_email: 'buitenstaander@ergens.test',
    });
    const anonRequestUnknown = await ANON.rpc('request_shared_summary_access', {
      share_token: 'onbekend-token', recipient_email: 'buitenstaander@ergens.test',
    });
    check('onbekend token en geweigerd adres geven hetzelfde antwoord',
      JSON.stringify(anonRequest.data) === JSON.stringify(anonRequestUnknown.data));

  } finally {
    // ---- opruimen ---------------------------------------------------------
    console.log('\nopruimen…');
    await admin.from('session_shares').delete().in('id', [ids.sha, ids.shb].filter(Boolean));
    await admin.from('rep_tool_configs').delete().in('rep_id', [ids.a, ids.b].filter(Boolean));
    await admin.from('demo_sessions').delete().in('id', [ids.sa, ids.sb].filter(Boolean));
    await admin.from('prospects').delete().in('id', [ids.pa, ids.pb].filter(Boolean));
    await admin.from('product_owners').delete().like('product', `%${SUFFIX}`);
    await admin.from('trusted_domains').delete().like('domain', `%${SUFFIX}%`);
    for (const key of ['a', 'b', 'm']) {
      if (ids[key]) await admin.auth.admin.deleteUser(ids[key]); // profiles volgt via cascade
    }
    await admin.from('teams').delete().eq('name', `RLS-test ${SUFFIX}`);
  }

  console.log(`\n${passed} geslaagd, ${failures.length} gefaald.`);
  if (failures.length) {
    console.error('\nNIET DEPLOYEN. De volgende controles faalden:');
    failures.forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
  }
  console.log('Alles dicht. De anon key mag naar de frontend.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
