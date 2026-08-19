// ============================================================================
// supabase-client.js — gedeelde Supabase-client voor playbook én demo studio
// ============================================================================
// DIT BESTAND IS BEDOELD OM TE KOPIËREN. De demo studio draait op een andere
// origin, in een andere repo en een andere bouwsessie, maar moet exact dezelfde
// sessie zien. Neem dit bestand en supabase-config.js daar ongewijzigd over.
// Bouw er geen tweede versie naast: dan lopen de cookienaam, het cookiedomein
// en de chunkgrootte na één wijziging uit elkaar en logt de ene app de andere
// uit.
//
// Wat hier NIET in hoort: iets dat specifiek is voor het playbook of specifiek
// voor de demo studio. Dit bestand kent alleen inloggen, uitloggen, de sessie
// en het profiel.
// ============================================================================

import { SUPABASE_URL, SUPABASE_ANON_KEY, COOKIE_DOMAIN, STORAGE_KEY } from './supabase-config.js';

const SUPABASE_JS = 'https://esm.sh/@supabase/supabase-js@2.112.3';

// ---------------------------------------------------------------------------
// Cookie-storage
// ---------------------------------------------------------------------------
// supabase-js accepteert een eigen storage-adapter met getItem/setItem/
// removeItem (het SupportedStorage-type in auth-js). Dat is de gedocumenteerde
// haak; we gebruiken hem hier om de sessie in een cookie te zetten in plaats
// van in localStorage, want localStorage is per origin en cookies kunnen op
// '.spotler.com' gedeeld worden.
//
// Chunking: een sessie (access token + refresh token + user) is groter dan de
// 4 KB die een browser per cookie toestaat. We splitsen daarom over
// `${key}.0`, `${key}.1`, … — dezelfde aanpak en dezelfde grens als
// @supabase/ssr hanteert, zodat het gedrag voorspelbaar blijft.
const MAX_CHUNK_SIZE = 3180;

function cookieAttributes() {
  const parts = ['path=/', 'SameSite=Lax'];
  // Chrome kapt alles boven 400 dagen af; langer vragen heeft geen zin.
  parts.push('max-age=' + 60 * 60 * 24 * 400);
  if (location.protocol === 'https:') parts.push('Secure');
  if (COOKIE_DOMAIN) {
    // Een cookiedomein dat niet bij de huidige host past wordt door de browser
    // stilzwijgend genegeerd: je bent dan uitgelogd zonder foutmelding. Liever
    // luidruchtig terugvallen op host-only.
    const host = location.hostname;
    const bare = COOKIE_DOMAIN.replace(/^\./, '');
    if (host === bare || host.endsWith('.' + bare)) {
      parts.push('domain=' + COOKIE_DOMAIN);
    } else {
      console.warn(
        `[auth] COOKIE_DOMAIN "${COOKIE_DOMAIN}" past niet bij host "${host}". ` +
        'De sessie blijft host-only en wordt niet gedeeld tussen subdomeinen.'
      );
    }
  }
  return parts.join('; ');
}

function readCookie(name) {
  const prefix = encodeURIComponent(name) + '=';
  for (const raw of document.cookie ? document.cookie.split('; ') : []) {
    if (raw.startsWith(prefix)) return decodeURIComponent(raw.slice(prefix.length));
  }
  return null;
}

function writeCookie(name, value) {
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; ${cookieAttributes()}`;
}

function deleteCookie(name) {
  const attrs = cookieAttributes().replace(/max-age=\d+/, 'max-age=0');
  document.cookie = `${encodeURIComponent(name)}=; ${attrs}`;
}

export const cookieStorage = {
  getItem(key) {
    const single = readCookie(key);
    if (single !== null) return single;
    // in stukken opgeslagen
    let out = '';
    for (let i = 0; ; i++) {
      const part = readCookie(`${key}.${i}`);
      if (part === null) break;
      out += part;
    }
    return out === '' ? null : out;
  },

  setItem(key, value) {
    // Altijd eerst de oude vorm opruimen: een sessie die van 2 chunks naar 1
    // gaat zou anders een verweesde `.1` achterlaten die bij het volgende
    // lezen wordt aangeplakt.
    this.removeItem(key);
    if (value.length <= MAX_CHUNK_SIZE) {
      writeCookie(key, value);
      return;
    }
    for (let i = 0, offset = 0; offset < value.length; i++, offset += MAX_CHUNK_SIZE) {
      writeCookie(`${key}.${i}`, value.slice(offset, offset + MAX_CHUNK_SIZE));
    }
  },

  removeItem(key) {
    deleteCookie(key);
    for (let i = 0; i < 32; i++) {
      if (readCookie(`${key}.${i}`) === null) break;
      deleteCookie(`${key}.${i}`);
    }
  },
};

// ---------------------------------------------------------------------------
// De client
// ---------------------------------------------------------------------------
let clientPromise = null;

export function isConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function getClient() {
  if (!clientPromise) {
    if (!isConfigured()) {
      return Promise.reject(new Error(
        'Supabase is nog niet geconfigureerd. Vul SUPABASE_URL en SUPABASE_ANON_KEY ' +
        'in supabase-config.js in — pas nadat de RLS-tests groen zijn.'
      ));
    }
    clientPromise = import(SUPABASE_JS).then(({ createClient }) =>
      createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          storage: cookieStorage,
          storageKey: STORAGE_KEY,
          persistSession: true,
          autoRefreshToken: true,
          // Geen OAuth in deze fase, dus niets in de URL te detecteren. Uit
          // laten staan scheelt een history-manipulatie bij elke pageload.
          detectSessionInUrl: false,
          flowType: 'pkce',
        },
      })
    );
  }
  return clientPromise;
}

// ---------------------------------------------------------------------------
// Sessie en profiel
// ---------------------------------------------------------------------------

export async function getSession() {
  const supabase = await getClient();
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export async function signIn(email, password) {
  const supabase = await getClient();
  return supabase.auth.signInWithPassword({
    email: String(email).trim().toLowerCase(),
    password,
  });
}

export async function signOut() {
  const supabase = await getClient();
  const result = await supabase.auth.signOut();
  // signOut() ruimt de storage zelf op, maar niet altijd de losse chunks als
  // het netwerk wegvalt. Handmatig nalopen kost niets en voorkomt een halve
  // sessie die bij de volgende load niet te parsen is.
  cookieStorage.removeItem(STORAGE_KEY);
  return result;
}

export async function requestPasswordReset(email) {
  const supabase = await getClient();
  return supabase.auth.resetPasswordForEmail(String(email).trim().toLowerCase(), {
    redirectTo: location.origin + location.pathname,
  });
}

export async function onAuthStateChange(callback) {
  const supabase = await getClient();
  return supabase.auth.onAuthStateChange((event, session) => callback(event, session));
}

// Het eigen profiel: naam, rol en team. `role` bepaalt of iemand de
// "bekijken als"-keuze krijgt, dus dit is de bron voor die beslissing —
// niet iets dat de frontend zelf mag verzinnen.
export async function getMyProfile() {
  const supabase = await getClient();
  const session = await getSession();
  if (!session) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, team_id')
    .eq('id', session.user.id)
    .maybeSingle();
  if (error) {
    console.error('[auth] profiel ophalen mislukt:', error.message);
    return null;
  }
  return data;
}
