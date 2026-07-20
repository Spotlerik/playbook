# Playbook — Functional Scope (Design-Ready Specification)

**Date:** 17 Jul 2026 · **Feeds:** direct input to Claude Design, alongside the Spotler design system
**Precedes:** visual design production (Stage 4). This is the missing link between vision + research and actual screens.
**Sources:** `playbook-product-vision.md` (what & why) · `playbook-ux-research.md` (evidence behind every rule below)

**How to use this doc:** each screen gets purpose, data fields, states, real sample copy, interactions, and component needs. This is what gets handed to Claude Design verbatim — it shouldn't need to infer anything already decided here.

---

## 0. Global rules that apply to every screen

- **Role-gating:** Rep sees own Coaching Hub (private) + Team (aggregate) + Winning Moves + Demo Studio + Help. Manager additionally sees Team's per-rep breakdown + Admin. Owner sees everything.
- **Data-freshness stamp:** every screen showing HubSpot-derived numbers carries a visible "Data as of [date]" marker — never implies live tracking when the reality is a weekly cut.
- **Visual identity:** Spotler design system (provided separately) — navy/brand palette, existing component library, must not resemble HubSpot/Confluence density.
- **Copy standard:** counts before percentages, always paired with a comparison; every instruction line is if-then formatted (§0.1).
- **5-second rule:** any screen's primary insight must be graspable at a glance — max 4 panels + header per view, no exceptions without a name attached to the exception.

### 0.1 The if-then copy template (use for every instruction/action line in the product)
```
"When [specific in-call trigger], [then] [exact behaviour] — [optional: why / what to avoid]."
```
Worked examples (real copy, not placeholder — use directly or as pattern):
- *"When they name a pain, ask what it's costing them day-to-day — twice — before moving to product."*
- *"Before booking the demo, get the prospect to agree the exact use case you'll solve — if they can't name it, the demo isn't ready to book."*
- *"Before hanging up, state the next step out loud and get them to confirm the date — a vague 'I'll check back in' is why deals stall silently."*
- *"Ask who else feels this pain or would be affected, and get the intro before the demo — one-contact deals are the easiest to go quiet."*

---

## 1. Coaching Hub (rep home — private, per-rep)

**Purpose:** the single screen a rep checks to know exactly what to do differently this week.

### Header
| Field | Source | Notes |
|---|---|---|
| Rep name + avatar | User profile | |
| Program day (e.g. "week 1, day 3 of 17") | App-computed from cycle start date | Cycle = ~3 weeks, aligned to bi-weekly stand-up rhythm (per vision doc §4) |
| Coaching-points tally | App-computed (delta-based economy, §4 of vision doc) | Never render at 0 for an active rep — seed a starting grant at onboarding |
| Improvement streak | App-computed ("3-week streak," not daily — honest given weekly-cut data) | Grace-week logic: 1 flat week doesn't reset; only a real decline does |
| Time toggle | UI state, no backend call | Last week / Last month / Last quarter — recomputes everything below |

