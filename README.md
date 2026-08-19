# Spotler Playbook — Coaching Hub

A self-contained static web app: the **Coaching Hub** for the Spotler Sales
Playbook. It gives each rep a personal coaching dashboard (points, streak,
funnel vs. team, coaching panels with leaderboards), a funnel-stage **Toolkit**
(lead-source protocols, discovery/closing scripts, pricing guide), an **Admin**
lead-routing reference, a **Use cases** explorer, and a **Demo Studio** slot.

Imported from the Claude Design project *"# Playbook Coaching Hub"* and wired to
run as a plain static site — no build step.

De data zit sinds de Supabase-omschakeling **niet meer in de bundle**. De code is
publiek, de gegevens staan achter een login in Supabase. Zie
[Supabase](#supabase) hieronder.

## Run it locally

It's a static site, so any static file server works:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

Open `/` (which serves `index.html`). Je krijgt eerst het inlogscherm: zonder
sessie laadt de app geen enkel gegeven. Na inloggen schakelen de **NL / EN**
knoppen de taal. De **"Bekijken als" / "Viewing as"** keuze is
managerfunctionaliteit — een rep ziet uitsluitend zichzelf.

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
| `playbook-data.js` | Data layer. Exposes `listReps()` and `getViewerSnapshot(repId, period)` — dezelfde twee functies met dezelfde vormen als altijd. De namenlijst komt nu uit Supabase (`profiles`); de weekcijfers worden nog steeds representatief gegenereerd. Zodra HubSpot en Jiminny leveren verandert alleen de body van `getViewerSnapshot()`. |
| `supabase-config.js` | **Enige plek met omgevingswaarden**: project-URL, anon key, cookiedomein, cookienaam. |
| `supabase-client.js` | Gedeelde Supabase-client: cookie-storage, inloggen, uitloggen, profiel. Bedoeld om **letterlijk te kopiëren** naar de demo studio. |
| `auth-gate.js` | Inlogscherm, sessieafhandeling en uitloggen. Vergrendelt de pagina tot er een sessie is. |
| `supabase/migrations/` | Het schema, de RLS-policies, `get_shared_summary` en de referentiedata. Herhaalbaar. |
| `supabase/tests/` | RLS-test, testset voor de gedeelde samenvatting, en de bewaartermijn-test. Draaien met `psql`; rollen zichzelf terug. |
| `scripts/` | Beheerscripts (Node). Gebruikers aanmaken en RLS testen via de echte API. Heeft een eigen `package.json`; de site zelf heeft nog steeds geen buildstap. |
| `_ds/spotler-design-system-…/` | The Spotler design system: CSS tokens (`tokens/*.css`), `styles.css`, and `_ds_bundle.js` (React components: Button, Card, Badge, Input, Select, Spotlight). |
| `usecases/` | The Use Case Menu sub-app (plain React). `app.js` defines `window.UseCaseApp`; `use_cases.js` + `strings_nl.js` are its data + Dutch strings; `uc-mockups.js` is a Web Component that draws the illustration mockups. `index.html` is a standalone entry. |
| `demo-studio/` | The interactive **Spotler Sales Tool** — a single self-contained bundle (`index.html`). Loaded in an iframe by the Coaching Hub's Demo Studio view and by the standalone `demo/` page. |
| `demo/` | Standalone **bilingual (NL / EN)** page that presents the Demo Studio at its own URL (`/demo/`): a Spotler-styled header with a language toggle, a "generates no HubSpot data" note, and the tool embedded below. Shareable on its own — no Coaching Hub shell required. |

## Notes on the import

A few things were adapted so the project runs as a standalone static site:

- **Fonts** — the design project ships Open Sans as local variable-font `.ttf`
  files, which exceed the import tool's per-file size limit. `tokens/fonts.css`
  therefore loads the same Open Sans family from Google Fonts (exactly as the
  Use Case Menu page already did). The type tokens still prefer *Greycliff CF*
  first, then Open Sans, then `system-ui`.
- **Demo Studio** — `demo-studio/index.html` is the real self-contained Sales
  Tool bundle. It is reachable two ways: embedded in the Coaching Hub's Demo
  Studio view, and via the standalone **`/demo/`** page, which wraps it in a
  bilingual (NL / EN) Spotler-styled chrome so it can be opened or shared at its
  own URL. The wrapper text (title, intro, no-HubSpot-data note, controls)
  switches language via the NL / EN toggle, `?lang=nl|en`, or a stored
  preference; the embedded tool is a fixed bundle and keeps its own copy.
- **React / Lucide** — loaded from unpkg at runtime (React 18.3.1, Lucide
  latest), matching the design project. The standalone Use Case Menu page loads
  React from the same CDN rather than vendoring the minified copies.

## Supabase

Project **Spotler Playbook**, organisatie **Spotlerik**, regio Central EU
(Frankfurt). Twee apps praten met deze database: het playbook en (straks) de
demo studio.

### Omgevingsvariabelen

Er zijn er drie, en het onderscheid tussen de eerste twee en de derde is het
hele beveiligingsmodel.

| Naam | Waar hij hoort | Waarom |
| --- | --- | --- |
| `SUPABASE_URL` | `supabase-config.js` (in de repo) én `scripts/.env` | Geen geheim. |
| `SUPABASE_ANON_KEY` | `supabase-config.js` (in de repo) én `scripts/.env` | **Mag publiek.** Hij geeft precies zoveel toegang als RLS toestaat en niet meer. Dat is een belofte die alleen klopt als de policies kloppen — zie *Volgorde* hieronder. |
| `SUPABASE_SERVICE_ROLE_KEY` | **uitsluitend** `scripts/.env`, nooit in de repo, nooit in de frontend | Deze sleutel omzeilt RLS volledig. Hij is er alleen voor het aanmaken van gebruikers en het opruimen na een test. |

`scripts/.env` en `scripts/.generated-passwords.txt` staan in `.gitignore`.

```bash
# scripts/.env
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

### Volgorde — dit is geen detail

De anon key mag publiek zijn *omdat* RLS klopt. Dus:

1. Migraties `0001` t/m `0004` draaien.
2. `supabase/tests/rls.sql` groen.
3. `supabase/tests/shared_summary.sql` groen.
4. `supabase/tests/retention.sql` groen.
5. `scripts/test-rls.mjs` groen (die test PostgREST + policies + anon key samen).
6. **Pas dan** de anon key in `supabase-config.js` zetten, in een aparte commit.

Een publieke key op nog niet bewezen policies is exact het lek dat we aan het
dichten waren, maar dan met echte gegevens erin.

### Migraties draaien

Herhaalbaar: elke migratie is idempotent, dus je kunt RLS bijstellen en opnieuw
draaien zonder het schema te laten vallen.

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/0001_schema.sql
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/0002_rls.sql
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/0003_shared_summary.sql
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/0004_seed_reference_data.sql
```

Of plakken in de SQL-editor, in deze volgorde.

**Projectinstellingen.** *Automatically expose new tables* staat UIT en
*Enable automatic RLS* staat AAN. Nieuwe tabellen zijn dus niet vanzelf via de
Data API bereikbaar. `0002_rls.sql` bevat daarom expliciete `GRANT`-regels; dat
blok **is** de blootstellingslijst. Blootgesteld aan `authenticated`:
`teams`, `profiles`, `prospects`, `demo_sessions`, `session_shares`,
`trusted_domains`, `blocked_domains`, `rep_tool_configs`, `product_owners`,
`app_settings`. Niet blootgesteld: `share_access_grants`,
`share_access_attempts` — die zijn alleen bereikbaar via de functies in `0003`.
Aan `anon`: geen enkele tabel, alleen drie RPC's.

### Tests draaien

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls.sql
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/shared_summary.sql
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/retention.sql

cd scripts && npm install && npm run test-rls
```

De SQL-tests rollen zichzelf terug en laten niets achter. Ze geven geen output
behalve een slotmelding; elke gefaalde controle klapt met een `FAIL —` regel.
`test-rls.mjs` maakt drie testaccounts aan, logt daarmee echt in met de anon key
en ruimt ze daarna op — de echte accounts worden niet aangeraakt.

### Een gebruiker toevoegen

1. Zet de persoon in `scripts/roster.mjs` (naam, e-mail in kleine letters, rol
   `rep` of `manager`).
2. `cd scripts && node create-users.mjs`

Het script is idempotent: bestaande accounts worden hergebruikt en alleen hun
profiel bijgewerkt, nieuwe krijgen een tijdelijk wachtwoord dat in
`scripts/.generated-passwords.txt` belandt (gitignored). Deel dat zelf en
verwijder het bestand daarna.

**Er gaat geen enkele mail uit.** Dat is de reden dat het script bestaat:
`admin.createUser({ email_confirm: true })` verstuurt niets, terwijl
`inviteUserByEmail()`, `generateLink()` en `signUp()` dat wél doen. Alleen de
eerste komt in het script voor. Heb je het account al met de hand in het
dashboard aangemaakt (met *Auto Confirm User*), draai het script dan alsnog: het
vindt het bestaande account en maakt de ontbrekende `profiles`-rij aan.

"Wachtwoord vergeten" in het inlogscherm werkt wel — dat is een handeling van de
gebruiker zelf, geen automatische mail bij het aanmaken.

### Waar het cookiedomein staat

Eén constante: `COOKIE_DOMAIN` in **`supabase-config.js`**.

```js
export const COOKIE_DOMAIN = null;          // nu: host-only
// export const COOKIE_DOMAIN = '.spotler.com';  // straks
```

Het playbook komt op `playbook.spotler.com` en de demo studio op
`demo.spotler.com`. Dat zijn verschillende origins, dus de standaard
localStorage-sessie wordt niet gedeeld. `supabase-client.js` geeft daarom een
eigen storage-adapter mee aan `createClient()` die de sessie in een cookie zet
(gesplitst over `naam.0`, `naam.1`, … omdat een sessie groter is dan de 4 KB per
cookie die browsers toestaan). Zodra DNS geregeld is, is het invullen van deze
ene constante de enige wijziging.

> **`github.io` staat op de Public Suffix List.** Browsers weigeren daar per
> definitie een cookie op `.github.io` — dat zou elke GitHub Pages-site toegang
> geven tot elkaars cookies. Op `spotlerik.github.io` blijft de sessie dus
> host-only, hoe je `COOKIE_DOMAIN` ook zet. Dat is geen bug en het lost zichzelf
> op zodra de site op een eigen domein staat. `supabase-client.js` waarschuwt in
> de console als de ingestelde waarde niet bij de huidige host past, in plaats
> van je stilzwijgend uit te loggen.

### Wat de demo studio moet overnemen

De demo studio komt in een aparte repo en een aparte bouwsessie, op dezelfde
database. Neem daar **ongewijzigd** over:

- `supabase-config.js` — inclusief dezelfde `STORAGE_KEY` en dezelfde
  `COOKIE_DOMAIN`. Wijken die af, dan deelt het cookiedomein wel de cookie maar
  leest de andere app hem niet, en logt de ene app de andere effectief uit.
- `supabase-client.js` — de client, de cookie-storage en de sessiefuncties.

Bouw daar geen tweede versie naast. Wat de demo studio er zelf bij bouwt is het
lezen en schrijven van `demo_sessions`, `prospects` en `session_shares`; het
schema en de RLS daarvoor staan er al.

Twee afspraken die het schema aan beide apps oplegt:

- `demo_sessions.state` bevat een object onder de sleutel `blocks`, met per
  samenvattingsblok één sleutel. `session_shares.included_blocks` is een array
  van diezelfde sleutels.
- Blokken uit `never_shareable_blocks()` (`internal_notes`, `rep_notes`,
  `coaching_notes`, `internal`) komen er nooit uit — niet als instelling maar als
  harde uitsluiting, afgedwongen bij het schrijven én bij het lezen.

### Bewaartermijn

**Aanname, geen beleid.** 24 maanden na afsluiting van de sessie worden
contactnaam en e-mailadres in `prospects` gewist; de sessiedata blijft bestaan,
dan zonder herleidbare persoon. Spotler heeft vrijwel zeker al een bewaartermijn
voor prospectgegevens in HubSpot; die moet deze overschrijven zodra hij bekend
is. Daarom staat de termijn op precies één plek:

```sql
update public.app_settings set value = '12'::jsonb
 where key = 'prospect_retention_months';
```

Meer is er niet te wijzigen — `supabase/tests/retention.sql` bewaakt dat
expliciet. Het opschonen zelf draait via
`select public.anonymize_expired_prospects();`, in te plannen als terugkerende
taak onder `service_role`.

### Nog niet gebouwd

Dit fundament levert het schema, de rechten en de login. Wat er bewust nog niet
is, en waar de volgende sessies over gaan:

- **De samenvattingspagina** (route `/s/`) en de mailer die het toegangstoken
  verstuurt. De database-kant staat er wel: `get_share_gate()`,
  `request_shared_summary_access()` en `get_shared_summary()` werken en zijn
  getest. De Edge Function die de toegangsmail stuurt kijkt naar
  `share_access_grants.notified_at is null`.
- **Het opslaan van demo-sessies** vanuit de demo studio.
- **De live HubSpot- en Jiminny-cijfers.** Tot die er zijn genereert
  `getViewerSnapshot()` representatieve weekcijfers, zoals voorheen.
