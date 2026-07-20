# Playbook — Team Page Design Brief

**Owner:** Erik · **Feedback source:** Russ (20 Jul review) · **Builds on:** `playbook-functional-scope.md` §2 and §1.1
**Status:** the team page currently exists in nav but is blank ("that's still blank" — Russ). This brief is the spec to build it.
**Scope note:** no HubSpot/data-overview content here (that's a separate track with Sean/Niels). This assumes illustrative values now, real data slotted in later without redesign.

---

## 1. What the team page is *for* (Russ's framing, in priority order)

Russ was explicit that this page has three jobs, and that they are **not equal**. Build to this ranking — do not let job (c) grow into a second personal dashboard.

**a. PRIMARY — the meeting base.**
This is the page a manager projects on the screen in the weekly team meeting and talks through, line by line. Russ: *"every team meeting, they just pull up that page, and then they start talking about it — why, why, why it happened."* That single sentence is the design test for the whole page: **every element on it must be walk-through-able out loud, and must provoke a "why."** A number that can't start a conversation doesn't belong here.

**b. SECONDARY — social accountability.**
The full-team leaderboard is the accountability engine. Russ, verbatim on the popup: *"Love the popup with full team leaderboard on each box — that will really create guilt."* On the team page this is not a hover-only side-feature (as it is on Home); it's a first-class, on-screen element. Comparison viewed *together in the room* is the point.

**c. MINOR — personal position.**
A thin strip so the viewing rep can locate themselves in the pack. Russ: *"a small portion of it… just give the awareness of how people are relating into the team."* Emphasis on **small**. Awareness, not focus. Home stays the personal page; this is one slim band, not a mirror of Home.

**The one-line division of labour:**
Home answers *"am I doing my job?"* — private, daily, sparse.
Team answers *"how are we doing, and why?"* — shared, weekly, conversation-driving.

---

## 2. Page structure (top to bottom)

### Header
- Title: **"Team — Commercial NL"** (or the actual team label).
- **Data-freshness stamp** ("Gegevens van [datum]") — mandatory, same as every other data screen. A meeting tool that shows a stale number as if live loses the room's trust in one session.
- **No** personal greeting, points, or streak here — those are Home's. The team page is not addressed to one person.

### Block 1 — Pipeline health (moved from Home) — THE meeting anchor
These are the four tiles relocated off Home per Russ's "cut 8 KPIs to 4" note. They are team-level ("Vaste analyse, Commercial Team NL"), so this is their correct home.

| Tile | Value (illustrative) | Sub-line | Discussion trigger it should provoke |
|---|---|---|---|
| Win rate Partner | 88% | Hoogste ROI — gem. €8.978/deal | "Our best channel — are we feeding it enough?" |
| Win rate Marketing | 15% | Snelle opvolging is cruciaal | "Why so low — is it lead quality or follow-up speed?" |
| Stuck deals >60d | 84 | €1,03M vervuilde forecast | "Whose are these 84? Let's name them." |
| MRR ontbreekt | 45% | Deals zonder productline item | "Nearly half our deals have no product — that's the forecast being wrong." |

**Design requirement:** each tile must carry a trend direction vs last week (▲/▼ + delta), because a meeting is about *what changed*, not the static level. A flat number is a fact; a moving number is a conversation. Keep the existing card styling and the colored top-borders (green/orange/red/blue) already in the build — they read as severity cues, which suits a meeting.

### Block 2 — Team funnel (4 stages)
The same 4 funnel stages as Home (Gekwalificeerd → Demo → Voorstel → Gewonnen), but shown at **team aggregate** with a vs-last-week comparison — not the personal "jij" numbers.
- **Fairness guardrail (carry from functional-scope §1.x):** funnel tiles **never rank individuals**. Lead-mix luck affects funnel outcomes, not just behaviour, so ranking them would punish reps for their inbox. Team funnel = team totals + trend only. No per-rep leaderboard on funnel tiles.

### Block 3 — Coaching signals + leaderboard (the accountability engine)
The four coaching signals (Ontdekking & kwalificatie / Use case scherpstellen / Multithreading / Vervolgstap discipline), shown at team level, each with the **leaderboard on-screen or one-tap open** — reusing the existing leaderboard component, not a new one.
- Unlike the funnel tiles, these *are* behaviour-based and therefore fair to rank — this is where Russ's "guilt" mechanic lives, legitimately.
- Reuse the existing per-viewer leaderboard privacy model from functional-scope §1.1 (top half named, bottom half redacted-but-count-visible, viewer always sees own row, footer caption). **Do not** send other reps' hidden names to the client DOM.
- **Open design tension to resolve, not silently pick:** the original functional-scope framed the team page's recognition as *"celebration framing, positive, not a ranking of weakness."* Russ this morning explicitly wants it to "create guilt." These pull in opposite directions. Recommended reconciliation: **name the top performers (celebration) AND show the full ranked board (accountability) — the redaction model already does both**: climbing is rewarded with visibility, the bottom is pressured by being hidden-until-you-climb rather than by being publicly shamed by name. That satisfies "guilt as motivation" without a wall-of-shame that could backfire in a live meeting. Flag this to Russ for a yes before finalising — it's a culture call, not a design call.

### Block 4 — Your position (the thin strip — MINOR)
A single slim band, not a grid of cards. One line per signal at most:
- e.g. *"Vervolgstap discipline: jij 12 van 21 · team-gemiddelde 9 · #3 van 8"*
- Purpose is orientation only ("where am I in the pack"). If it starts looking like a dashboard, it's too big — cut it back. This is deliberately the least prominent thing on the page.

---

## 3. Interaction & behaviour

- **Projector-first:** this page is viewed on a shared screen from across a room. Prioritise legibility at distance — larger hero numbers, high contrast, no dependence on hover to reveal the primary insight (hover can *enrich*, but the core story must be visible without a cursor, because in a meeting the cursor isn't moving).
- **No prep required:** every number walk-through-able out loud cold. If an element needs a footnote to explain, it's wrong for this page.
- **Single team view for now:** show the whole Commercial NL team. Do **not** build a per-pod/per-manager selector yet — one team view is simpler and matches how the first meetings will run. Revisit only if Russ asks for multiple team scopes.
- **Reuse, don't reinvent:** all tiles, cards, leaderboard, and the design-system components must match what's already built. No new visual language on this page.

---

## 4. States

- **Normal:** data present, trends computed.
- **Stale cut:** freshness stamp flags gently (not alarming) — the meeting can still run, people just need to know the number's age.
- **Illustrative/pre-data:** while real numbers aren't wired, use clearly plausible placeholder values (the ones above) — but structure the components so a real weekly cut drops in without a rebuild.

---

## 5. Explicitly out of scope for this build

- HubSpot data-overview / what-goes-in-vs-out (separate track, Sean + Niels).
- Manager-only per-rep breakdown *table* — that's a manager-gated addition (functional-scope §2) and can be a fast-follow; the reps' aggregate team view is the priority for the first version.
- Any change to Home beyond what the paired Claude Code fix-prompt already covers (delete quick-action row, keep only the 4 funnel tiles, move pipeline-health here).

---

## 6. The design test (paste at the top of any review)

> Project this page on a wall. Can a manager, cold and unprepared, point at any element and start a "why did this happen" conversation the team can act on? If yes for every element, it's done. If any element only *reports* and never *provokes*, it belongs on Home or in Winning Moves, not here.

---
*Pairs with: the Claude Code fix-prompt (quick fixes + Demo Studio + team-page build note) · `playbook-functional-scope.md` §2 (original team-page scope) and §1.1 (leaderboard privacy model).*
