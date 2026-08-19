// ============================================================================
// auth-gate.js — inlogscherm, sessieafhandeling en uitloggen
// ============================================================================
// Niet ingelogd = niets zien behalve het inlogscherm.
//
// Waarom dit een losse laag is en geen React-component: de Coaching Hub boot
// via support.js op DOMContentLoaded en die boot valt niet te onderscheppen.
// Deze module draait daarvóór, legt een eigen overlay over de pagina en houdt
// de app onzichtbaar tot er een sessie is. Dat is ook de reden dat de overlay
// met kale DOM is gebouwd: op dat moment bestaat de React-root nog niet.
//
// Belangrijker dan het verbergen: playbook-data.js wacht op window.__playbookAuthReady
// voordat het ook maar één query doet. Zonder sessie komt er dus geen enkel
// gegeven de client op — de overlay is de nette afwerking, niet de beveiliging.
// De beveiliging is RLS.
// ============================================================================

import {
  getClient, getSession, signIn, signOut, getMyProfile,
  onAuthStateChange, isConfigured, requestPasswordReset,
} from './supabase-client.js';

const STYLE = `
  html.pb-auth-locked body > *:not(#pb-auth-overlay) { visibility: hidden !important; }
  #pb-auth-overlay {
    position: fixed; inset: 0; z-index: 2147483000;
    display: flex; align-items: center; justify-content: center;
    background: #002a4d;
    font-family: 'Greycliff CF', 'Open Sans', system-ui, -apple-system, sans-serif;
    padding: 24px;
  }
  #pb-auth-overlay .pb-card {
    width: 100%; max-width: 380px; background: #fff; border-radius: 14px;
    padding: 32px 30px; box-shadow: 0 18px 50px rgba(0,0,0,0.28);
  }
  #pb-auth-overlay .pb-mark { display: block; height: 30px; margin-bottom: 22px; }
  #pb-auth-overlay h1 {
    margin: 0 0 4px; font-size: 21px; font-weight: 800; color: #002a4d; letter-spacing: -0.01em;
  }
  #pb-auth-overlay p.pb-sub { margin: 0 0 22px; font-size: 13px; color: #5b6b78; line-height: 1.5; }
  #pb-auth-overlay label {
    display: block; font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.07em; color: #5b6b78; margin-bottom: 6px;
  }
  #pb-auth-overlay input {
    width: 100%; box-sizing: border-box; padding: 11px 13px; margin-bottom: 16px;
    border: 1px solid #ccdde3; border-radius: 8px; font-size: 14px; color: #002a4d;
    font-family: inherit; background: #fff;
  }
  #pb-auth-overlay input:focus { outline: none; border-color: #23afe6; box-shadow: 0 0 0 3px rgba(35,175,230,0.18); }
  #pb-auth-overlay button.pb-primary {
    width: 100%; padding: 12px; border: none; border-radius: 999px; background: #23afe6;
    color: #fff; font-family: inherit; font-size: 14px; font-weight: 800; cursor: pointer;
    transition: background 160ms ease;
  }
  #pb-auth-overlay button.pb-primary:hover:not(:disabled) { background: #1d93c1; }
  #pb-auth-overlay button.pb-primary:disabled { opacity: 0.6; cursor: default; }
  #pb-auth-overlay button.pb-link {
    display: block; width: 100%; margin-top: 14px; padding: 0; border: none; background: none;
    color: #1d93c1; font-family: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer;
  }
  #pb-auth-overlay .pb-msg {
    margin: 0 0 16px; padding: 10px 12px; border-radius: 8px; font-size: 12.5px; line-height: 1.45;
  }
  #pb-auth-overlay .pb-msg.err { background: #fdecec; color: #93231f; }
  #pb-auth-overlay .pb-msg.ok  { background: #e6f6fc; color: #10556f; }
  #pb-auth-overlay .pb-boot { color: rgba(255,255,255,0.75); font-size: 13px; }
`;

const COPY = {
  title: 'Spotler Playbook',
  sub: 'Log in met je Spotler-account om verder te gaan.',
  email: 'E-mailadres',
  password: 'Wachtwoord',
  submit: 'Inloggen',
  submitting: 'Bezig…',
  forgot: 'Wachtwoord vergeten?',
  back: 'Terug naar inloggen',
  reset: 'Stuur een herstelmail',
  // De meest waarschijnlijke storing is dat de mail in spam belandt. Dat hier
  // zeggen scheelt de helpdesk een rondje.
  resetSent: 'Als dit adres bekend is, is er een herstelmail onderweg. Kijk ook in je spam-map.',
  // Bewust één foutmelding voor "onbekend adres" en "verkeerd wachtwoord": het
  // verschil zou verklappen welke adressen bestaan.
  badCredentials: 'E-mailadres of wachtwoord klopt niet.',
  noProfile: 'Dit account heeft nog geen profiel in het playbook. Vraag een manager om je toe te voegen.',
  notConfigured: 'Supabase is nog niet geconfigureerd. Vul supabase-config.js in.',
};

let resolveReady;
const ready = new Promise((resolve) => { resolveReady = resolve; });

