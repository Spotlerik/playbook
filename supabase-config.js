// ============================================================================
// supabase-config.js — de enige plek met omgevingsspecifieke waarden
// ============================================================================
// Dit bestand hoort in de repo. De anon key is publiek: hij mag in de
// frontend, want hij geeft precies zoveel toegang als RLS toestaat en niet
// meer. Dat is ook meteen de voorwaarde — zie de waarschuwing hieronder.
//
// De service_role key hoort hier NOOIT in. Die staat in scripts/.env en
// verlaat je machine niet.
//
// ⚠ VOLGORDE — de anon key mag pas ingevuld worden nadat:
//      1. de migraties 0001 t/m 0004 gedraaid zijn,
//      2. supabase/tests/rls.sql groen is,
//      3. supabase/tests/shared_summary.sql groen is,
//      4. scripts/test-rls.mjs groen is.
//   Een publieke key op nog niet bewezen policies is exact het lek dat we aan
//   het dichten zijn, maar dan met echte gegevens erin.
// ============================================================================

export const SUPABASE_URL = '';
export const SUPABASE_ANON_KEY = '';

// ---------------------------------------------------------------------------
// Cookiedomein — één constante, zoals afgesproken
// ---------------------------------------------------------------------------
// Het playbook komt op playbook.spotler.com en de demo studio op
// demo.spotler.com. Dat zijn verschillende origins, dus de standaard
// localStorage-sessie wordt niet gedeeld. Met een cookie op '.spotler.com'
// geldt één keer inloggen voor allebei.
//
// null  = host-only cookie, alleen geldig op de huidige host. Dat is nu de
//         juiste waarde: DNS is nog niet geregeld en op github.io kán het niet
//         anders (zie hieronder).
// '.spotler.com' = invullen zodra beide subdomeinen live staan. Verder is er
//         dan geen enkele codewijziging nodig.
//
// LET OP — github.io staat op de Public Suffix List. Browsers weigeren daar
// per definitie een cookie op '.github.io', want dat zou elke GitHub Pages-site
// toegang geven tot elkaars cookies. Op spotlerik.github.io blijft dit dus
// altijd host-only, hoe je deze constante ook zet. Dat is geen bug en het valt
// pas weg zodra de site op een eigen domein staat.
export const COOKIE_DOMAIN = null;

// Naam van de sessiecookie. Beide apps MOETEN dezelfde gebruiken, anders deelt
// het cookiedomein wel de cookie maar leest de andere app hem niet.
export const STORAGE_KEY = 'spotler-playbook-auth';
