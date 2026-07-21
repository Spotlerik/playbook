// The Use Case Menu — Spotler Activate
// Plain React (no build step). Ported from the Claude Design prototype
// (Use Case Menu.dc.html) — same behaviour and visual output, running on
// real React instead of the proprietary dc-runtime.
'use strict';

// Guard against the host page re-executing this helmet script (e.g. on a
// hot preview reload) — a second run must be a harmless no-op, never a
// top-level redeclaration error.
if (!window.UseCaseApp) {
class App extends React.Component {
  state = {
    data: null,
    lang: (this.props && this.props.lang) || 'en',
    industry: 'commerce',
    search: '',
    courses: [],       // array of course ids
    subs: [],          // array of challenge sub ids
    types: [],         // 'earn' | 'save'
    setups: [],        // 'core' | 'addon'
    needs: [],         // connection strings
    lifecycles: [],    // lifecycle stage strings
    view: 'cards',     // 'cards' | 'table'
    open: null,        // use case id
    expandedChallenge: null,
    tableSort: { key: 'number', dir: 'asc' },
    pitch: [],         // starred use case ids
    pitchCopied: false,
    expandedCards: [], // use case ids expanded to the tier-2 "quick why" state
  };

  componentDidMount() {
    this.setState({ data: window.USE_CASES }, () => this.readHash());
    window.addEventListener('hashchange', this._onHash = () => this.readHash());
    window.addEventListener('keydown', this._onKey = (e) => this.onKey(e));
  }
  componentWillUnmount() {
    window.removeEventListener('hashchange', this._onHash);
    window.removeEventListener('keydown', this._onKey);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.lang !== this.props.lang && this.props.lang && this.props.lang !== this.state.lang) {
      this.setState({ lang: this.props.lang });
    }
  }

  // -------- URL hash sync --------
  readHash() {
    const h = window.location.hash.replace(/^#/, '');
    if (!h) return;
    const q = Object.fromEntries(h.split('&').map(p => p.split('=').map(decodeURIComponent)));
    const s = {};
    if (q.industry) s.industry = q.industry;
    if (q.search) s.search = q.search;
    if (q.courses) s.courses = q.courses.split(',').filter(Boolean);
    if (q.subs) s.subs = q.subs.split(',').filter(Boolean);
    if (q.types) s.types = q.types.split(',').filter(Boolean);
    if (q.setups) s.setups = q.setups.split(',').filter(Boolean);
    if (q.needs) s.needs = q.needs.split(',').filter(Boolean);
    if (q.lifecycles) s.lifecycles = q.lifecycles.split(',').filter(Boolean);
    if (q.view) s.view = q.view;
    if (q.open) s.open = q.open;
    if (q.pitch) s.pitch = q.pitch.split(',').filter(Boolean);
    if (q.expanded) s.expandedCards = q.expanded.split(',').filter(Boolean);
    if (q.lang) s.lang = q.lang;
    this.setState(s);
  }
  writeHash(nextOverride) {
    const s = { ...this.state, ...(nextOverride || {}) };
    const parts = [];
    const put = (k, v) => { if (v && (Array.isArray(v) ? v.length : true)) parts.push(k + '=' + encodeURIComponent(Array.isArray(v) ? v.join(',') : v)); };
    if (s.industry !== 'commerce') put('industry', s.industry);
    if (s.lang && s.lang !== 'en') put('lang', s.lang);
    put('search', s.search);
    put('courses', s.courses);
    put('subs', s.subs);
    put('types', s.types);
    put('setups', s.setups);
    put('needs', s.needs);
    put('lifecycles', s.lifecycles);
    if (s.view !== 'cards') put('view', s.view);
    put('open', s.open);
    put('pitch', s.pitch);
    put('expanded', s.expandedCards);
    const h = parts.join('&');
    const target = h ? '#' + h : window.location.pathname + window.location.search;
    if (window.location.hash.replace(/^#/, '') !== h) {
      history.replaceState(null, '', target);
    }
  }
  set(patch) {
    this.setState(patch, () => this.writeHash());
  }
  toggleIn(key, val) {
    const arr = this.state[key] || [];
    const next = arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
    this.set({ [key]: next });
  }

  onKey(e) {
    if (!this.state.open) return;
    if (e.key === 'Escape') { this.set({ open: null }); }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const list = this.filtered();
      const i = list.findIndex(u => u.id === this.state.open);
      if (i < 0) return;
      const j = (i + (e.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length;
      this.set({ open: list[j].id });
    }
  }

  // -------- i18n --------
  t(s) {
    if (this.state.lang !== 'nl' || !s) return s;
    const dict = (typeof window !== 'undefined' && window.NL_STRINGS) || {};
    return dict[s] || s;
  }
  translateData(d) {
    if (this.state.lang !== 'nl' || !d) return d;
    const t = (s) => this.t(s);
    const tArr = (a) => Array.isArray(a) ? a.map(t) : a;
    const tMetrics = (m) => {
      if (!m) return m;
      const out = {};
      for (const k in m) out[k] = { value: m[k].value, label: t(m[k].label), context: t(m[k].context) };
      return out;
    };
    const tExamples = (e) => {
      if (!e) return e;
      const out = {};
      for (const k in e) out[k] = t(e[k]);
      return out;
    };
    return {
      ...d,
      meta: { ...d.meta, disclaimer: t(d.meta.disclaimer) },
      industries: d.industries.map(i => ({ ...i, label: t(i.label), sublabel: t(i.sublabel) })),
      lifecycle_stages: tArr(d.lifecycle_stages),
      connections: tArr(d.connections),
      courses: d.courses.map(c => ({ ...c, name: t(c.name), tagline: t(c.tagline), line: t(c.line) })),
      challenges: d.challenges.map(c => ({
        ...c, name: t(c.name), line: t(c.line),
        subs: c.subs.map(s => ({ ...s, short: t(s.short), label: t(s.label), sounds_like: t(s.sounds_like) })),
      })),
      use_cases: d.use_cases.map(u => ({
        ...u,
        name: t(u.name), hook: t(u.hook), blurb: t(u.blurb),
        problem: t(u.problem), how: t(u.how), rivals: u.rivals ? t(u.rivals) : u.rivals,
        capability: t(u.capability), lifecycle: t(u.lifecycle),
        demo_screen: t(u.demo_screen),
        needs: tArr(u.needs),
        metrics: tMetrics(u.metrics),
        examples: tExamples(u.examples),
        solves: u.solves.map(s => ({ ...s, label: t(s.label) })),
      })),
    };
  }

  // -------- filtering --------
  filtered() {
    const raw = this.state.data;
    if (!raw) return [];
    const d = this.translateData(raw);
    const { search, courses, subs, types, setups, needs, lifecycles } = this.state;
    const q = search.trim().toLowerCase();
    return d.use_cases.filter(u => {
      if (courses.length && !courses.includes(u.course)) return false;
      if (types.length && !types.includes(u.type)) return false;
      if (setups.length && !setups.includes(u.setup)) return false;
      if (needs.length && !needs.every(n => u.needs.includes(n))) return false;
      if (lifecycles.length && !lifecycles.includes(u.lifecycle)) return false;
      if (subs.length) {
        // OR across sub ids
        const ok = subs.some(sid => {
          const sub = d.challenges.flatMap(c => c.subs).find(s => s.id === sid);
          return sub && sub.use_case_ids.includes(u.id);
        });
        if (!ok) return false;
      }
      if (q) {
        const hay = [u.name, u.hook, u.problem, u.capability, u.blurb].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  clearAll() {
    this.set({ search: '', courses: [], subs: [], types: [], setups: [], needs: [], lifecycles: [] });
  }

  activeChips() {
    const d = this.translateData(this.state.data);
    if (!d) return [];
    const out = [];
    if (this.state.search) out.push({ label: `"${this.state.search}"`, remove: () => this.set({ search: '' }) });
    this.state.courses.forEach(id => {
      const c = d.courses.find(x => x.id === id);
      if (c) out.push({ label: c.name, color: c.color, remove: () => this.toggleIn('courses', id) });
    });
    this.state.subs.forEach(sid => {
      const sub = d.challenges.flatMap(c => c.subs).find(s => s.id === sid);
      if (sub) out.push({ label: sub.short, remove: () => this.toggleIn('subs', sid) });
    });
    this.state.types.forEach(t => out.push({ label: t === 'earn' ? this.t('Earn') : this.t('Save'), remove: () => this.toggleIn('types', t) }));
    this.state.setups.forEach(s => out.push({ label: s === 'core' ? this.t('Core') : this.t('Add-on'), remove: () => this.toggleIn('setups', s) }));
    this.state.needs.forEach(n => out.push({ label: n, remove: () => this.toggleIn('needs', n) }));
    this.state.lifecycles.forEach(l => out.push({ label: l, remove: () => this.toggleIn('lifecycles', l) }));
    return out;
  }

  render() {
    const R = React.createElement;
    const rawData = this.state.data;
    if (!rawData) {
      return R('div', { style: { minHeight: '100vh', background: 'var(--off-white)', padding: 40, color: '#6b7a89' } }, this.t('Loading…'));
    }
    const d = this.translateData(rawData);
    const B = d.brand;
    const T = (s) => this.t(s);

    // ---------- small helpers ----------
    const Chip = (opts) => R('span', {
      style: {
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', borderRadius: 999,
        fontSize: 11, fontWeight: 600,
        background: opts.bg || 'var(--off-white)', color: opts.color || B.ink,
        border: opts.border || '1px solid ' + B.line,
        letterSpacing: opts.upper ? '0.08em' : 0,
        textTransform: opts.upper ? 'uppercase' : 'none',
        whiteSpace: 'nowrap',
        cursor: opts.onClick ? 'pointer' : 'default',
      },
      onClick: opts.onClick,
    }, opts.children);

    const SectionLabel = (text) => R('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 } },
      R('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: B.muted } }, text),
      R('div', { style: { width: 28, height: 3, background: B.yellow, borderRadius: 2 } })
    );

    const courseById = (id) => d.courses.find(c => c.id === id);
    const subById = (id) => d.challenges.flatMap(c => c.subs).find(s => s.id === id);

    // ---------- HEADER ----------
    const brandLogo = R('img', {
      src: './assets/spotler-logo.svg',
      alt: 'Spotler',
      style: { height: 32, width: 'auto', display: 'block', flex: 'none' },
    });

    const industrySwitch = R('div', {
      role: 'radiogroup', 'aria-label': 'Industry',
      style: { display: 'inline-flex', padding: 4, background: 'var(--grey-100)', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border)' }
    }, d.industries.map(ind => {
      const active = this.state.industry === ind.id;
      return R('button', {
        key: ind.id,
        role: 'radio', 'aria-checked': active,
        onClick: () => this.set({ industry: ind.id }),
        style: {
          border: 0, cursor: 'pointer',
          padding: '8px 18px', borderRadius: 'var(--radius-pill)',
          fontSize: 13, fontWeight: 700,
          background: active ? 'var(--navy)' : 'transparent',
          color: active ? '#fff' : 'var(--fg1)',
          transition: 'background .18s, color .18s',
        },
      }, R('span', { style: { display: 'block', lineHeight: 1 } }, ind.label),
         R('span', { style: { display: 'block', fontSize: 10, fontWeight: 500, opacity: active ? 0.75 : 0.55, marginTop: 3 } }, ind.sublabel));
    }));

    const header = this.props.hideHeader ? null : R('header', {
      style: {
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid ' + B.line,
      }
    }, R('div', {
      style: { maxWidth: 1440, margin: '0 auto', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 24, justifyContent: 'space-between' }
    },
      R('div', { style: { display: 'flex', alignItems: 'center', gap: 18 } },
        brandLogo,
        R('div', { style: { height: 32, width: 1, background: B.line } }),
        R('div', {},
          R('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: B.muted, textTransform: 'uppercase' } }, T('The')),
          R('div', { style: { fontSize: 20, fontWeight: 800, color: B.navy, letterSpacing: '-0.01em', lineHeight: 1 } }, T('Use Case Menu')),
        ),
      ),
      R('div', { style: { display: 'flex', alignItems: 'center', gap: 16 } },
        R('div', { style: { display: 'inline-flex', padding: 3, background: '#fff', borderRadius: 999, border: '1px solid ' + B.line } },
          ['en', 'nl'].map(lg => R('button', {
            key: lg,
            onClick: () => this.set({ lang: lg }),
            'aria-pressed': this.state.lang === lg,
            style: {
              border: 0, cursor: 'pointer',
              padding: '6px 12px', borderRadius: 999,
              fontSize: 11, fontWeight: 800, letterSpacing: '0.08em',
              background: this.state.lang === lg ? B.navy : 'transparent',
              color: this.state.lang === lg ? '#fff' : B.ink,
              textTransform: 'uppercase',
            }
          }, lg))),
        R('div', { style: { fontSize: 11, fontWeight: 700, color: B.muted, letterSpacing: '0.14em', textTransform: 'uppercase' } }, T('Industry')),
        industrySwitch,
      ),
    ));

    // ---------- HERO — Start where it hurts ----------
    const chall = this.state.expandedChallenge;
    const hero = R('section', {
      style: {
        maxWidth: 1440, margin: '32px auto 0', padding: '0 32px',
      }
    },
      R('div', { style: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, marginBottom: 18, flexWrap: 'wrap' } },
        R('div', {},
          R('div', { style: { display: 'inline-flex', alignItems: 'center', gap: 10, background: B.yellow, padding: '4px 10px', borderRadius: 4, fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: B.navy } }, T('Start where it hurts')),
          R('h1', { style: { margin: '12px 0 4px', fontSize: 34, fontWeight: 800, color: B.navy, letterSpacing: '-0.02em', lineHeight: 1.1 } }, T('What is the prospect actually struggling with?')),
          R('div', { style: { fontSize: 15, color: B.muted, maxWidth: 640 } }, T('Pick a challenge, then the specific pain. We will filter the menu to the two or three use cases that solve it.')),
        ),
        null,
      ),
      R('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 } },
        d.challenges.map(c => {
          const isOpen = chall === c.id;
          return R('div', {
            key: c.id,
            style: {
              background: '#fff', borderRadius: 20, padding: 20,
              border: '1px solid ' + (isOpen ? B.cyan : B.line),
              boxShadow: isOpen ? '0 8px 30px rgba(35,175,230,0.15)' : '0 1px 3px rgba(0,42,77,0.05)',
              transition: 'border-color .18s, box-shadow .18s',
              cursor: isOpen ? 'default' : 'pointer',
            },
            onClick: () => { if (!isOpen) this.setState({ expandedChallenge: c.id }); },
          },
            R('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
              R('div', {
                style: {
                  width: 44, height: 44, borderRadius: '50%', background: B.yellow,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: B.navy, fontWeight: 800, fontSize: 20,
                },
              }, c.name[0]),
              R('div', {},
                R('div', { style: { fontSize: 18, fontWeight: 800, color: B.navy, letterSpacing: '-0.01em' } }, c.name),
                R('div', { style: { fontSize: 13, color: B.muted } }, c.line),
              ),
              isOpen && R('button', {
                onClick: (e) => { e.stopPropagation(); this.setState({ expandedChallenge: null }); },
                style: { marginLeft: 'auto', border: 0, background: 'transparent', color: B.muted, cursor: 'pointer', fontSize: 20, lineHeight: 1 },
                'aria-label': 'Collapse',
              }, '×'),
            ),
            isOpen && R('div', { style: { marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, animation: 'ucm-fade .2s ease-out' } },
              c.subs.map(s => R('button', {
                key: s.id,
                onClick: () => this.set({ subs: [s.id], expandedChallenge: null }),
                style: {
                  textAlign: 'left', border: '1px solid ' + B.line, background: 'var(--off-white)',
                  borderRadius: 12, padding: '10px 12px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: 3,
                  transition: 'background .15s, border-color .15s',
                },
                onMouseEnter: (e) => { e.currentTarget.style.background = B.cyan_tint; e.currentTarget.style.borderColor = B.cyan; },
                onMouseLeave: (e) => { e.currentTarget.style.background = 'var(--off-white)'; e.currentTarget.style.borderColor = B.line; },
              },
                R('span', { style: { fontSize: 13, fontWeight: 700, color: B.navy } }, s.label),
                R('span', { style: { fontSize: 12, color: B.muted, fontStyle: 'italic' } }, s.sounds_like),
              )),
            ),
          );
        }),
      ),
    );

    // ---------- FILTER RAIL ----------
    const filterGroup = (title, children) => R('div', { style: { marginBottom: 22 } }, SectionLabel(title), children);

    const checkbox = (label, checked, onClick, colorSwatch) => R('button', {
      key: label,
      role: 'checkbox', 'aria-checked': checked,
      onClick,
      style: {
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: '6px 4px', border: 0, background: 'transparent',
        cursor: 'pointer', textAlign: 'left',
      },
    },
      R('span', {
        style: {
          width: 16, height: 16, borderRadius: 4, flex: 'none',
          border: '1.5px solid ' + (checked ? B.cyan : B.line),
          background: checked ? B.cyan : '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background .15s, border-color .15s',
        },
      }, checked && R('svg', { width: 10, height: 10, viewBox: '0 0 10 10' }, R('path', { d: 'M1 5l3 3 5-6', stroke: '#fff', strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }))),
      colorSwatch && R('span', { style: { width: 10, height: 10, borderRadius: 2, background: colorSwatch, flex: 'none' } }),
      R('span', { style: { fontSize: 13, color: B.ink } }, label),
    );

    const searchField = R('div', { style: { position: 'relative', marginBottom: 20 } },
      R('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', style: { position: 'absolute', top: 12, left: 12, color: B.muted } },
        R('circle', { cx: 11, cy: 11, r: 7, stroke: 'currentColor', strokeWidth: 2 }),
        R('path', { d: 'M20 20l-3.5-3.5', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' })
      ),
      R('input', {
        type: 'text', value: this.state.search, placeholder: T('Search use cases…'),
        onChange: (e) => this.set({ search: e.target.value }),
        style: {
          width: '100%', padding: '10px 12px 10px 36px',
          border: '1px solid ' + B.line, borderRadius: 10,
          fontSize: 13, background: '#fff', color: B.ink, outline: 'none',
          fontFamily: 'inherit',
        },
        onFocus: (e) => e.target.style.borderColor = B.cyan,
        onBlur: (e) => e.target.style.borderColor = B.line,
      }),
    );

    const rail = R('aside', {
      style: {
        position: 'sticky', top: 96,
        alignSelf: 'start',
        background: '#fff', borderRadius: 20, padding: 22,
        border: '1px solid ' + B.line, boxShadow: '0 1px 3px rgba(0,42,77,0.05)',
        maxHeight: 'calc(100vh - 120px)', overflowY: 'auto',
      }
    },
      R('div', { style: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 } },
        R('div', { style: { fontSize: 14, fontWeight: 800, color: B.navy, letterSpacing: '-0.01em' } }, T('Filter')),
        R('button', {
          onClick: () => this.clearAll(),
          style: { border: 0, background: 'transparent', color: B.cyan_shade, fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0 },
        }, T('Clear all')),
      ),
      searchField,
      filterGroup(T('Outcome course'), d.courses.map(c => checkbox(c.name, this.state.courses.includes(c.id), () => this.toggleIn('courses', c.id), c.color))),
      filterGroup(T('Challenge'), d.challenges.map(c => R('div', { key: c.id, style: { marginBottom: 8 } },
        R('div', { style: { fontSize: 12, fontWeight: 700, color: B.navy, marginBottom: 4 } }, c.name),
        c.subs.map(s => checkbox(s.short, this.state.subs.includes(s.id), () => this.toggleIn('subs', s.id))),
      ))),
      filterGroup(T('Type'), [
        checkbox(T('Earn'), this.state.types.includes('earn'), () => this.toggleIn('types', 'earn'), B.earn),
        checkbox(T('Save'), this.state.types.includes('save'), () => this.toggleIn('types', 'save'), B.save),
      ]),
      filterGroup(T('Setup'), [
        checkbox(T('Core'), this.state.setups.includes('core'), () => this.toggleIn('setups', 'core')),
        checkbox(T('Add-on'), this.state.setups.includes('addon'), () => this.toggleIn('setups', 'addon')),
      ]),
      filterGroup(T('Needs'), d.connections.map(n => checkbox(n, this.state.needs.includes(n), () => this.toggleIn('needs', n)))),
      filterGroup(T('Lifecycle stage'), d.lifecycle_stages.map(l => checkbox(l, this.state.lifecycles.includes(l), () => this.toggleIn('lifecycles', l)))),
    );

    // ---------- CARDS ----------
    const filtered = this.filtered();
    const activeChips = this.activeChips();
    const industryLabel = d.industries.find(i => i.id === this.state.industry).label;

    const metricPill = (m, type, big) => {
      const color = type === 'earn' ? B.earn : B.save;
      const bg = type === 'earn' ? '#e6f6ea' : B.cyan_tint;
      return R('div', {
        style: {
          display: 'inline-flex', alignItems: 'baseline', gap: 8,
          padding: big ? '10px 14px' : '6px 10px',
          borderRadius: 12, background: bg, color,
        }
      },
        R('span', { style: { fontSize: big ? 26 : 18, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 } }, m.value),
        R('span', { style: { fontSize: big ? 12 : 11, fontWeight: 700, color: B.ink, opacity: 0.75 } }, m.label),
      );
    };

    // Tier-2 "quick why" is a digest, not the full-detail text — trim to the
    // first sentence (with a hard length cap as a safety net for run-on
    // sentences) rather than showing the whole problem/how paragraph.
    const digest = (text, max) => {
      max = max || 120;
      if (!text) return text;
      const m = text.match(/^[^.!?]*[.!?]+/);
      let s = m ? m[0].trim() : text;
      if (s.length > max) s = s.slice(0, max - 1).trim() + '…';
      return s;
    };

    const chevron = (expanded) => R('svg', {
      width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none',
      style: { flex: 'none', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .18s ease-out' },
    }, R('path', { d: 'M6 9l6 6 6-6', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }));

    const card = (u) => {
      const c = courseById(u.course);
      const m = u.metrics[this.state.industry];
      const starred = this.state.pitch.includes(u.id);
      const expanded = this.state.expandedCards.includes(u.id);
      const toggle = () => this.toggleIn('expandedCards', u.id);
      return R('article', {
        key: u.id,
        onClick: toggle,
        tabIndex: 0,
        'aria-expanded': expanded,
        onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } },
        style: {
          position: 'relative',
          display: 'flex', flexDirection: 'column',
          background: '#fff', borderRadius: 16,
          border: '1px solid ' + B.line,
          overflow: 'hidden',
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,42,77,0.05)',
          transition: 'transform .18s, box-shadow .18s, border-color .18s',
          animation: 'ucm-fade .2s ease-out',
        },
        onMouseEnter: (e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,42,77,0.10)'; e.currentTarget.style.borderColor = '#d0dde5'; },
        onMouseLeave: (e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,42,77,0.05)'; e.currentTarget.style.borderColor = B.line; },
      },
        R('div', { style: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 5, background: c.color } }),
        R('button', {
          'aria-label': starred ? 'Remove from pitch' : 'Add to pitch',
          onClick: (e) => { e.stopPropagation(); const p = this.state.pitch; this.set({ pitch: p.includes(u.id) ? p.filter(x => x !== u.id) : [...p, u.id] }); },
          style: {
            position: 'absolute', top: 12, right: 12,
            width: 30, height: 30, borderRadius: 8,
            border: '1px solid ' + (starred ? B.yellow : B.line),
            background: starred ? B.yellow : '#fff', color: B.navy,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
          },
        }, R('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: starred ? B.navy : 'none' },
          R('path', { d: 'M12 2l3 6.5 7 1-5 5 1.2 7L12 18l-6.2 3.5L7 14 2 9l7-1z', stroke: B.navy, strokeWidth: 1.5, strokeLinejoin: 'round' }))),

        // ---- TIER 1 — closed card: name, hook, hero metric only ----
        R('div', { style: { padding: '20px 20px 16px 24px' } },
          R('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
            R('div', {
              style: {
                width: 36, height: 36, borderRadius: '50%',
                background: B.cyan, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800, letterSpacing: '-0.02em',
                flex: 'none',
              },
            }, String(u.number).padStart(2, '0')),
            R('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.color } }, c.name),
          ),
          R('h3', { style: { margin: '14px 0 4px', fontSize: 18, fontWeight: 800, color: B.navy, letterSpacing: '-0.01em', lineHeight: 1.2 } }, u.name),
          R('div', { style: { fontSize: 13, color: B.cyan_shade, fontStyle: 'italic', marginBottom: 12 } }, u.hook),
          R('div', {}, metricPill(m, u.type, true)),
        ),

        // ---- TIER 2 — expanded "quick why": animates open in place ----
        R('div', {
          style: {
            display: 'grid',
            gridTemplateRows: expanded ? '1fr' : '0fr',
            transition: 'grid-template-rows .22s ease-out',
          },
        },
          R('div', { style: { overflow: 'hidden' } },
            R('div', { style: { padding: '0 20px 16px 24px', display: 'flex', flexDirection: 'column', gap: 10 } },
              R('div', {},
                R('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: B.muted, marginBottom: 3 } }, T('The problem')),
                R('div', { style: { fontSize: 13, color: B.ink, lineHeight: 1.4 } }, digest(u.problem)),
              ),
              R('div', {},
                R('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: B.muted, marginBottom: 3 } }, T('How Spotler Activate does it')),
                R('div', { style: { fontSize: 13, color: B.ink, lineHeight: 1.4 } }, digest(u.how)),
              ),
              R('div', { style: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } },
                R('svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', style: { color: B.muted, flex: 'none' } },
                  R('path', { d: 'M9 6V3M15 6V3M6 11h12M8 11v6a3 3 0 003 3h2a3 3 0 003-3v-6', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' })),
                u.needs.map(n => Chip({ children: n, bg: '#fff', border: '1px solid ' + B.line, color: B.muted, key: n })),
              ),
              u.solves.length > 0 && R('div', { style: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } },
                R('span', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: B.muted, flex: 'none' } }, T('Solves')),
                u.solves.slice(0, 2).map(s => Chip({ children: s.label, bg: '#fffdea', border: '1px solid ' + B.yellow, color: B.navy, key: s.sub_id })),
                u.solves.length > 2 && Chip({ children: '+' + (u.solves.length - 2), bg: '#fffdea', border: '1px solid ' + B.yellow, color: B.navy }),
              ),
              R('button', {
                onClick: (e) => { e.stopPropagation(); this.set({ open: u.id }); },
                style: {
                  alignSelf: 'flex-start', border: 0, background: 'transparent', padding: 0,
                  color: B.cyan_shade, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                },
              }, T('Full details') + ' →'),
            ),
          ),
        ),

        // ---- expand affordance — obvious, always visible ----
        R('button', {
          onClick: (e) => { e.stopPropagation(); toggle(); },
          'aria-expanded': expanded,
          'aria-label': expanded ? T('Show less') : T('See how'),
          style: {
            marginTop: expanded ? 0 : 'auto',
            width: '100%', border: 0, borderTop: '1px solid ' + B.line,
            background: expanded ? 'var(--off-white)' : '#fff', color: B.cyan_shade,
            padding: '10px 20px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontSize: 12, fontWeight: 700,
          },
        }, R('span', {}, expanded ? T('Show less') : T('See how')), chevron(expanded)),
      );
    };

    // Group filtered by course
    const bands = d.courses.map(c => {
      const items = filtered.filter(u => u.course === c.id);
      return { course: c, items };
    });

    const bandsRender = bands.map(({ course: c, items }) => items.length === 0 ? null : R('section', {
      key: c.id,
      style: { marginBottom: 40 },
    },
      R('div', { style: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 } },
        R('div', {
          style: {
            fontSize: 40, fontWeight: 800, color: c.color, letterSpacing: '-0.03em', lineHeight: 1,
          },
        }, c.no),
        R('div', { style: { flex: 1 } },
          R('div', { style: { display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' } },
            R('h2', { style: { margin: 0, fontSize: 24, fontWeight: 800, color: B.navy, letterSpacing: '-0.02em' } }, c.tagline),
            R('div', { style: { fontSize: 12, fontWeight: 700, color: B.muted, letterSpacing: '0.08em', textTransform: 'uppercase' } }, `${items.length} ${items.length === 1 ? T('use case') : T('use cases')}`),
          ),
          R('div', { style: { fontSize: 14, color: B.muted, marginTop: 2 } }, c.line),

          R('div', { style: { width: 32, height: 3, background: B.yellow, borderRadius: 2, marginTop: 8 } }),
        ),
      ),
      R('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 } }, items.map(card)),
    ));

    // ---------- TABLE ----------
    const sortIcon = (key) => {
      if (this.state.tableSort.key !== key) return null;
      return R('span', { style: { marginLeft: 4, fontSize: 10 } }, this.state.tableSort.dir === 'asc' ? '▲' : '▼');
    };
    const sortBy = (key) => {
      const s = this.state.tableSort;
      const dir = s.key === key && s.dir === 'asc' ? 'desc' : 'asc';
      this.setState({ tableSort: { key, dir } });
    };
    const metricNum = (u, ind) => {
      const v = u.metrics[ind].value;
      const n = parseFloat(v.replace('%', '').replace('+', ''));
      return isNaN(n) ? 0 : n;
    };
    const sortedTable = [...filtered].sort((a, b) => {
      const { key, dir } = this.state.tableSort;
      let av, bv;
      if (key === 'number') { av = a.number; bv = b.number; }
      else if (key === 'name') { av = a.name.toLowerCase(); bv = b.name.toLowerCase(); }
      else if (key === 'metric') { av = metricNum(a, this.state.industry); bv = metricNum(b, this.state.industry); }
      else { av = a[key]; bv = b[key]; }
      if (av < bv) return dir === 'asc' ? -1 : 1;
      if (av > bv) return dir === 'asc' ? 1 : -1;
      return 0;
    });
    const th = (label, key) => R('th', {
      key: key || label,
      onClick: key ? () => sortBy(key) : undefined,
      style: {
        padding: '12px 14px', textAlign: 'left',
        fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: B.muted, cursor: key ? 'pointer' : 'default',
        borderBottom: '1px solid ' + B.line,
        userSelect: 'none', whiteSpace: 'nowrap',
      },
    }, label, sortIcon(key));

    const tableView = R('div', {
      style: { background: '#fff', borderRadius: 16, border: '1px solid ' + B.line, boxShadow: '0 1px 3px rgba(0,42,77,0.05)', overflow: 'hidden' },
    },
      R('div', { style: { overflow: 'auto' } },
        R('table', { style: { width: '100%', borderCollapse: 'collapse' } },
          R('thead', {}, R('tr', {},
            th('#', 'number'),
            th(T('Use case'), 'name'),
            th(T('Course')),
            th(T('Type'), 'type'),
            th(T('Setup'), 'setup'),
            ...d.industries.map(ind => R('th', {
              key: ind.id,
              onClick: () => sortBy('metric'),
              style: {
                padding: '12px 14px', textAlign: 'right',
                fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: this.state.industry === ind.id ? B.cyan_shade : B.muted,
                cursor: 'pointer',
                borderBottom: '1px solid ' + B.line,
                background: this.state.industry === ind.id ? B.cyan_tint : 'transparent',
                whiteSpace: 'nowrap',
              },
            }, ind.label, this.state.industry === ind.id && sortIcon('metric')))
          )),
          R('tbody', {}, sortedTable.map(u => {
            const c = courseById(u.course);
            return R('tr', {
              key: u.id,
              onClick: () => this.set({ open: u.id }),
              style: { cursor: 'pointer', borderBottom: '1px solid ' + B.line, transition: 'background .12s' },
              onMouseEnter: (e) => e.currentTarget.style.background = 'var(--off-white)',
              onMouseLeave: (e) => e.currentTarget.style.background = 'transparent',
            },
              R('td', { style: { padding: '14px', width: 42 } },
                R('div', {
                  style: {
                    width: 28, height: 28, borderRadius: '50%',
                    background: B.cyan, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800,
                  },
                }, String(u.number).padStart(2, '0'))),
              R('td', { style: { padding: '14px' } },
                R('div', { style: { fontWeight: 700, color: B.navy, fontSize: 14 } }, u.name),
                R('div', { style: { fontStyle: 'italic', color: B.cyan_shade, fontSize: 12, marginTop: 2 } }, u.hook)),
              R('td', { style: { padding: '14px' } },
                R('div', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } },
                  R('span', { style: { width: 8, height: 8, borderRadius: 2, background: c.color } }),
                  R('span', { style: { fontSize: 12, fontWeight: 700, color: B.navy } }, c.name))),
              R('td', { style: { padding: '14px' } },
                R('span', {
                  style: {
                    padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                    background: u.type === 'earn' ? '#e6f6ea' : B.cyan_tint,
                    color: u.type === 'earn' ? B.earn : B.save,
                    textTransform: 'capitalize',
                  }
                }, u.type)),
              R('td', { style: { padding: '14px', fontSize: 12, color: B.ink } }, u.setup === 'core' ? T('Core') : T('Add-on')),
              ...d.industries.map(ind => {
                const m = u.metrics[ind.id];
                const highlight = this.state.industry === ind.id;
                return R('td', {
                  key: ind.id,
                  style: {
                    padding: '14px', textAlign: 'right',
                    background: highlight ? B.cyan_tint : 'transparent',
                    whiteSpace: 'nowrap',
                  }
                },
                  R('div', {
                    style: { fontSize: 15, fontWeight: 800, color: highlight ? (u.type === 'earn' ? B.earn : B.save) : B.ink, letterSpacing: '-0.02em' }
                  }, m.value),
                  R('div', { style: { fontSize: 10, color: B.muted, marginTop: 1 } }, m.label));
              }),
            );
          })),
        ),
      ),
    );

    // ---------- TOOLBAR (view + chips + count) ----------
    const toolbar = R('div', {
      style: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 24 }
    },
      R('div', { style: { display: 'flex', alignItems: 'baseline', gap: 8 } },
        R('span', { style: { fontSize: 22, fontWeight: 800, color: B.navy, letterSpacing: '-0.02em' } }, filtered.length),
        R('span', { style: { fontSize: 13, color: B.muted } }, `${T('of')} ${d.use_cases.length} ${T('use cases')}`),
        R('span', { style: { fontSize: 13, color: B.muted } }, ' · ' + T('specified for') + ' '),
        R('span', { style: { fontSize: 13, fontWeight: 700, color: B.navy } }, industryLabel),
      ),
      activeChips.length > 0 && R('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' } },
        activeChips.map((ch, i) => R('span', {
          key: i,
          style: {
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 6px 4px 10px', borderRadius: 999,
            background: '#fff', border: '1px solid ' + (ch.color || B.line),
            fontSize: 11, fontWeight: 600, color: B.ink,
          }
        },
          ch.color && R('span', { style: { width: 8, height: 8, borderRadius: 2, background: ch.color } }),
          ch.label,
          R('button', {
            onClick: ch.remove,
            'aria-label': 'Remove filter',
            style: { border: 0, background: 'var(--off-white)', color: B.muted, width: 18, height: 18, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: 12, lineHeight: 1 },
          }, '×'),
        )),
        R('button', {
          onClick: () => this.clearAll(),
          style: { border: 0, background: 'transparent', color: B.cyan_shade, fontSize: 12, fontWeight: 700, cursor: 'pointer' },
        }, T('Clear all')),
      ),
      R('div', { style: { marginLeft: 'auto', display: 'inline-flex', padding: 3, background: '#fff', borderRadius: 10, border: '1px solid ' + B.line } },
        ['cards', 'table'].map(v => R('button', {
          key: v,
          onClick: () => this.set({ view: v }),
          'aria-pressed': this.state.view === v,
          style: {
            border: 0, cursor: 'pointer',
            padding: '6px 14px', borderRadius: 8,
            fontSize: 12, fontWeight: 700,
            background: this.state.view === v ? B.navy : 'transparent',
            color: this.state.view === v ? '#fff' : B.ink,
            textTransform: 'capitalize',
          }
        }, T(v)))),
    );

    const emptyState = filtered.length === 0 && R('div', {
      style: {
        padding: 48, textAlign: 'center', background: '#fff', borderRadius: 20, border: '1px dashed ' + B.line,
      }
    },
      R('div', { style: { fontSize: 42 } }, '🔎'),
      R('div', { style: { fontSize: 18, fontWeight: 800, color: B.navy, margin: '10px 0 6px' } }, T('No use cases match these filters')),
      R('div', { style: { fontSize: 13, color: B.muted, marginBottom: 16 } }, T('Loosen the filters or start fresh.')),
      R('button', {
        onClick: () => this.clearAll(),
        style: { border: 0, background: B.navy, color: '#fff', padding: '10px 20px', borderRadius: 999, cursor: 'pointer', fontSize: 13, fontWeight: 700 },
      }, T('Clear all filters')),
    );

    // ---------- DRAWER ----------
    let drawer = null;
    if (this.state.open) {
      const u = d.use_cases.find(x => x.id === this.state.open);
      if (u) {
        const c = courseById(u.course);
        const m = u.metrics[this.state.industry];
        drawer = R('div', {
          style: { position: 'fixed', inset: 0, zIndex: 100, animation: 'ucm-fade .18s ease-out' },
          role: 'dialog', 'aria-modal': true, 'aria-label': u.name,
        },
          R('div', {
            onClick: () => this.set({ open: null }),
            style: { position: 'absolute', inset: 0, background: 'rgba(0,42,77,0.35)', backdropFilter: 'blur(4px)' },
          }),
          R('div', {
            style: {
              position: 'absolute', top: 0, right: 0, bottom: 0,
              width: 'min(640px, 92vw)', background: '#fff',
              boxShadow: '-24px 0 60px rgba(0,42,77,0.25)',
              display: 'flex', flexDirection: 'column',
              animation: 'ucm-slidein .22s cubic-bezier(0.22,0.61,0.36,1)',
            },
          },
            // header
            R('div', { style: { padding: '24px 28px 20px', borderBottom: '1px solid ' + B.line, position: 'relative' } },
              R('div', { style: { position: 'absolute', left: 0, top: 24, bottom: 20, width: 5, background: c.color } }),
              R('div', { style: { display: 'flex', gap: 16, alignItems: 'flex-start' } },
                R('div', {
                  style: {
                    width: 44, height: 44, borderRadius: '50%', background: B.cyan, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 800, flex: 'none',
                  }
                }, String(u.number).padStart(2, '0')),
                R('div', { style: { flex: 1, minWidth: 0 } },
                  R('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.color } }, c.name + ' · ' + c.tagline),
                  R('h2', { style: { margin: '4px 0 4px', fontSize: 24, fontWeight: 800, color: B.navy, letterSpacing: '-0.02em' } }, u.name),
                  R('div', { style: { fontSize: 14, color: B.cyan_shade, fontStyle: 'italic' } }, u.hook),
                ),
                R('button', {
                  onClick: () => this.set({ open: null }),
                  'aria-label': 'Close',
                  style: {
                    border: '1px solid ' + B.line, background: '#fff', width: 34, height: 34, borderRadius: '50%',
                    cursor: 'pointer', color: B.ink, fontSize: 16, flex: 'none',
                  },
                }, '×'),
              ),
              R('div', { style: { marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' } },
                metricPill(m, u.type, true),
                Chip({ children: u.lifecycle, bg: 'var(--off-white)' }),
                Chip({ children: u.setup === 'core' ? T('Core') : T('Add-on'), bg: u.setup === 'core' ? B.navy_tint : '#f2ecff', color: u.setup === 'core' ? B.navy : '#4a2fa8' }),
                Chip({ children: u.capability, bg: '#fff', border: '1px dashed ' + B.line }),
              ),
            ),
            // body
            R('div', { style: { flex: 1, overflowY: 'auto', padding: '24px 28px 8px' } },
              // -- mockup hero --
              (() => {
                const icpMap = { commerce: 'commerce', travel: 'travel', culture: 'leisure' };
                const viewIsActivate = /Spotler Activate|dashboard|profile|segment builder|CDP|deck|report/i.test(u.demo_screen || '');
                return R('div', { style: { marginBottom: 22 } },
                  R('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 12 } },
                    R('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
                      R('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: B.muted } }, T('How it looks')),
                      R('div', { style: { width: 28, height: 3, background: B.yellow, borderRadius: 2 } }),
                    ),
                    R('div', { style: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: viewIsActivate ? B.navy : B.cyan_tint, color: viewIsActivate ? '#fff' : B.cyan_shade, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' } },
                      R('span', { style: { width: 6, height: 6, borderRadius: '50%', background: viewIsActivate ? B.cyan : B.cyan_shade } }),
                      viewIsActivate ? T('Marketer · Spotler Activate') : T('Customer-facing'),
                    ),
                  ),
                  R('div', {
                    style: {
                      background: '#fff', borderRadius: 12, overflow: 'hidden',
                      border: '1px solid ' + B.line, boxShadow: '0 4px 16px rgba(0,42,77,0.06)',
                    }
                  }, R('uc-mockup', { key: u.id + this.state.industry, 'uc-id': u.id, icp: icpMap[this.state.industry] || 'commerce', currency: 'eur' })),
                  u.demo_screen && R('div', { style: { marginTop: 8, fontSize: 11, color: B.muted, fontStyle: 'italic', lineHeight: 1.45 } }, u.demo_screen),
                );
              })(),
              R('div', { style: { marginBottom: 22 } },
                SectionLabel(T('The problem')),
                R('p', { style: { margin: 0, fontSize: 15, color: B.ink, lineHeight: 1.55 } }, u.problem),
              ),
              R('div', { style: { marginBottom: 22 } },
                SectionLabel(T('How Spotler Activate does it')),
                R('p', { style: { margin: 0, fontSize: 15, color: B.ink, lineHeight: 1.55 } }, u.how),
              ),
              u.rivals && R('div', {
                style: {
                  marginBottom: 22, padding: '12px 14px',
                  background: B.cyan_tint, borderLeft: '3px solid ' + B.cyan,
                  borderRadius: 8,
                },
              },
                R('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: B.cyan_shade, marginBottom: 4 } }, T('Where rivals fall short')),
                R('div', { style: { fontSize: 13, color: B.ink, lineHeight: 1.5 } }, u.rivals),
              ),
              R('div', { style: { marginBottom: 22 } },
                SectionLabel(T('What it looks like — per industry')),
                R('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 } },
                  d.industries.map(ind => {
                    const highlight = this.state.industry === ind.id;
                    const im = u.metrics[ind.id];
                    return R('div', {
                      key: ind.id,
                      onClick: () => this.set({ industry: ind.id }),
                      style: {
                        cursor: 'pointer',
                        padding: 14, borderRadius: 12,
                        background: highlight ? B.cyan_tint : 'var(--off-white)',
                        border: '1px solid ' + (highlight ? B.cyan : B.line),
                        transition: 'background .15s, border-color .15s',
                      },
                    },
                      R('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: highlight ? B.cyan_shade : B.muted, marginBottom: 6 } }, ind.label),
                      R('div', { style: { fontSize: 20, fontWeight: 800, color: u.type === 'earn' ? B.earn : B.save, letterSpacing: '-0.02em' } }, im.value),
                      R('div', { style: { fontSize: 11, color: B.muted, marginBottom: 8 } }, im.label),
                      R('div', { style: { fontSize: 12, color: B.ink, lineHeight: 1.45 } }, u.examples[ind.id]),
                    );
                  })
                ),
              ),
            ),
            // footer
            R('div', { style: { padding: '18px 28px 22px', borderTop: '1px solid ' + B.line, background: 'var(--off-white)' } },
              R('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 20 } },
                R('div', { style: { flex: 1, minWidth: 200 } },
                  R('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: B.muted, marginBottom: 8 } }, T('Needs')),
                  R('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } }, u.needs.map(n => Chip({ children: n, key: n, bg: '#fff', border: '1px solid ' + B.line, color: B.muted }))),
                ),
                u.solves.length > 0 && R('div', { style: { flex: 1, minWidth: 200 } },
                  R('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: B.muted, marginBottom: 8 } }, T('Solves')),
                  R('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } }, u.solves.map(s => Chip({
                    children: s.label,
                    key: s.sub_id,
                    bg: '#fffdea', border: '1px solid ' + B.yellow, color: B.navy,
                    onClick: () => this.set({ subs: [s.sub_id], open: null }),
                  }))),
                ),
              ),
              R('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid ' + B.line } },
                R('div', { style: { fontSize: 11, color: B.muted } }, T('← → navigate · Esc to close')),
                R('div', { style: { display: 'flex', gap: 8 } },
                  R('button', {
                    onClick: () => this.onKey({ key: 'ArrowLeft' }),
                    style: { border: '1px solid ' + B.line, background: '#fff', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: B.ink },
                  }, T('← Prev')),
                  R('button', {
                    onClick: () => this.onKey({ key: 'ArrowRight' }),
                    style: { border: 0, background: B.navy, color: '#fff', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700 },
                  }, T('Next →')),
                ),
              ),
            ),
          ),
        );
      }
    }

    // ---------- PITCH TRAY ----------
    let pitchTray = null;
    if (this.state.pitch.length > 0) {
      const items = this.state.pitch.map(id => d.use_cases.find(u => u.id === id)).filter(Boolean);
      const copyText = () => {
        const lines = items.map(u => `#${String(u.number).padStart(2, '0')} ${u.name} — ${u.hook}\n  ${u.metrics[this.state.industry].value} ${u.metrics[this.state.industry].label} (${industryLabel})`).join('\n\n');
        const head = `${T('Spotler Activate — pitch shortlist for ')}${industryLabel}\n\n`;
        navigator.clipboard && navigator.clipboard.writeText(head + lines);
        this.setState({ pitchCopied: true });
        setTimeout(() => this.setState({ pitchCopied: false }), 1600);
      };
      pitchTray = R('div', {
        style: {
          position: 'fixed', bottom: 20, right: 20, zIndex: 50,
          background: B.navy, color: '#fff', borderRadius: 16,
          boxShadow: '0 20px 40px rgba(0,42,77,0.35)',
          padding: 16, width: 320,
          animation: 'ucm-pop .2s ease-out',
        }
      },
        R('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 } },
          R('div', { style: { fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' } }, T('My pitch · ') + items.length),
          R('button', {
            onClick: () => this.set({ pitch: [] }),
            style: { border: 0, background: 'transparent', color: '#93aebf', cursor: 'pointer', fontSize: 11, fontWeight: 700 },
          }, T('Clear')),
        ),
        R('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto', marginBottom: 12 } },
          items.map(u => R('div', {
            key: u.id,
            style: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', cursor: 'pointer' },
            onClick: () => this.set({ open: u.id }),
          },
            R('div', { style: { width: 22, height: 22, borderRadius: '50%', background: B.cyan, color: B.navy, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, String(u.number).padStart(2, '0')),
            R('div', { style: { flex: 1, minWidth: 0, fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, u.name),
            R('button', {
              onClick: (e) => { e.stopPropagation(); this.set({ pitch: this.state.pitch.filter(x => x !== u.id) }); },
              style: { border: 0, background: 'transparent', color: '#93aebf', cursor: 'pointer', padding: 2, fontSize: 14 },
              'aria-label': 'Remove',
            }, '×'),
          )),
        ),
        R('button', {
          onClick: copyText,
          style: { width: '100%', border: 0, background: B.cyan, color: B.navy, padding: '10px', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 800, letterSpacing: '0.04em' },
        }, this.state.pitchCopied ? T('✓ Copied to clipboard') : T('Copy shortlist')),
      );
    }

    // ---------- FOOTER ----------
    const footer = R('footer', {
      style: {
        maxWidth: 1440, margin: '40px auto 0', padding: '32px', borderTop: '1px solid ' + B.line, color: B.muted, fontSize: 12,
      }
    },
      R('div', { style: { display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' } },
        R('div', { style: { flex: 1, minWidth: 240 } },
          R('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: B.navy, marginBottom: 6 } }, T('A note on the numbers')),
          R('div', { style: { lineHeight: 1.5, maxWidth: 720 } }, d.meta.disclaimer),
        ),
        R('div', { style: { fontSize: 11 } }, T('© Spotler · '), d.meta.count, ' ' + T('use cases') + ' · ', d.meta.product),
      ),
    );

    // ---------- MAIN LAYOUT ----------
    const main = R('div', {
      style: { maxWidth: 1440, margin: '32px auto 0', padding: '0 32px 40px', display: 'grid', gridTemplateColumns: 'minmax(240px, 280px) 1fr', gap: 28, alignItems: 'start' }
    },
      rail,
      R('div', { style: { minWidth: 0 } },
        toolbar,
        this.state.view === 'cards'
          ? (filtered.length === 0 ? emptyState : R('div', {}, bandsRender))
          : (filtered.length === 0 ? emptyState : tableView),
      ),
    );

    return R('div', { style: { minHeight: '100vh', background: 'var(--off-white)' } }, header, hero, main, footer, drawer, pitchTray);
  }
}

window.UseCaseApp = App;
}
