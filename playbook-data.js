// Playbook data layer — Coaching Hub.
//
// SWAPPABLE BY DESIGN: the rest of the app talks only to listReps() and
// getViewerSnapshot(repId, period). Those two keep exactly the same return
// shapes they always had; only the source changed. The roster now comes from
// Supabase (`profiles`) instead of a list baked into this file. The weekly
// numbers are still deterministically generated; when the live HubSpot cut and
// the Jiminny signals are ready, only the body of getViewerSnapshot() changes.
//
// Read-only, one direction. Nothing here writes back.
//
// WHY THE BUILT-IN DATASET IS GONE: it held fourteen real first names with
// hand-assigned skill scores, in a public repo. The names now live behind the
// login and come from `profiles`; the synthetic per-rep skill value is derived
// from a hash of the profile id, so it encodes no judgement about anyone.
//
// AUTH: this module top-level-awaits window.__playbookAuthReady (set by
// auth-gate.js). That means `import('./playbook-data.js')` does not resolve
// until there is a session — the app's existing `.then(mod => …)` boot path
// keeps working unchanged, and no data is fetched before login.
//
// PRIVACY: getViewerSnapshot() only ever includes another rep's real name when
// that rep is in the visible (named) half of a leaderboard, or is the viewer
// themselves. Hidden rows carry no name field at all — never a name the client
// is expected to blur/hide client-side.
//
// Note on the strength of that guarantee: the leaderboard is still computed
// here, in the browser, over a synthetic dataset. With ten reps, five hidden
// rows are weak anonymisation on their own — someone who knows the roster can
// narrow it down by elimination. The rule above is therefore kept strictly
// (no name key on a hidden row, ever), but the real protection only arrives
// when this computation moves server-side along with the live figures. Do not
// treat the current hiding as sufficient for real performance data.

import { getClient } from './supabase-client.js';

// Wait for a session before touching the database. Anything below this line
// runs authenticated.
if (!window.__playbookAuthReady) {
  throw new Error(
    'auth-gate.js is niet geladen. Zonder de auth-gate zou deze module zonder ' +
    'sessie gaan queryen; dat hoort niet te kunnen.'
  );
}
const VIEWER_PROFILE = await window.__playbookAuthReady;
const supabase = await getClient();

const NUM_WEEKS = 26; // trailing 26 weekly cuts; index NUM_WEEKS-1 = "current" week

// ---------------------------------------------------------------------------
// Roster
// ---------------------------------------------------------------------------
// Leaderboards are over reps only. Managers see the board and can switch which
// rep they are looking at, but they do not appear in the ranking themselves.
const { data: profileRows, error: profileError } = await supabase
  .from('profiles')
  .select('id, full_name, email, role, team_id')
  .order('full_name');

if (profileError) {
  throw new Error(`kon de gebruikers niet laden: ${profileError.message}`);
}

const PROFILES = profileRows ?? [];
const REPS = PROFILES.filter((p) => p.role === 'rep').map((p) => ({
  id: p.id,
  name: p.full_name,
  // Synthetic. Derived from the profile id so it is stable across reloads and
  // arbitrary by construction — it is not a rating of anyone.
  skill: syntheticSkill(p.id),
}));

if (REPS.length === 0) {
  throw new Error('geen reps gevonden in profiles — draai scripts/create-users.mjs');
}

// weight = coaching-points multiplier per positive weekly delta (pain-qualification
// and next-step count more, per vision doc §4.1 — they sit closer to the leak)
const PANEL_DEFS = [
  { id: 'discovery',   weight: 3, baseRate: [0.10, 0.65] },
  { id: 'usecase',     weight: 2, baseRate: [0.15, 0.62] },
  { id: 'multithread', weight: 2, baseRate: [0.05, 0.55] },
  { id: 'nextstep',    weight: 3, baseRate: [0.15, 0.70] },
];
const PANEL_IDS = PANEL_DEFS.map((p) => p.id);