// De rest van de app wacht hierop. playbook-data.js doet een top-level await,
// zodat import('./playbook-data.js') pas resolvet als er een sessie is.
window.__playbookAuthReady = ready;
window.__playbookAuth = { profile: null, session: null, signOut: doSignOut };

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2).toLowerCase(), v);
    else node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) node.append(c);
  return node;
}

function lock() {
  document.documentElement.classList.add('pb-auth-locked');
}
function unlock() {
  document.documentElement.classList.remove('pb-auth-locked');
  document.getElementById('pb-auth-overlay')?.remove();
}

function mountStyle() {
  if (document.getElementById('pb-auth-style')) return;
  const s = el('style', { id: 'pb-auth-style' });
  s.textContent = STYLE;
  (document.head || document.documentElement).append(s);
}

function overlay() {
  let node = document.getElementById('pb-auth-overlay');
  if (!node) {
    node = el('div', { id: 'pb-auth-overlay' });
    (document.body || document.documentElement).append(node);
  }
  return node;
}

function renderBooting() {
  overlay().replaceChildren(el('div', { class: 'pb-boot' }, 'Even geduld…'));
}

function renderLogin({ message = null, tone = 'err', mode = 'login' } = {}) {
  const card = el('div', { class: 'pb-card' });

  const mark = el('img', {
    class: 'pb-mark',
    src: 'assets/spotlight-navy.svg',
    alt: 'Spotler',
  });
  mark.addEventListener('error', () => mark.remove());
  card.append(mark);

  card.append(el('h1', {}, COPY.title));
  card.append(el('p', { class: 'pb-sub' },
    mode === 'reset'
      ? 'Vul je e-mailadres in; je krijgt een link om een nieuw wachtwoord te kiezen.'
      : COPY.sub));

  if (message) card.append(el('p', { class: `pb-msg ${tone}` }, message));

  const form = el('form');
  const email = el('input', {
    type: 'email', name: 'email', autocomplete: 'username',
    required: 'required', placeholder: 'voornaam.achternaam@spotler.com',
  });
  form.append(el('label', {}, COPY.email), email);

  let password = null;
  if (mode === 'login') {
    password = el('input', {
      type: 'password', name: 'password', autocomplete: 'current-password', required: 'required',
    });
    form.append(el('label', {}, COPY.password), password);
  }

  const submit = el('button', { class: 'pb-primary', type: 'submit' },
    mode === 'login' ? COPY.submit : COPY.reset);
  form.append(submit);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submit.disabled = true;
    submit.textContent = COPY.submitting;
    try {
      if (mode === 'reset') {
        await requestPasswordReset(email.value);
        // Altijd hetzelfde antwoord, of het adres nu bestaat of niet.
        renderLogin({ message: COPY.resetSent, tone: 'ok', mode: 'login' });
        return;
      }
      const { error } = await signIn(email.value, password.value);
      if (error) {
        renderLogin({ message: COPY.badCredentials, tone: 'err', mode: 'login' });
        return;
      }
      await admitIfProfiled();
    } catch (err) {
      renderLogin({ message: err?.message ?? String(err), tone: 'err', mode });
    } finally {
      submit.disabled = false;
      submit.textContent = mode === 'login' ? COPY.submit : COPY.reset;
    }
  });

  card.append(form);
  card.append(el('button', {
    class: 'pb-link', type: 'button',
    onclick: () => renderLogin({ mode: mode === 'login' ? 'reset' : 'login' }),
  }, mode === 'login' ? COPY.forgot : COPY.back));

  overlay().replaceChildren(card);
  (mode === 'login' && email.value ? password : email)?.focus();
}

// Een geldig auth-account zonder profielrij is geen bruikbare gebruiker: de app
// kent dan geen naam, geen rol en geen team. Beter meteen tegenhouden dan
// halverwege stukgaan.
async function admitIfProfiled() {
  const session = await getSession();
  if (!session) { renderLogin(); return; }

  const profile = await getMyProfile();
  if (!profile) {
    await signOut();
    renderLogin({ message: COPY.noProfile, tone: 'err' });
    return;
  }

  window.__playbookAuth.session = session;
  window.__playbookAuth.profile = profile;
  unlock();
  resolveReady(profile);
}

async function doSignOut() {
  try { await signOut(); } catch (err) { console.error('[auth] uitloggen mislukt:', err); }
  // Volledig herladen in plaats van de React-state opruimen: dat is de enige
  // manier om zeker te weten dat er geen gegevens van de vorige gebruiker in
  // een component of module-cache blijven hangen.
  location.reload();
}

async function start() {
  mountStyle();
  lock();
  renderBooting();

  if (!isConfigured()) {
    renderLogin({ message: COPY.notConfigured, tone: 'err' });
    return;
  }

  try {
    await getClient();
    await admitIfProfiled();

    // Sessie die elders verloopt of wordt beëindigd (bijvoorbeeld uitloggen op
    // demo.spotler.com, dezelfde cookie) moet hier ook meteen effect hebben.
    await onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') location.reload();
    });
  } catch (err) {
    console.error('[auth]', err);
    renderLogin({ message: err?.message ?? String(err), tone: 'err' });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}
