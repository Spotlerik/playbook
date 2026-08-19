#!/usr/bin/env node
// ============================================================================
// create-users.mjs — accounts aanmaken zonder dat er één mail uitgaat
// ============================================================================
// Draaien:
//   cd scripts && npm install
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node create-users.mjs
// of zet die twee in scripts/.env (staat in .gitignore).
//
// GEEN MAIL. Dat is geen bijeffect maar de reden dat dit script bestaat:
//
//   admin.createUser({ email_confirm: true })  -> verstuurt NIETS
//   admin.inviteUserByEmail()                  -> verstuurt WEL een mail
//   admin.generateLink()                       -> verstuurt WEL een mail
//   auth.signUp()                              -> verstuurt WEL een mail
//
// Alleen de eerste komt in dit script voor. Erik bepaalt zelf wanneer mensen
// bericht krijgen.
//
// IDEMPOTENT. Een tweede run doet niets dubbel:
//   - bestaat het auth-account al (bijvoorbeeld handmatig in het dashboard
//     aangemaakt met Auto Confirm User), dan wordt het hergebruikt en alleen
//     het profiel bijgewerkt;
//   - bestaat het niet, dan wordt het aangemaakt met een tijdelijk wachtwoord.
// Daardoor is dit ook het script voor iemand die er later bij komt: zet hem in
// roster.mjs en draai opnieuw.
//
// De service_role key hoort NOOIT in de frontend en nooit in de repo. Hij staat
// hier in een omgevingsvariabele en verlaat je machine niet.
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROSTER, TEAM } from './roster.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

// Piepklein .env-lezertje, zodat er geen extra dependency voor nodig is.
function loadEnvFile() {
  const path = join(HERE, '.env');
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnvFile();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Ontbrekend: SUPABASE_URL en/of SUPABASE_SERVICE_ROLE_KEY.');
  console.error('Zet ze in scripts/.env of geef ze mee op de commandoregel.');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Tijdelijk wachtwoord: 24 bytes echte entropie. Niet afgeleid van naam of
// e-mail, want dan is het geen wachtwoord maar een formule.
function tempPassword() {
  return randomBytes(24).toString('base64url');
}

// admin.listUsers() pagineert; met 14 gebruikers is één pagina genoeg, maar het
// script moet ook kloppen als het team groeit.
async function fetchAllUsers() {
  const byEmail = new Map();
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    for (const u of data.users) byEmail.set(u.email.toLowerCase(), u);
    if (data.users.length < 200) break;
  }
  return byEmail;
}

async function ensureTeam() {
  const { data: existing, error: selErr } = await admin
    .from('teams').select('id').eq('name', TEAM.name).maybeSingle();
  if (selErr) throw selErr;
  if (existing) return existing.id;

  const { data, error } = await admin
    .from('teams').insert({ name: TEAM.name, market: TEAM.market }).select('id').single();
  if (error) throw error;
  console.log(`  team aangemaakt: ${TEAM.name}`);
  return data.id;
}

async function main() {
  console.log(`Supabase: ${SUPABASE_URL}`);
  const teamId = await ensureTeam();
  const existingUsers = await fetchAllUsers();

  const created = [];
  let reused = 0;

  for (const person of ROSTER) {
    const email = person.email.trim().toLowerCase();
    let user = existingUsers.get(email);

    if (user) {
      reused++;
    } else {
      const password = tempPassword();
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        // Hierdoor gaat er geen bevestigingsmail uit. Zonder deze vlag stuurt
        // Supabase alsnog een confirm-mail — precies wat niet mag.
        email_confirm: true,
        user_metadata: { full_name: person.full_name },
      });
      if (error) {
        console.error(`  FOUT bij ${email}: ${error.message}`);
        process.exitCode = 1;
        continue;
      }
      user = data.user;
      created.push({ email, full_name: person.full_name, password });
    }

    // Profiel bijwerken of aanmaken. Ook voor accounts die handmatig in het
    // dashboard zijn gemaakt: die hebben nog geen profielrij.
    const { error: profErr } = await admin.from('profiles').upsert({
      id: user.id,
      full_name: person.full_name,
      email,
      role: person.role,
      team_id: teamId,
      // hubspot_owner_id en jiminny_user_id bewust niet meegegeven: een upsert
      // zou ze op null zetten en daarmee wissen wat Sean of Bjorn al geleverd heeft.
    }, { onConflict: 'id' });

    if (profErr) {
      console.error(`  FOUT bij profiel ${email}: ${profErr.message}`);
      process.exitCode = 1;
      continue;
    }

    console.log(`  ${created.some((c) => c.email === email) ? 'nieuw ' : 'bestond'}  ${person.role.padEnd(7)}  ${email}`);
  }

  // product_owners doorkoppelen naar profielen waar de naam exact overeenkomt.
  const { data: owners } = await admin
    .from('product_owners').select('id, owner_name').is('owner_profile_id', null);
  if (owners?.length) {
    const { data: profiles } = await admin.from('profiles').select('id, full_name');
    const byName = new Map((profiles ?? []).map((p) => [p.full_name, p.id]));
    for (const o of owners) {
      const pid = byName.get(o.owner_name);
      if (pid) await admin.from('product_owners').update({ owner_profile_id: pid }).eq('id', o.id);
    }
  }

  console.log(`\nKlaar. ${created.length} nieuw, ${reused} bestond al.`);

  if (created.length) {
    // Wachtwoorden naar een bestand dat in .gitignore staat. Nooit naar de repo,
    // en bewust niet naar een mail: er gaat bij het aanmaken niets uit.
    const path = join(HERE, '.generated-passwords.txt');
    const body = created
      .map((c) => `${c.email}\t${c.password}\t${c.full_name}`)
      .join('\n');
    writeFileSync(path, `# Tijdelijke wachtwoorden — ${new Date().toISOString()}\n${body}\n`, {
      mode: 0o600,
    });
    console.log(`Tijdelijke wachtwoorden: ${path}`);
    console.log('Dat bestand staat in .gitignore. Deel ze zelf en verwijder het daarna.');
  }
  console.log('Er is geen enkele e-mail verstuurd.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