const STAGES = ['qualified', 'demo', 'proposal', 'closedwon'];
// stage win-rate anchors, per the real pipeline pattern (content parity map)
const STAGE_ANCHOR = { qualified: 0.20, demo: 0.49, proposal: 0.72, closedwon: 0.93 };

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260717); // fixed seed -> same "representative" dataset every load

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }

// Spread the synthetic skill values across the same 0.24-0.95 band the old
// hand-written dataset used, so the dashboards keep the shape they were
// designed against.
function syntheticSkill(id) {
  return 0.24 + (hashStr(id) % 1000) / 1000 * 0.71;
}

// Activity volume (calls, open deals) is DELIBERATELY correlated with skill —
// stronger reps tend to also be more active — with enough independent spread
// that volume alone never fully overrides the skill signal in the counts below.
function buildRepSeries(rep) {
  const callBase = Math.round(14 + rep.skill * 13 + (rand() - 0.5) * 5); // ~16-30, skill-leaning
  const openDealsBase = Math.round(6 + rep.skill * 9 + (rand() - 0.5) * 3); // ~7-17, skill-leaning
  // most reps drift gently upward (coaching works); the rep at the bottom of
  // the synthetic spread gets a steeper climb so the delta-based points economy
  // has a visible payoff somewhere on the board
  const trendPerWeek = rep.isBottom ? 0.006 : rand() * 0.006 - 0.001;
  // small, FIXED per-rep-per-panel personality offset (not re-rolled weekly) —
  // keeps a rep's relative standing coherent across weeks instead of noisy
  const jitter = PANEL_DEFS.map(() => (rand() - 0.5) * 0.02);

  const weeks = [];
  for (let w = 0; w < NUM_WEEKS; w++) {
    const calls = clamp(Math.round(callBase + (rand() - 0.5) * 5), 10, 32);
    const demos = clamp(Math.round(calls * (0.32 + rand() * 0.14)), 3, calls);
    const openDeals = clamp(Math.round(openDealsBase + (rand() - 0.5) * 3), 4, 22);
    const denomFor = { discovery: calls, usecase: demos, multithread: openDeals, nextstep: calls };
    // small week-to-week wobble on the underlying skill score (not a separate
    // large noise term per panel) — keeps ranking mostly stable, deltas alive
    const weekSkill = clamp(rep.skill + (rand() - 0.5) * 0.03, 0.02, 0.98);

    const panels = {};
    PANEL_DEFS.forEach((p, pi) => {
      const [lo, hi] = p.baseRate;
      const rate = clamp(lo + weekSkill * (hi - lo) + jitter[pi] + trendPerWeek * w, 0.02, 0.97);
      const denom = denomFor[p.id];
      panels[p.id] = { count: clamp(Math.round(denom * rate), 0, denom), denom };
    });

    const funnel = {};
    STAGES.forEach((stage) => {
      const anchor = STAGE_ANCHOR[stage];
      const skillShift = (rep.skill - 0.5) * 0.10; // modest — outcomes are lead-mix luck, not pure skill
      const spread = Math.sqrt(anchor * (1 - anchor)) * 0.55;
      funnel[stage] = clamp(anchor + skillShift + (rand() - 0.5) * 2 * spread, 0.02, 0.98);
    });

    weeks.push({ panels, funnel });
  }
  return weeks;
}

function namedCountFor(total) { return Math.ceil(total / 2); }

