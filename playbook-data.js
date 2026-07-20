// Playbook data layer — Coaching Hub.
//
// SWAPPABLE BY DESIGN: the rest of the app talks only to listReps() and
// getViewerSnapshot(repId, period). Today those two functions read a
// deterministically-generated representative dataset (below). When the
// live HubSpot weekly cut is ready, replace the body of this file with
// one that fetches/parses that cut and fills the same two functions with
// the same return shapes — nothing upstream changes.
//
// Read-only, one direction: HubSpot -> Playbook. Nothing here writes back.
//
// PRIVACY: getViewerSnapshot() only ever includes another rep's real name
// when that rep is in the visible (named) half of a leaderboard, or is the
// viewer themselves. Hidden rows carry no name field at all — never a name
// the client is expected to blur/hide client-side.

const NUM_WEEKS = 26; // trailing 26 weekly cuts; index NUM_WEEKS-1 = "current" week

const REPS = [
  { id: 'rick',    name: 'Rick',    skill: 0.95 },
  { id: 'boris',   name: 'Boris',   skill: 0.82 },
  { id: 'manuela', name: 'Manuela', skill: 0.78 },
  { id: 'robbert', name: 'Robbert', skill: 0.74 },
  { id: 'niels',   name: 'Niels',   skill: 0.70 },
  { id: 'martin',  name: 'Martin',  skill: 0.65 },
  { id: 'sander',  name: 'Sander',  skill: 0.58 },
  { id: 'ivo',     name: 'Ivo',     skill: 0.58 },
  { id: 'jack',    name: 'Jack',    skill: 0.54 },
  { id: 'nick',    name: 'Nick',    skill: 0.49 },
  { id: 'niek',    name: 'Niek',    skill: 0.44 },
  { id: 'jasper',  name: 'Jasper',  skill: 0.39 },
  { id: 'ed',      name: 'Ed',      skill: 0.30 },
  { id: 'dyan',    name: 'Dyan',    skill: 0.24 },
];

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

// Activity volume (calls, open deals) is DELIBERATELY correlated with skill —
// stronger reps tend to also be more active — with enough independent spread
// that volume alone never fully overrides the skill signal in the counts below.
function buildRepSeries(rep) {
  const callBase = Math.round(14 + rep.skill * 13 + (rand() - 0.5) * 5); // ~16-30, skill-leaning
  const openDealsBase = Math.round(6 + rep.skill * 9 + (rand() - 0.5) * 3); // ~7-17, skill-leaning
  // most reps drift gently upward (coaching works); Dyan (bottom cluster) gets a
  // deliberately steeper climb so the delta-based points economy has a visible payoff
  const trendPerWeek = rep.id === 'dyan' ? 0.006 : rand() * 0.006 - 0.001;
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

// Forces repA & repB to an exact count tie on panelId at week `cur`, positioned
// so exactly 6 of the OTHER 12 reps sit above them (ranks 1-6) and the rest sit
// below (ranks 9-14) — i.e. repA/repB land on ranks 7 & 8, straddling the
// top/bottom-half visibility line, with zero risk of a third rep colliding on
// the tie value. repA gets the bigger positive delta at `prev`, so the
// tie-break rule (larger weekly delta wins the named slot) puts repA at rank 7
// (named) and repB at rank 8 (first hidden row).
function forceTieAtBoundary(seriesByRep, panelId, cur, prev, repA, repB) {
  const otherIds = REPS.map((r) => r.id).filter((id) => id !== repA && id !== repB);
  const sorted = otherIds
    .map((id) => ({ id, count: seriesByRep[id][cur].panels[panelId].count }))
    .sort((a, b) => b.count - a.count);

  const gap = sorted[5].count - sorted[6].count;
  const shift = gap < 2 ? 2 - gap : 0;
  if (shift > 0) {
    for (let i = 6; i < sorted.length; i++) {
      const rec = seriesByRep[sorted[i].id][cur].panels[panelId];
      rec.count = Math.max(0, rec.count - shift);
    }
  }
  const tieCount = sorted[5].count - 1;

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
  const seriesByRep = {};
  REPS.forEach((r) => { seriesByRep[r.id] = buildRepSeries(r); });
  // Sander & Ivo tie in Discovery at the rank 7/8 visibility boundary this
  // week — Sander's bigger delta wins him the named slot; Ivo (this session's
  // default viewer) loses the tie-break and stays in the blurred half.
  forceTieAtBoundary(seriesByRep, 'discovery', NUM_WEEKS - 1, NUM_WEEKS - 2, 'sander', 'ivo');
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

// Server-side (here: data-layer-side) visibility computation. A hidden row's
// `name` key is simply absent — the redaction is not a client-side CSS effect
// applied to real data, the real name never leaves this function for that row.
function visibleLeaderboard(panelId, period, viewerId) {
  const rows = computeLeaderboardRanking(panelId, period);
  const namedCount = Math.ceil(rows.length / 2);
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

export function listReps() {
  return REPS.map((r) => ({ id: r.id, name: r.name }));
}

export function getViewerSnapshot(repId, period) {
  const safeRepId = SERIES[repId] ? repId : REPS[0].id;
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

export { PANEL_IDS, STAGES };
