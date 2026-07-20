# Spotler Playbook — Coaching Hub

A self-contained static web app: the **Coaching Hub** for the Spotler Sales
Playbook. It gives each rep a personal coaching dashboard (points, streak,
funnel vs. team, coaching panels with leaderboards), a funnel-stage **Toolkit**
(lead-source protocols, discovery/closing scripts, pricing guide), an **Admin**
lead-routing reference, a **Use cases** explorer, and a **Demo Studio** slot.

Imported from the Claude Design project *"# Playbook Coaching Hub"* and wired to
run as a plain static site — no build step.

## Run it locally

It's a static site, so any static file server works:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

Open `/` (which serves `index.html`). Use the **NL / EN** buttons top-right to
switch language and the **"Bekijken als" / "Viewing as"** dropdown to switch rep.

> Needs internet at runtime: React and the Lucide icon set load from unpkg, and
> Open Sans loads from Google Fonts. Opening the file over `file://` will not
> work because the app uses ES-module `import()` — serve it over HTTP.

## Hosting on GitHub Pages

The site is built to be served from the repository root, so GitHub Pages works
out of the box:

1. Repo **Settings → Pages**.
2. **Source:** *Deploy from a branch*, branch `main` (or your chosen branch),
   folder `/ (root)`.
3. The site publishes at `https://spotlerik.github.io/playbook/`.

All asset paths are relative, so it also works from a project sub-path.

## Structure

| Path | What it is |
| --- | --- |
| `index.html` | Servable entry point — the Coaching Hub (identical to `Coaching Hub.dc.html`). |
| `Coaching Hub.dc.html` | Canonical design source in Claude "Design Compiler" format (`<x-dc>` template + logic). Kept for round-tripping with the design project. |
| `support.js` | The Design Compiler runtime. Parses the `<x-dc>` template + logic and renders it with React (which it loads from unpkg). Auto-boots on `DOMContentLoaded`. |
| `playbook-data.js` | Data layer. Exposes `listReps()` and `getViewerSnapshot(repId, period)` over a deterministically-generated representative dataset. Swap the body for a live HubSpot cut without touching anything upstream. |
| `_ds/spotler-design-system-…/` | The Spotler design system: CSS tokens (`tokens/*.css`), `styles.css`, and `_ds_bundle.js` (React components: Button, Card, Badge, Input, Select, Spotlight). |
| `usecases/` | The Use Case Menu sub-app (plain React). `app.js` defines `window.UseCaseApp`; `use_cases.js` + `strings_nl.js` are its data + Dutch strings; `uc-mockups.js` is a Web Component that draws the illustration mockups. `index.html` is a standalone entry. |
| `demo-studio/` | Slot for the interactive sales Demo Studio tool (see note below). |

## Notes on the import

A few things were adapted so the project runs as a standalone static site:

- **Fonts** — the design project ships Open Sans as local variable-font `.ttf`
  files, which exceed the import tool's per-file size limit. `tokens/fonts.css`
  therefore loads the same Open Sans family from Google Fonts (exactly as the
  Use Case Menu page already did). The type tokens still prefer *Greycliff CF*
  first, then Open Sans, then `system-ui`.
- **Demo Studio** — `demo-studio/index.html` is a placeholder. The real tool is
  a single self-contained bundle larger than the 256 KB per-file import limit,
  so it could not be copied across automatically. Export it from the design
  project and drop it in at that path to restore the live tool; everything else
  works without it.
- **React / Lucide** — loaded from unpkg at runtime (React 18.3.1, Lucide
  latest), matching the design project. The standalone Use Case Menu page loads
  React from the same CDN rather than vendoring the minified copies.