// Forces the two reps who naturally land either side of the top/bottom-half
// visibility line into an exact count tie on panelId at week `cur`, so the app
// always has one live example of the tie-break rule (larger weekly delta wins
// the named slot) to render. Positioned so no third rep can collide on the tie
// value. Previously this named two specific colleagues; it now works off rank
// position, so it keeps demonstrating the case without singling anyone out.
function forceTieAtBoundary(seriesByRep, panelId, cur, prev) {
  const ids = REPS.map((r) => r.id);
  if (ids.length < 4) return; // no meaningful boundary to straddle

  const named = namedCountFor(ids.length);
  const ranked = ids
    .map((id) => ({ id, count: seriesByRep[id][cur].panels[panelId].count }))
    .sort((a, b) => b.count - a.count);

  const repA = ranked[named - 1].id; // last named slot
  const repB = ranked[named].id;     // first hidden slot

  const others = ranked.filter((r) => r.id !== repA && r.id !== repB);
  // others[0 .. named-2] sit above the pair; the rest sit below it
  const aboveEnd = named - 2;
  if (aboveEnd < 0 || aboveEnd + 1 >= others.length) return;

  const gap = others[aboveEnd].count - others[aboveEnd + 1].count;
  const shift = gap < 2 ? 2 - gap : 0;
  if (shift > 0) {
    for (let i = aboveEnd + 1; i < others.length; i++) {
      const rec = seriesByRep[others[i].id][cur].panels[panelId];
      rec.count = Math.max(0, rec.count - shift);
    }
  }
  const tieCount = Math.max(1, others[aboveEnd].count - 1);

  const aDenom = Math.max(seriesByRep[repA][cur].panels[panelId].denom, tieCount + 8);
  const bDenom = Math.max(seriesByRep[repB][cur].panels[panelId].denom, tieCount + 10);
  seriesByRep[repA][cur].panels[panelId] = { count: tieCount, denom: aDenom };
  seriesByRep[repB][cur].panels[panelId] = { count: tieCount, denom: bDenom };

  const aPrevDenom = seriesByRep[repA][prev].panels[panelId].denom;
  const bPrevDenom = seriesByRep[repB][prev].panels[panelId].denom;
  seriesByRep[repA][prev].panels[panelId].count = clamp(tieCount - 3, 0, aPrevDenom); // bigger delta -> wins tie
  seriesByRep[repB][prev].panels[panelId].count = clamp(tieCount - 1, 0, bPrevDenom); // smaller delta -> stays hidden
}

function buildAll() {
  // Generate in a stable order so the fixed seed keeps producing the same
  // dataset regardless of the order Postgres happened to return rows in.
  const ordered = REPS.slice().sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const lowest = ordered.reduce((lo, r) => (r.skill < lo.skill ? r : lo), ordered[0]);
  lowest.isBottom = true;

  const seriesByRep = {};
  ordered.forEach((r) => { seriesByRep[r.id] = buildRepSeries(r); });
  forceTieAtBoundary(seriesByRep, 'discovery', NUM_WEEKS - 1, NUM_WEEKS - 2);
  return seriesByRep;
}

const SERIES = buildAll();
const CURRENT = NUM_WEEKS - 1;

function periodRange(period) {
  if (period === 'month') return [CURRENT - 3, CURRENT];
  if (period === 'quarter') return [CURRENT - 12, CURRENT];
  return [CURRENT, CURRENT];
}
function prevPeriodRange(period) {
  const [a, b] = periodRange(period);
  const len = b - a + 1;
  return [a - len, b - len];
}
function weeksInPeriod(period) { return period === 'month' ? 4 : period === 'quarter' ? 13 : 1; }

function sumPanel(repId, panelId, range) {
  let count = 0, denom = 0;
  for (let w = Math.max(0, range[0]); w <= range[1]; w++) {
    const rec = SERIES[repId][w].panels[panelId];
    count += rec.count; denom += rec.denom;
  }
  return { count, denom };
}
function avgFunnel(repId, stage, range) {
  let sum = 0, n = 0;
  for (let w = Math.max(0, range[0]); w <= range[1]; w++) { sum += SERIES[repId][w].funnel[stage]; n++; }
  return n ? sum / n : 0;
}
function teamAveragePanel(panelId, range) {
  let count = 0, denom = 0;
  REPS.forEach((r) => { const s = sumPanel(r.id, panelId, range); count += s.count; denom += s.denom; });
  return { count: count / REPS.length, denom: denom / REPS.length };
}
function teamAverageFunnel(stage, range) {
  let sum = 0;
  REPS.forEach((r) => { sum += avgFunnel(r.id, stage, range); });
  return sum / REPS.length;
}
function teamCountAtWeek(panelId, w) {
  if (w < 0) return 0;
  let sum = 0;
  REPS.forEach((r) => { sum += SERIES[r.id][w].panels[panelId].count; });
  return sum / REPS.length;
}
// self-ratcheting target: max(own last week + 1, 60% of team average) — vision doc §4.3
function weeklyTargetAt(repId, panelId, w) {
  if (w <= 0) return Math.max(1, Math.ceil(0.6 * teamCountAtWeek(panelId, 0)));
  const ownPrev = SERIES[repId][w - 1].panels[panelId].count;
  const teamAvgPrev = teamCountAtWeek(panelId, w - 1);
  return Math.max(ownPrev + 1, Math.ceil(0.6 * teamAvgPrev));
}