**States:** normal (data present) · first-login (no history yet — show onboarding-grant points + "your first week starts now," not an empty/broken-looking zero state) · stale-data (cut is overdue — flag gently, don't alarm).

### Funnel strip (4 tiles)
| Tile | Format | Sample |
|---|---|---|
| Qualified | You X% / Team Y% | "You 30% / Team 42%" |
| Demo | You X% / Team Y% | "You 18% / Team 26%" |
| Proposal | You X% / Team Y% | "You 9% / Team 14%" |
| Closed Won | You X% / Team Y% | "You 4% / Team 7%" |

**Rule:** these never rank (§3.2 of vision doc, fairness guardrail — lead-mix luck affects outcomes, not just behaviour). No leaderboard hover on funnel tiles.

### Four coaching panels
Each panel is an identical component with these fields:

| Field | Type | Example |
|---|---|---|
| Panel title | Static per panel | "Discovery & Qualification" |
| Sub-label | Static per panel | "Qualify their real pain in the first call" |
| **Count** (hero number) | `X of Y` this week | "4 of 23" |
| Trend | Delta vs last week, green if positive | "▲ +2 calls vs last week" |
| Target progress bar | `X of target` — never starts at 0 | "4 of 12 target this week" |
| Team average | Small, corner placement | "Team average: 12 of 23" |
| Next action | If-then copy (§0.1) | See worked examples above |
| Closest-rival cue *(Stage 4 candidate)* | 1 line, no hover needed | "1 more passes the rep above you" |

**The four panels, confirmed:**
1. Discovery & Qualification (S1)
2. Use Case Scoping (S3)
3. Multithreading (new — Sean-feasibility pending)
4. Next-Step Discipline (S2)

**Interaction:** hover any panel → leaderboard overlay opens (§1.1). Click "Details" (if present) → drills into the underlying calls/deals list (V2 — not R0/R1 scope, but the interaction hook should exist so it's not a rebuild later).

### 1.1 Leaderboard overlay (triggered from any panel)
| Element | Behaviour |
|---|---|
| Ranked list, all reps | Server-computed per-viewer — never sent as a full unmasked list to the client |
| Top half | Name + count, visible to everyone |
| Bottom half | Name blurred/redacted, count stays visible |
| Viewer's own row | Always shows the viewer's real name, even if they're in the blurred half |
| Tie-break at the visibility boundary | Larger positive week-over-week delta wins the named slot |
| Footer copy (verbatim) | *"Names below the top half are hidden until you climb the board."* |

**Privacy requirement:** compute per-viewer visibility server-side. The DOM must never contain another rep's real name when that name is meant to be hidden from this viewer.

---

## 2. Team page (the stand-up screen — manager view, aggregate for reps)

**Purpose:** run the weekly stand-up from one screen.

| Element | Rep sees | Manager additionally sees |
|---|---|---|
| Team funnel (4 tiles, team-level, vs. last week) | ✅ | ✅ |
| Four KPI panels at team level (team average + trend, same format as individual panels but aggregated) | ✅ | ✅ |
| Top performer recognition (celebration framing, name shown — this is positive, not a ranking of weakness) | ✅ | ✅ |
| Pipeline-health panels (stuck deals, win-rate-by-source) — styled identically to the coaching panels, per Erik's decision to fold these in rather than a separate stats block | ✅ | ✅ |
| Per-rep breakdown table | ❌ | ✅ — the only place individual numbers appear in a table form, manager-gated |

**Interaction note:** this screen is designed to be pulled up live during the Monday stand-up — nothing here should require explanation; every number should be walk-through-able out loud without prep.

---

## 3. Winning Moves (content library)

**Purpose:** find the move that fixes the number you just saw.

| Element | Detail |
|---|---|
| Search + filter | Tag by: KPI it improves (S1/S2/S3/multithreading) · funnel stage · ICP/industry · lead source |
| Content types migrated from v10 | Call scripts + objection handling · email templates · lead-source protocols (become interactive checklists, not prose) · use cases (18 × 3 ICP) · product pitch cards (12) · cross-sell paths · battlecards · Klaviyo story · content library home |
| MRR calculator | **Retired** (Erik's decision — low/no usage) |
| Format | Each item: title, one-line "what this fixes," the content itself, tags |

**R0/R1 scope note:** search can be basic (tag filter, not full-text) for the weekend build; v10 content migrates as-is into the new stencils, full re-tagging is a fast-follow.

---

## 4. Demo Studio

**Purpose:** the existing demo/validation tool, embedded.

| Element | Detail |
|---|---|
| Embed | Presentation layer only — the tool as it exists (build review: front end ~90% done, verified) |
| Data | **Produces zero HubSpot data** — this must be stated in the UI itself if any deal-field-looking form is visible, not just in internal docs, to avoid a rep assuming it's saving something it isn't |
| Access | Behind the same login/roles as everything else |

---

## 5. Admin (owner/manager only)

| Section | Content |
|---|---|
| Lead-routing reference | Full assignment flow (account-based check → region gate → product round-robin → fallback → High Intent layer) |
| Product-owner table | 12 products → owners |
| Pricing reference | NB/EB median MRR tables |
| HubSpot field rules | Mandatory deal-property table + auto-flow explainer — **pending a quick Sean check** to confirm this doesn't duplicate HubSpot's own docs |
| Content management | Add/edit Winning Moves items |
| Weekly data upload | Manual cut ingestion (Sean's export → app) |
| User management | Roles, onboarding status per rep (wave 1 / wave 2 tracking) |

---

## 6. Help (footer link, not top-level nav — all roles)

| Content | Source |
|---|---|
| How to log a call/task properly | v10 Taken tab |
| Closed-Lost reason list | v10 Pipeline tab |
| Who to contact about the tool | v10 Verantwoordelijken tab (Glenn, Manuela, Sjoerd, Robbert) |
| Two business rules | Cross-sell 25/75 split · max 15% own-initiative discount — also surfaced as a small persistent card wherever reps already look, not buried only here |

---

## 7. Component inventory (for the design system mapping)

- **KPI tile** (funnel strip): number + comparison, no rank
- **Coaching panel card**: title, count, trend arrow, progress bar, team-average tag, next-action text block, optional rival-cue line
- **Leaderboard overlay**: ranked list, named row, blurred row (name-redacted, count-visible), footer caption
- **Streak/points header bar**
- **Role-gated nav** (5 items + footer Help link)
- **Content card** (Winning Moves): title, tag chips, body, type icon
- **Data-freshness stamp** (small, persistent, non-alarming)
- **Business-rules card** (persistent, same visual language as coaching panels)
- **Admin table** (reference-grade density — the one place dense tables are acceptable)

---

## 8. What happens after this document

This + `playbook-product-vision.md` + the Spotler design system = the complete brief for Claude Design. Recommended order once design starts:
1. Coaching Hub (highest-value screen, most scrutinised, sets the visual language for everything else)
2. Team page (reuses Coaching Hub's panel component at aggregate level)
3. Leaderboard overlay (a distinct interaction pattern, worth its own iteration)
4. Winning Moves / Admin / Help (lower novelty, mostly content-shell work, fastest to design once the language is set)

---
*This document is the design-ready layer. Vision doc = what & why. Research doc = evidence. This doc = exact screens, fields, states, copy, and components — nothing left for a designer to infer.*