function computeStreak(repId) {
  let streak = 0;
  for (let w = 1; w <= CURRENT; w++) {
    let improved = false, declined = false;
    PANEL_DEFS.forEach((p) => {
      const d = SERIES[repId][w].panels[p.id].count - SERIES[repId][w - 1].panels[p.id].count;
      if (d > 0) improved = true;
      if (d < 0) declined = true;
    });
    if (improved) streak++;
    else if (declined) streak = 0;
    // else: flat week — grace, streak holds
  }
  return streak;
}

function computePoints(repId) {
  let points = 40; // onboarding seed grant — never renders at 0 for an active rep
  let streakRun = 0;
  for (let w = 1; w <= CURRENT; w++) {
    let improvedAny = false, declinedAny = false;
    PANEL_DEFS.forEach((p) => {
      const cur = SERIES[repId][w].panels[p.id].count;
      const prevCount = SERIES[repId][w - 1].panels[p.id].count;
      const delta = cur - prevCount;
      if (delta > 0) { points += delta * p.weight; improvedAny = true; }
      if (delta < 0) declinedAny = true;
      if (cur >= weeklyTargetAt(repId, p.id, w)) points += 15; // weekly-target-hit bonus
    });
    if (improvedAny) { streakRun++; if (streakRun % 3 === 0) points += 25; } // streak-milestone bonus
    else if (declinedAny) streakRun = 0;
  }
  return Math.round(points);
}

function computeLeaderboardRanking(panelId, period) {
  const range = periodRange(period);
  const prevRange = prevPeriodRange(period);
  const rows = REPS.map((r) => {
    const cur = sumPanel(r.id, panelId, range);
    const prevSum = sumPanel(r.id, panelId, prevRange);
    return { repId: r.id, name: r.name, count: cur.count, denom: cur.denom, delta: cur.count - prevSum.count };
  });
  rows.sort((a, b) => b.count - a.count || b.delta - a.delta);
  return rows;
}

// Data-layer-side visibility computation. A hidden row's `name` key is simply
// absent — the redaction is not a client-side CSS effect applied to real data,
// the real name never leaves this function for that row. See the note at the
// top of this file about how far that guarantee currently reaches.
function visibleLeaderboard(panelId, period, viewerId) {
  const rows = computeLeaderboardRanking(panelId, period);
  const namedCount = namedCountFor(rows.length);
  return rows.map((row, i) => {
    const rank = i + 1;
    const isNamed = rank <= namedCount || row.repId === viewerId;
    const out = { rank, repId: row.repId, isViewer: row.repId === viewerId, isNamed, count: row.count, denom: row.denom, maskSeed: hashStr(row.repId) % 100 };
    if (isNamed) out.name = row.name;
    return out;
  });
}

function mostRecentMonday(d) {
  const date = new Date(d);
  const day = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() - ((day + 6) % 7));
  return date.toISOString().slice(0, 10);
}

const CYCLE_START = new Date('2026-07-16T00:00:00Z');
const CYCLE_LEN = 17;
function getProgramDay() {
  const diffDays = Math.floor((new Date() - CYCLE_START) / 86400000);
  const cycleDay = (((diffDays % CYCLE_LEN) + CYCLE_LEN) % CYCLE_LEN) + 1;
  return { week: Math.ceil(cycleDay / 7), day: cycleDay, cycleLen: CYCLE_LEN };
}

// ---------------------------------------------------------------------------
// Public surface
// ---------------------------------------------------------------------------

export function listReps() {
  return REPS.map((r) => ({ id: r.id, name: r.name }));
}

export function getViewerSnapshot(repId, period) {
  const safeRepId = SERIES[repId] ? repId : getDefaultViewerId();
  const range = periodRange(period);
  const prevRange = prevPeriodRange(period);
  const wInPeriod = weeksInPeriod(period);

  const funnel = STAGES.map((stage) => ({
    stage,
    you: avgFunnel(safeRepId, stage, range),
    team: teamAverageFunnel(stage, range),
    prevTeam: teamAverageFunnel(stage, prevRange), // team page: team-aggregate vs-previous trend
  }));

  const panels = PANEL_DEFS.map((p) => {
    const cur = sumPanel(safeRepId, p.id, range);
    const prevSum = sumPanel(safeRepId, p.id, prevRange);
    const team = teamAveragePanel(p.id, range);
    const teamPrev = teamAveragePanel(p.id, prevRange);
    const weeklyTarget = weeklyTargetAt(safeRepId, p.id, CURRENT);
    return {
      id: p.id,
      count: cur.count,
      denom: cur.denom,
      delta: cur.count - prevSum.count,
      target: Math.max(1, Math.round(weeklyTarget * wInPeriod)),
      teamAvgCount: Math.round(team.count),
      teamAvgDenom: Math.round(team.denom),
      teamAvgPrevCount: Math.round(teamPrev.count), // team page: team signal vs-previous trend
      leaderboard: visibleLeaderboard(p.id, period, safeRepId),
    };
  });

  return {
    repId: safeRepId,
    programDay: getProgramDay(),
    points: computePoints(safeRepId),
    streakWeeks: computeStreak(safeRepId),
    dataAsOf: mostRecentMonday(new Date()),
    funnel,
    panels,
  };
}

// --- additions for the Supabase build -------------------------------------
// listReps() and getViewerSnapshot() above are unchanged in shape. The three
// below are new, and exist because the viewer is now a real logged-in person
// rather than a dropdown choice, and because the product-owner table moved out
// of the bundle along with the rep dataset.

// Who is logged in. `canSwitchViewer` is the single source of truth for the
// "bekijken als" control: reps see only themselves, managers can switch.
export function getViewer() {
  return {
    id: VIEWER_PROFILE.id,
    name: VIEWER_PROFILE.full_name,
    email: VIEWER_PROFILE.email,
    role: VIEWER_PROFILE.role,
    isManager: VIEWER_PROFILE.role === 'manager',
    canSwitchViewer: VIEWER_PROFILE.role === 'manager',
  };
}

// Which rep's dashboard to open on. A rep lands on their own; a manager has no
// figures of their own, so they land on the first rep in the roster.
export function getDefaultViewerId() {
  if (SERIES[VIEWER_PROFILE.id]) return VIEWER_PROFILE.id;
  return REPS[0].id;
}

const { data: ownerRows, error: ownerError } = await supabase
  .from('product_owners')
  .select('product, owner_name, notes, sort_order')
  .order('sort_order');

if (ownerError) console.error('[data] producteigenaren laden mislukt:', ownerError.message);

// Same row shape the hardcoded OWNER_ROWS had, so the admin view renders
// unchanged. Not every product has an owner — BrandID does not — so hasOwner
// stays part of the contract.
export function listProductOwners() {
  return (ownerRows ?? []).map((r) => ({
    product: r.product,
    owner: r.owner_name ?? '',
    hasOwner: Boolean(r.owner_name),
    notes: r.notes ?? '',
  }));
}

export { PANEL_IDS, STAGES };
