/* @ds-bundle: {"format":4,"namespace":"SpotlerDesignSystem_b204cb","components":[{"name":"Spotlight","sourcePath":"components/brand/Spotlight.jsx"},{"name":"Badge","sourcePath":"components/feedback/Badge.jsx"},{"name":"Button","sourcePath":"components/forms/Button.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Card","sourcePath":"components/surfaces/Card.jsx"}],"sourceHashes":{"components/brand/Spotlight.jsx":"da88e5106412","components/feedback/Badge.jsx":"e3ab7770f69e","components/forms/Button.jsx":"b4256028c7b6","components/forms/Input.jsx":"4347fe86939f","components/forms/Select.jsx":"9854c2115d72","components/surfaces/Card.jsx":"98e613b3d2a8","decks/deck-stage.js":"522102a1c71e","ui_kits/spotler-marketing/CtaBand.jsx":"1ffa90456069","ui_kits/spotler-marketing/FeatureGrid.jsx":"2434f623dd1f","ui_kits/spotler-marketing/Footer.jsx":"6d943d21d433","ui_kits/spotler-marketing/Hero.jsx":"11c82197e9e6","ui_kits/spotler-marketing/Nav.jsx":"0a664e3f20b3","ui_kits/spotler-marketing/Pricing.jsx":"9cc00bdaf5a8"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.SpotlerDesignSystem_b204cb = window.SpotlerDesignSystem_b204cb || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/Spotlight.jsx
try { (() => {
/**
 * Spotler Spotlight — the brand's Spirit Yellow circle attention device.
 * mode="icon": a yellow circle containing an icon glyph (child).
 * mode="behind": a yellow circle sitting behind a title/child, offset for emphasis.
 * Pure Spirit Yellow is reserved for this element only.
 */
function Spotlight({
  children,
  mode = 'icon',
  size = 56,
  offset = 0.5,
  color = 'var(--navy)',
  style = {}
}) {
  if (mode === 'behind') {
    return /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        ...style
      }
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      style: {
        position: 'absolute',
        left: -size * 0.15,
        top: `${(offset - 1) * 50}%`,
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--yellow)',
        zIndex: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'relative',
        zIndex: 1
      }
    }, children));
  }
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'var(--yellow)',
      color,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Spotlight });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Spotlight.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  active: {
    bg: 'var(--cyan-tint)',
    fg: 'var(--cyan-shade)',
    dot: 'var(--cyan-shade)'
  },
  success: {
    bg: 'var(--green-tint)',
    fg: 'var(--green-shade)',
    dot: 'var(--green-shade)'
  },
  warning: {
    bg: 'var(--orange-tint)',
    fg: 'var(--orange-shade)',
    dot: 'var(--orange-shade)'
  },
  neutral: {
    bg: 'var(--grey-50)',
    fg: 'var(--grey-500)',
    dot: 'var(--grey-300)'
  },
  review: {
    bg: 'var(--yellow-tint)',
    fg: '#7a6f00',
    dot: 'var(--yellow-shade)'
  },
  b2b: {
    bg: 'var(--orange-tint)',
    fg: 'var(--orange-shade)',
    dot: 'var(--orange)'
  },
  commerce: {
    bg: 'var(--purple-tint)',
    fg: 'var(--purple-shade)',
    dot: 'var(--purple)'
  },
  service: {
    bg: 'var(--green-tint)',
    fg: 'var(--green-shade)',
    dot: 'var(--green)'
  },
  core: {
    bg: 'var(--navy)',
    fg: '#fff',
    dot: 'var(--cyan)'
  }
};

/**
 * Spotler Badge — pill for statuses, cloud tags and region markers.
 * `dot` adds a leading status dot. `outline` renders the neutral region-pill look.
 */
function Badge({
  children,
  tone = 'neutral',
  dot = false,
  outline = false,
  style = {},
  ...rest
}) {
  const t = TONES[tone] || TONES.neutral;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 10px',
      borderRadius: 'var(--radius-pill)',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.02em',
      fontFamily: 'var(--font-body)',
      background: outline ? 'var(--grey-50)' : t.bg,
      color: outline ? 'var(--navy)' : t.fg,
      border: outline ? '1px solid var(--border)' : 'none',
      ...style
    }
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: t.dot,
      display: 'inline-block'
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Badge.jsx", error: String((e && e.message) || e) }); }

// components/forms/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Spotler Button. Cyan-on-navy primary, navy solid, ghost outline and link.
 * Pill by default (the brand's rounded-corner element). Hover deepens to the
 * -shade colour; press stays a colour shift, never a shrink.
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  iconLeft = null,
  iconRight = null,
  as = 'button',
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      padding: '8px 16px',
      fontSize: 13
    },
    md: {
      padding: '10px 18px',
      fontSize: 14
    },
    lg: {
      padding: '14px 24px',
      fontSize: 16
    }
  };
  const variants = {
    primary: {
      background: 'var(--cyan)',
      color: 'var(--navy)',
      border: '1.5px solid transparent'
    },
    dark: {
      background: 'var(--navy)',
      color: '#fff',
      border: '1.5px solid transparent'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--navy)',
      border: '1.5px solid var(--border-strong)'
    },
    link: {
      background: 'transparent',
      color: 'var(--cyan-shade)',
      border: '1.5px solid transparent'
    }
  };
  const isLink = variant === 'link';
  const Tag = as;
  const base = {
    fontFamily: 'var(--font-body)',
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: isLink ? 'var(--radius-xs)' : 'var(--radius-pill)',
    transition: 'background var(--dur) var(--ease-out), color var(--dur) var(--ease-out), border-color var(--dur) var(--ease-out)',
    lineHeight: 1,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    ...(isLink ? {
      padding: '8px 4px',
      fontSize: sizes[size].fontSize
    } : sizes[size]),
    ...variants[variant],
    ...(disabled ? {
      background: 'var(--cyan-tint)',
      color: 'var(--grey-300)',
      border: '1.5px solid transparent',
      pointerEvents: 'none'
    } : null),
    ...style
  };
  const hover = (e, on) => {
    if (disabled) return;
    const el = e.currentTarget;
    if (variant === 'primary') {
      el.style.background = on ? 'var(--cyan-shade)' : 'var(--cyan)';
      el.style.color = on ? '#fff' : 'var(--navy)';
    } else if (variant === 'dark') {
      el.style.background = on ? 'var(--navy-shade)' : 'var(--navy)';
    } else if (variant === 'ghost') {
      el.style.background = on ? 'var(--grey-50)' : 'transparent';
    } else if (variant === 'link') {
      el.style.borderBottomColor = on ? 'currentColor' : 'transparent';
    }
  };
  return /*#__PURE__*/React.createElement(Tag, _extends({
    style: base,
    disabled: as === 'button' ? disabled : undefined,
    onMouseEnter: e => hover(e, true),
    onMouseLeave: e => hover(e, false)
  }, rest), iconLeft, children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Button.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Spotler text Input with label, helper text and error state.
 * 1.5px border, 12px radius, cyan focus ring (2px + tint glow).
 */
function Input({
  label,
  value,
  placeholder,
  helper,
  error = false,
  type = 'text',
  id,
  style = {},
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  const fieldId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const borderColor = error ? 'var(--danger)' : focused ? 'var(--cyan)' : 'var(--border-strong)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      fontFamily: 'var(--font-body)',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--fg1)'
    }
  }, label), /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    type: type,
    value: value,
    placeholder: placeholder,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      font: 'inherit',
      fontSize: 14,
      padding: '12px 14px',
      border: `1.5px solid ${borderColor}`,
      borderRadius: 'var(--radius-md)',
      background: '#fff',
      color: 'var(--fg1)',
      outline: 'none',
      boxShadow: focused && !error ? '0 0 0 3px var(--cyan-tint)' : 'none',
      transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)'
    }
  }, rest)), helper && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: error ? 'var(--danger)' : 'var(--fg3)'
    }
  }, helper));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Spotler Select — native dropdown styled to match Input. Cyan focus ring.
 */
function Select({
  label,
  options = [],
  value,
  helper,
  id,
  style = {},
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  const fieldId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      fontFamily: 'var(--font-body)',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--fg1)'
    }
  }, label), /*#__PURE__*/React.createElement("select", _extends({
    id: fieldId,
    value: value,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      font: 'inherit',
      fontSize: 14,
      padding: '12px 14px',
      border: `1.5px solid ${focused ? 'var(--cyan)' : 'var(--border-strong)'}`,
      borderRadius: 'var(--radius-md)',
      background: '#fff',
      color: 'var(--fg1)',
      outline: 'none',
      boxShadow: focused ? '0 0 0 3px var(--cyan-tint)' : 'none',
      transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)'
    }
  }, rest), options.map(o => {
    const val = typeof o === 'string' ? o : o.value;
    const lab = typeof o === 'string' ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: val,
      value: val
    }, lab);
  })), helper && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--fg3)'
    }
  }, helper));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Spotler Card — a rounded surface with the navy-tinted Backdrop shadow.
 * `variant="light"` (white), `"navy"` (inverse), or `"cloud"` (uses the
 * --cloud tokens from an ancestor [data-cloud]). Rounded corners are core.
 */
function Card({
  children,
  variant = 'light',
  padding = 24,
  elevation = 'md',
  radius = 'lg',
  style = {},
  ...rest
}) {
  const shadowMap = {
    none: 'none',
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)'
  };
  const radiusMap = {
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)'
  };
  const variants = {
    light: {
      background: '#fff',
      color: 'var(--fg1)',
      border: '1px solid var(--border)'
    },
    navy: {
      background: 'var(--navy)',
      color: '#fff',
      border: 'none'
    },
    cloud: {
      background: '#fff',
      color: 'var(--fg1)',
      border: '1px solid var(--border)'
    }
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      borderRadius: radiusMap[radius] || radiusMap.lg,
      padding,
      boxShadow: shadowMap[elevation] || shadowMap.md,
      ...variants[variant],
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Card.jsx", error: String((e && e.message) || e) }); }

// decks/deck-stage.js
try { (() => {
/**
 * <deck-stage> — reusable web component for HTML decks.
 *
 * Handles:
 *  (a) speaker notes — reads <script type="application/json" id="speaker-notes">
 *      and posts {slideIndexChanged: N} to the parent window on nav.
 *  (b) keyboard navigation — ←/→, PgUp/PgDn, Space, Home/End, number keys.
 *  (c) press R to reset to slide 0 (with a tasteful keyboard hint).
 *  (d) bottom-center overlay showing slide count + hints, fades out on idle.
 *  (e) auto-scaling — inner canvas is a fixed design size (default 1920×1080)
 *      scaled with `transform: scale()` to fit the viewport, letterboxed.
 *      Set the `noscale` attribute to render at authored size (1:1) — the
 *      PPTX exporter sets this so its DOM capture sees unscaled geometry.
 *  (f) print — `@media print` lays every slide out as its own page at the
 *      design size, so the browser's Print → Save as PDF produces a clean
 *      one-page-per-slide PDF with no extra setup.
 *
 * Slides are HIDDEN, not unmounted. Non-active slides stay in the DOM with
 * `visibility: hidden` + `opacity: 0`, so their state (videos, iframes,
 * form inputs, React trees) is preserved across navigation.
 *
 * Lifecycle event — the component dispatches a `slidechange` CustomEvent on
 * itself whenever the active slide changes (including the initial mount).
 * The event bubbles and composes out of shadow DOM, so you can listen on
 * the <deck-stage> element or on document:
 *
 *   document.querySelector('deck-stage').addEventListener('slidechange', (e) => {
 *     e.detail.index         // new 0-based index
 *     e.detail.previousIndex // previous index, or -1 on init
 *     e.detail.total         // total slide count
 *     e.detail.slide         // the new active slide element
 *     e.detail.previousSlide // the prior slide element, or null on init
 *     e.detail.reason        // 'init' | 'keyboard' | 'click' | 'tap' | 'api'
 *   });
 *
 * Persistence: current slide index is saved to localStorage keyed by the
 * document path, so refresh returns you to the same place.
 *
 * Usage:
 *   <deck-stage width="1920" height="1080">
 *     <section data-label="Title">...</section>
 *     <section data-label="Agenda">...</section>
 *   </deck-stage>
 *
 * Slides are the direct element children of <deck-stage>. Each slide is
 * automatically tagged with:
 *   - data-screen-label="NN Label"   (1-indexed, for comment flow)
 *   - data-om-validate="no_overflowing_text,no_overlapping_text,slide_sized_text"
 */

(() => {
  const DESIGN_W_DEFAULT = 1920;
  const DESIGN_H_DEFAULT = 1080;
  const STORAGE_PREFIX = 'deck-stage:slide:';
  const OVERLAY_HIDE_MS = 1800;
  const VALIDATE_ATTR = 'no_overflowing_text,no_overlapping_text,slide_sized_text';
  const pad2 = n => String(n).padStart(2, '0');
  const stylesheet = `
    :host {
      position: fixed;
      inset: 0;
      display: block;
      background: #000;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
      overflow: hidden;
    }

    .stage {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .canvas {
      position: relative;
      transform-origin: center center;
      flex-shrink: 0;
      background: #fff;
      will-change: transform;
    }

    /* Slides live in light DOM (via <slot>) so authored CSS still applies.
       We absolutely position each slotted child to stack them. */
    ::slotted(*) {
      position: absolute !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
      box-sizing: border-box !important;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      visibility: hidden;
    }
    ::slotted([data-deck-active]) {
      opacity: 1;
      pointer-events: auto;
      visibility: visible;
    }

    /* Tap zones for mobile — back/forward thirds like Stories.
       Transparent, no visible UI, don't block the overlay. */
    .tapzones {
      position: fixed;
      inset: 0;
      display: flex;
      z-index: 2147482000;
      pointer-events: none;
    }
    .tapzone {
      flex: 1;
      pointer-events: auto;
      -webkit-tap-highlight-color: transparent;
    }
    /* Only activate tap zones on coarse pointers (touch devices). */
    @media (hover: hover) and (pointer: fine) {
      .tapzones { display: none; }
    }

    .overlay {
      position: fixed;
      left: 50%;
      bottom: 22px;
      transform: translate(-50%, 6px) scale(0.92);
      filter: blur(6px);
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px;
      background: #000;
      color: #fff;
      border-radius: 999px;
      font-size: 12px;
      font-feature-settings: "tnum" 1;
      letter-spacing: 0.01em;
      opacity: 0;
      pointer-events: none;
      transition: opacity 260ms ease, transform 260ms cubic-bezier(.2,.8,.2,1), filter 260ms ease;
      transform-origin: center bottom;
      z-index: 2147483000;
      user-select: none;
    }
    .overlay[data-visible] {
      opacity: 1;
      pointer-events: auto;
      transform: translate(-50%, 0) scale(1);
      filter: blur(0);
    }

    .btn {
      appearance: none;
      -webkit-appearance: none;
      background: transparent;
      border: 0;
      margin: 0;
      padding: 0;
      color: inherit;
      font: inherit;
      cursor: default;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 28px;
      min-width: 28px;
      border-radius: 999px;
      color: rgba(255,255,255,0.72);
      transition: background 140ms ease, color 140ms ease;
      -webkit-tap-highlight-color: transparent;
    }
    .btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
    .btn:active { background: rgba(255,255,255,0.18); }
    .btn:focus { outline: none; }
    .btn:focus-visible { outline: none; }
    .btn::-moz-focus-inner { border: 0; }
    .btn svg { width: 14px; height: 14px; display: block; }
    .btn.reset {
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.02em;
      padding: 0 10px 0 12px;
      gap: 6px;
      color: rgba(255,255,255,0.72);
    }
    .btn.reset .kbd {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      font-size: 10px;
      line-height: 1;
      color: rgba(255,255,255,0.88);
      background: rgba(255,255,255,0.12);
      border-radius: 4px;
    }

    .count {
      font-variant-numeric: tabular-nums;
      color: #fff;
      font-weight: 500;
      padding: 0 8px;
      min-width: 42px;
      text-align: center;
      font-size: 12px;
    }
    .count .sep { color: rgba(255,255,255,0.45); margin: 0 3px; font-weight: 400; }
    .count .total { color: rgba(255,255,255,0.55); }

    .divider {
      width: 1px;
      height: 14px;
      background: rgba(255,255,255,0.18);
      margin: 0 2px;
    }

    /* ── Print: one page per slide, no chrome ────────────────────────────
       The screen layout stacks every slide at inset:0 inside a scaled
       canvas; for print we want them in document flow at the authored
       design size so the browser paginates one slide per sheet. The
       @page size is set from the width/height attributes via the inline
       <style id="deck-stage-print-page"> that connectedCallback injects
       into <head> (the @page at-rule has no effect inside shadow DOM). */
    @media print {
      :host {
        position: static;
        inset: auto;
        background: none;
        overflow: visible;
        color: inherit;
      }
      .stage { position: static; display: block; }
      .canvas {
        transform: none !important;
        width: auto !important;
        height: auto !important;
        background: none;
        will-change: auto;
      }
      ::slotted(*) {
        position: relative !important;
        inset: auto !important;
        width: var(--deck-design-w) !important;
        height: var(--deck-design-h) !important;
        box-sizing: border-box !important;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto;
        break-after: page;
        page-break-after: always;
        break-inside: avoid;
        overflow: hidden;
      }
      ::slotted(*:last-child) {
        break-after: auto;
        page-break-after: auto;
      }
      .overlay, .tapzones { display: none !important; }
    }
  `;
  class DeckStage extends HTMLElement {
    static get observedAttributes() {
      return ['width', 'height', 'noscale'];
    }
    constructor() {
      super();
      this._root = this.attachShadow({
        mode: 'open'
      });
      this._index = 0;
      this._slides = [];
      this._notes = [];
      this._hideTimer = null;
      this._mouseIdleTimer = null;
      this._storageKey = STORAGE_PREFIX + (location.pathname || '/');
      this._onKey = this._onKey.bind(this);
      this._onResize = this._onResize.bind(this);
      this._onSlotChange = this._onSlotChange.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);
      this._onTapBack = this._onTapBack.bind(this);
      this._onTapForward = this._onTapForward.bind(this);
    }
    get designWidth() {
      return parseInt(this.getAttribute('width'), 10) || DESIGN_W_DEFAULT;
    }
    get designHeight() {
      return parseInt(this.getAttribute('height'), 10) || DESIGN_H_DEFAULT;
    }
    connectedCallback() {
      this._render();
      this._loadNotes();
      this._syncPrintPageRule();
      window.addEventListener('keydown', this._onKey);
      window.addEventListener('resize', this._onResize);
      window.addEventListener('mousemove', this._onMouseMove, {
        passive: true
      });
      // Initial collection + layout happens via slotchange, which fires on mount.
    }
    disconnectedCallback() {
      window.removeEventListener('keydown', this._onKey);
      window.removeEventListener('resize', this._onResize);
      window.removeEventListener('mousemove', this._onMouseMove);
      if (this._hideTimer) clearTimeout(this._hideTimer);
      if (this._mouseIdleTimer) clearTimeout(this._mouseIdleTimer);
    }
    attributeChangedCallback() {
      if (this._canvas) {
        this._canvas.style.width = this.designWidth + 'px';
        this._canvas.style.height = this.designHeight + 'px';
        this._canvas.style.setProperty('--deck-design-w', this.designWidth + 'px');
        this._canvas.style.setProperty('--deck-design-h', this.designHeight + 'px');
        this._fit();
        this._syncPrintPageRule();
      }
    }
    _render() {
      const style = document.createElement('style');
      style.textContent = stylesheet;
      const stage = document.createElement('div');
      stage.className = 'stage';
      const canvas = document.createElement('div');
      canvas.className = 'canvas';
      canvas.style.width = this.designWidth + 'px';
      canvas.style.height = this.designHeight + 'px';
      canvas.style.setProperty('--deck-design-w', this.designWidth + 'px');
      canvas.style.setProperty('--deck-design-h', this.designHeight + 'px');
      const slot = document.createElement('slot');
      slot.addEventListener('slotchange', this._onSlotChange);
      canvas.appendChild(slot);
      stage.appendChild(canvas);

      // Tap zones (mobile): left third = back, right third = forward.
      const tapzones = document.createElement('div');
      tapzones.className = 'tapzones export-hidden';
      tapzones.setAttribute('aria-hidden', 'true');
      const tzBack = document.createElement('div');
      tzBack.className = 'tapzone tapzone--back';
      const tzMid = document.createElement('div');
      tzMid.className = 'tapzone tapzone--mid';
      tzMid.style.pointerEvents = 'none';
      const tzFwd = document.createElement('div');
      tzFwd.className = 'tapzone tapzone--fwd';
      tzBack.addEventListener('click', this._onTapBack);
      tzFwd.addEventListener('click', this._onTapForward);
      tapzones.append(tzBack, tzMid, tzFwd);

      // Overlay: compact, solid black, with clickable controls.
      const overlay = document.createElement('div');
      overlay.className = 'overlay export-hidden';
      overlay.setAttribute('role', 'toolbar');
      overlay.setAttribute('aria-label', 'Deck controls');
      overlay.innerHTML = `
        <button class="btn prev" type="button" aria-label="Previous slide" title="Previous (←)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3L5 8l5 5"/></svg>
        </button>
        <span class="count" aria-live="polite"><span class="current">1</span><span class="sep">/</span><span class="total">1</span></span>
        <button class="btn next" type="button" aria-label="Next slide" title="Next (→)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg>
        </button>
        <span class="divider"></span>
        <button class="btn reset" type="button" aria-label="Reset to first slide" title="Reset (R)">Reset<span class="kbd">R</span></button>
      `;
      overlay.querySelector('.prev').addEventListener('click', () => this._go(this._index - 1, 'click'));
      overlay.querySelector('.next').addEventListener('click', () => this._go(this._index + 1, 'click'));
      overlay.querySelector('.reset').addEventListener('click', () => this._go(0, 'click'));
      this._root.append(style, stage, tapzones, overlay);
      this._canvas = canvas;
      this._slot = slot;
      this._overlay = overlay;
      this._countEl = overlay.querySelector('.current');
      this._totalEl = overlay.querySelector('.total');
    }

    /** @page must live in the document stylesheet — it's a no-op inside
     *  shadow DOM. Inject/update a single <head> style tag so the print
     *  sheet matches the design size and Save-as-PDF yields one slide per
     *  page with no margins. */
    _syncPrintPageRule() {
      const id = 'deck-stage-print-page';
      let tag = document.getElementById(id);
      if (!tag) {
        tag = document.createElement('style');
        tag.id = id;
        document.head.appendChild(tag);
      }
      tag.textContent = '@page { size: ' + this.designWidth + 'px ' + this.designHeight + 'px; margin: 0; } ' + '@media print { html, body { margin: 0 !important; padding: 0 !important; background: none !important; overflow: visible !important; height: auto !important; } ' + '* { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }';
    }
    _onSlotChange() {
      this._collectSlides();
      this._restoreIndex();
      this._applyIndex({
        showOverlay: false,
        broadcast: true,
        reason: 'init'
      });
      this._fit();
    }
    _collectSlides() {
      const assigned = this._slot.assignedElements({
        flatten: true
      });
      this._slides = assigned.filter(el => {
        // Skip template/style/script nodes even if someone slots them.
        const tag = el.tagName;
        return tag !== 'TEMPLATE' && tag !== 'SCRIPT' && tag !== 'STYLE';
      });
      this._slides.forEach((slide, i) => {
        const n = i + 1;
        // Determine a label for comment flow: prefer explicit data-label,
        // then an existing data-screen-label, then first heading, else "Slide".
        let label = slide.getAttribute('data-label');
        if (!label) {
          const existing = slide.getAttribute('data-screen-label');
          if (existing) {
            // Strip any leading number the author may have included.
            label = existing.replace(/^\s*\d+\s*/, '').trim() || existing;
          }
        }
        if (!label) {
          const h = slide.querySelector('h1, h2, h3, [data-title]');
          if (h) label = (h.textContent || '').trim().slice(0, 40);
        }
        if (!label) label = 'Slide';
        slide.setAttribute('data-screen-label', `${pad2(n)} ${label}`);

        // Validation attribute for comment flow / auto-checks.
        if (!slide.hasAttribute('data-om-validate')) {
          slide.setAttribute('data-om-validate', VALIDATE_ATTR);
        }
        slide.setAttribute('data-deck-slide', String(i));
      });
      if (this._totalEl) this._totalEl.textContent = String(this._slides.length || 1);
      if (this._index >= this._slides.length) this._index = Math.max(0, this._slides.length - 1);
    }
    _loadNotes() {
      const tag = document.getElementById('speaker-notes');
      if (!tag) {
        this._notes = [];
        return;
      }
      try {
        const parsed = JSON.parse(tag.textContent || '[]');
        if (Array.isArray(parsed)) this._notes = parsed;
      } catch (e) {
        console.warn('[deck-stage] Failed to parse #speaker-notes JSON:', e);
        this._notes = [];
      }
    }
    _restoreIndex() {
      try {
        const raw = localStorage.getItem(this._storageKey);
        if (raw != null) {
          const n = parseInt(raw, 10);
          if (Number.isFinite(n) && n >= 0 && n < this._slides.length) {
            this._index = n;
          }
        }
      } catch (e) {/* ignore */}
    }
    _persistIndex() {
      try {
        localStorage.setItem(this._storageKey, String(this._index));
      } catch (e) {/* ignore */}
    }
    _applyIndex({
      showOverlay = true,
      broadcast = true,
      reason = 'init'
    } = {}) {
      if (!this._slides.length) return;
      const prev = this._prevIndex == null ? -1 : this._prevIndex;
      const curr = this._index;
      this._slides.forEach((s, i) => {
        if (i === curr) s.setAttribute('data-deck-active', '');else s.removeAttribute('data-deck-active');
      });
      if (this._countEl) this._countEl.textContent = String(curr + 1);
      this._persistIndex();
      if (broadcast) {
        // (1) Legacy: host-window postMessage for speaker-notes renderers.
        try {
          window.postMessage({
            slideIndexChanged: curr
          }, '*');
        } catch (e) {}

        // (2) In-page CustomEvent on the <deck-stage> element itself.
        //     Bubbles and composes out of shadow DOM so slide code can listen:
        //       document.querySelector('deck-stage').addEventListener('slidechange', e => {
        //         e.detail.index, e.detail.previousIndex, e.detail.total, e.detail.slide, e.detail.reason
        //       });
        const detail = {
          index: curr,
          previousIndex: prev,
          total: this._slides.length,
          slide: this._slides[curr] || null,
          previousSlide: prev >= 0 ? this._slides[prev] || null : null,
          reason: reason // 'init' | 'keyboard' | 'click' | 'tap' | 'api'
        };
        this.dispatchEvent(new CustomEvent('slidechange', {
          detail,
          bubbles: true,
          composed: true
        }));
      }
      this._prevIndex = curr;
      if (showOverlay) this._flashOverlay();
    }
    _flashOverlay() {
      if (!this._overlay) return;
      this._overlay.setAttribute('data-visible', '');
      if (this._hideTimer) clearTimeout(this._hideTimer);
      this._hideTimer = setTimeout(() => {
        this._overlay.removeAttribute('data-visible');
      }, OVERLAY_HIDE_MS);
    }
    _fit() {
      if (!this._canvas) return;
      // PPTX export sets noscale so the DOM capture sees authored-size
      // geometry — the scaled canvas is in shadow DOM, so the exporter's
      // resetTransformSelector can't reach .canvas.style.transform directly.
      if (this.hasAttribute('noscale')) {
        this._canvas.style.transform = 'none';
        return;
      }
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const s = Math.min(vw / this.designWidth, vh / this.designHeight);
      this._canvas.style.transform = `scale(${s})`;
    }
    _onResize() {
      this._fit();
    }
    _onMouseMove() {
      // Keep overlay visible while mouse moves; hide after idle.
      this._flashOverlay();
    }
    _onTapBack(e) {
      e.preventDefault();
      this._go(this._index - 1, 'tap');
    }
    _onTapForward(e) {
      e.preventDefault();
      this._go(this._index + 1, 'tap');
    }
    _onKey(e) {
      // Ignore when the user is typing.
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key;
      let handled = true;
      if (key === 'ArrowRight' || key === 'PageDown' || key === ' ' || key === 'Spacebar') {
        this._go(this._index + 1, 'keyboard');
      } else if (key === 'ArrowLeft' || key === 'PageUp') {
        this._go(this._index - 1, 'keyboard');
      } else if (key === 'Home') {
        this._go(0, 'keyboard');
      } else if (key === 'End') {
        this._go(this._slides.length - 1, 'keyboard');
      } else if (key === 'r' || key === 'R') {
        this._go(0, 'keyboard');
      } else if (/^[0-9]$/.test(key)) {
        // 1..9 jump to that slide; 0 jumps to 10.
        const n = key === '0' ? 9 : parseInt(key, 10) - 1;
        if (n < this._slides.length) this._go(n, 'keyboard');
      } else {
        handled = false;
      }
      if (handled) {
        e.preventDefault();
        this._flashOverlay();
      }
    }
    _go(i, reason = 'api') {
      if (!this._slides.length) return;
      const clamped = Math.max(0, Math.min(this._slides.length - 1, i));
      if (clamped === this._index) {
        this._flashOverlay();
        return;
      }
      this._index = clamped;
      this._applyIndex({
        showOverlay: true,
        broadcast: true,
        reason
      });
    }

    // Public API ------------------------------------------------------------

    /** Current slide index (0-based). */
    get index() {
      return this._index;
    }
    /** Total slide count. */
    get length() {
      return this._slides.length;
    }
    /** Programmatically navigate. */
    goTo(i) {
      this._go(i, 'api');
    }
    next() {
      this._go(this._index + 1, 'api');
    }
    prev() {
      this._go(this._index - 1, 'api');
    }
    reset() {
      this._go(0, 'api');
    }
  }
  if (!customElements.get('deck-stage')) {
    customElements.define('deck-stage', DeckStage);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "decks/deck-stage.js", error: String((e && e.message) || e) }); }

// ui_kits/spotler-marketing/CtaBand.jsx
try { (() => {
/* @jsx React.createElement */
/* global React */

function CtaBand() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '64px 32px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: '0 auto',
      background: 'var(--navy)',
      borderRadius: 28,
      padding: '64px 56px',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: -60,
      right: -40,
      width: 280,
      height: 280,
      borderRadius: '50%',
      background: 'var(--yellow)',
      opacity: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 80,
      right: 140,
      width: 60,
      height: 60,
      borderRadius: '50%',
      background: 'var(--cyan)',
      opacity: 0.95
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      maxWidth: 620
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 48,
      fontWeight: 800,
      color: '#fff',
      letterSpacing: '-0.02em',
      lineHeight: 1.06
    }
  }, "Less time wrangling data. More time creating impact."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 18,
      color: 'var(--cyan-tint)',
      marginTop: 16,
      lineHeight: 1.55
    }
  }, "We know you want to build better connections, grow your brand and make a difference. Lets make marketing work for you, not the other way around."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      marginTop: 28
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      background: 'var(--cyan)',
      color: 'var(--navy)',
      border: 'none',
      font: 'inherit',
      fontSize: 16,
      fontWeight: 700,
      padding: '16px 28px',
      borderRadius: 999,
      cursor: 'pointer'
    }
  }, "Get a demo"), /*#__PURE__*/React.createElement("button", {
    style: {
      background: 'transparent',
      color: '#fff',
      border: '1.5px solid rgba(255,255,255,0.25)',
      font: 'inherit',
      fontSize: 16,
      fontWeight: 600,
      padding: '16px 28px',
      borderRadius: 999,
      cursor: 'pointer'
    }
  }, "Create your growth plan")))));
}
window.CtaBand = CtaBand;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/spotler-marketing/CtaBand.jsx", error: String((e && e.message) || e) }); }

// ui_kits/spotler-marketing/FeatureGrid.jsx
try { (() => {
/* @jsx React.createElement */
/* global React */

const CLOUDS = [{
  name: 'Marketing Cloud for B2B',
  cloud: 'b2b',
  color: 'var(--orange)',
  tint: 'var(--orange-tint)',
  shade: 'var(--orange-shade)',
  icon: 'users-round',
  blurb: 'Connected B2B marketing tools that bring everything together. Smart, targeted campaigns that turn leads into pipeline - without burning out doing it.',
  tools: ['CRM & Lead Management', 'Email Marketing Automation', 'Event Management', 'Website Personalisation', 'Conversational Marketing', 'Social Publishing']
}, {
  name: 'Marketing Cloud for Commerce',
  cloud: 'commerce',
  color: 'var(--purple)',
  tint: 'var(--purple-tint)',
  shade: 'var(--purple-shade)',
  icon: 'shopping-bag',
  blurb: 'All your data together. Grow revenue, boost retention and create a seamless customer experience, with less effort.',
  tools: ['Customer Data Platform', 'Email Marketing Automation', 'Transactional Emails', 'Search & Merchandising', 'WhatsApp, SMS, Social']
}, {
  name: 'Service Cloud for Public Sector',
  cloud: 'service',
  color: 'var(--green)',
  tint: 'var(--green-tint)',
  shade: 'var(--green-shade)',
  icon: 'heart-handshake',
  blurb: 'Connected service tools that work effortlessly. Work smarter, connect deeper, deliver a consistent, personalised service every time.',
  tools: ['Email Communication', 'Event Management', 'Webcare', 'Social Publishing & Monitoring']
}];
function FeatureGrid() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '96px 32px',
      background: 'var(--bg-alt)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 56,
      maxWidth: 720,
      margin: '0 auto 56px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      color: 'var(--cyan-shade)',
      fontSize: 12,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      fontWeight: 700
    }
  }, "Smarter communication, better results, real impact with our:"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 48,
      fontWeight: 800,
      color: 'var(--navy)',
      letterSpacing: '-0.02em',
      marginTop: 12,
      lineHeight: 1.08
    }
  }, "Three clouds, tailored to how you work.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 20
    }
  }, CLOUDS.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.name,
    "data-cloud": c.cloud,
    style: {
      background: '#fff',
      borderRadius: 24,
      padding: 28,
      boxShadow: 'var(--shadow-md)',
      border: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: c.tint,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": c.icon,
    style: {
      color: c.shade,
      width: 28,
      height: 28
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 22,
      color: 'var(--navy)',
      letterSpacing: '-0.01em',
      lineHeight: 1.2
    }
  }, c.name), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--fg2)',
      fontSize: 15,
      lineHeight: 1.55,
      margin: '10px 0 0',
      textWrap: 'pretty'
    }
  }, c.blurb)), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, c.tools.map(t => /*#__PURE__*/React.createElement("li", {
    key: t,
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      fontSize: 13,
      color: 'var(--fg2)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "check",
    style: {
      width: 14,
      height: 14,
      color: c.shade,
      flexShrink: 0
    }
  }), t))), /*#__PURE__*/React.createElement("a", {
    style: {
      color: c.shade,
      fontWeight: 700,
      fontSize: 14,
      marginTop: 'auto',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      cursor: 'pointer'
    }
  }, "Find out more ", /*#__PURE__*/React.createElement("i", {
    "data-lucide": "arrow-right",
    style: {
      width: 16,
      height: 16
    }
  })))))));
}
window.FeatureGrid = FeatureGrid;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/spotler-marketing/FeatureGrid.jsx", error: String((e && e.message) || e) }); }

// ui_kits/spotler-marketing/Footer.jsx
try { (() => {
/* @jsx React.createElement */
/* global React */
const {
  useState
} = React;
const COLS = {
  'Solutions': ['Marketing Cloud for B2B', 'Marketing Cloud for Commerce', 'Service Cloud for Public Sector', 'Spotler AI', 'Integrations'],
  'Resources': ['Knowledge base', 'Academy', 'Events & webinars', 'Ebooks & guides', 'Blog', 'Customer stories'],
  'Company': ['About Spotler', 'Sustainability', 'Careers', 'Partners', 'News', 'Contact']
};
const REGIONS = ['International', 'United Kingdom', 'Nederland', 'Deutschland', 'España', 'France', 'Sverige'];
function Footer() {
  const [region, setRegion] = useState('International');
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--navy-shade)',
      color: '#fff',
      padding: '72px 32px 32px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.3fr repeat(3, 1fr)',
      gap: 40
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo/spotler-white.svg",
    style: {
      height: 30
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--cyan-tone)',
      fontSize: 14,
      lineHeight: 1.6,
      marginTop: 20,
      maxWidth: 300
    }
  }, "Smarter communication, better results, real impact. Marketing and service clouds trusted by 38,000+ professionals across Europe."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--cyan-tone)',
      fontWeight: 600,
      marginBottom: 8
    }
  }, "Region"), /*#__PURE__*/React.createElement("select", {
    value: region,
    onChange: e => setRegion(e.target.value),
    style: {
      background: 'rgba(255,255,255,0.08)',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.16)',
      borderRadius: 12,
      padding: '10px 14px',
      fontSize: 14,
      font: 'inherit',
      minWidth: 200
    }
  }, REGIONS.map(r => /*#__PURE__*/React.createElement("option", {
    key: r,
    style: {
      color: '#000'
    }
  }, r)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 24
    }
  }, ['linkedin', 'youtube', 'instagram', 'facebook'].map(s => /*#__PURE__*/React.createElement("div", {
    key: s,
    style: {
      width: 36,
      height: 36,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": s,
    style: {
      width: 16,
      height: 16,
      color: '#fff'
    }
  }))))), Object.entries(COLS).map(([h, items]) => /*#__PURE__*/React.createElement("div", {
    key: h
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: '#fff',
      marginBottom: 14
    }
  }, h), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, items.map(i => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      color: 'var(--cyan-tone)',
      fontSize: 14,
      cursor: 'pointer'
    }
  }, i)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 48,
      paddingTop: 24,
      borderTop: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      color: 'var(--cyan-tone)',
      fontSize: 12,
      flexWrap: 'wrap',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, "\xA9 2026 Spotler. All rights reserved."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("span", null, "Privacy statement"), /*#__PURE__*/React.createElement("span", null, "Cookie policy"), /*#__PURE__*/React.createElement("span", null, "Terms & conditions"), /*#__PURE__*/React.createElement("span", null, "Responsible disclosure")))));
}
window.Footer = Footer;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/spotler-marketing/Footer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/spotler-marketing/Hero.jsx
try { (() => {
/* @jsx React.createElement */
/* global React */

function Hero() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '72px 32px 56px',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '1.05fr 0.95fr',
      gap: 56,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 12px',
      borderRadius: 999,
      background: 'var(--cyan-tint)',
      color: 'var(--cyan-shade)',
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: '0.02em',
      marginBottom: 20,
      textTransform: 'uppercase'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: 'var(--cyan-shade)'
    }
  }), " Spotler Marketing Cloud"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 'clamp(48px, 5.5vw, 76px)',
      lineHeight: 1.02,
      letterSpacing: '-0.03em',
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      color: 'var(--navy)',
      margin: 0
    }
  }, "Unlock your data and drive results."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 19,
      lineHeight: 1.55,
      color: 'var(--fg2)',
      marginTop: 24,
      maxWidth: 520,
      textWrap: 'pretty'
    }
  }, "Stop wasting time with disconnected tools. Turn your data into smarter campaigns, better results and real impact - all with less effort."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      marginTop: 32
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      background: 'var(--cyan)',
      color: 'var(--navy)',
      border: 'none',
      font: 'inherit',
      fontSize: 16,
      fontWeight: 700,
      padding: '16px 28px',
      borderRadius: 999,
      cursor: 'pointer'
    }
  }, "Get a demo"), /*#__PURE__*/React.createElement("button", {
    style: {
      background: 'transparent',
      color: 'var(--navy)',
      border: '1.5px solid var(--border-strong)',
      font: 'inherit',
      fontSize: 16,
      fontWeight: 600,
      padding: '16px 24px',
      borderRadius: 999,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "play",
    style: {
      width: 16,
      height: 16
    }
  }), " Watch 2-min tour")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 28,
      marginTop: 36,
      flexWrap: 'wrap'
    }
  }, [['Faster, smarter decisions', 'with the right data'], ['Personalised campaigns', 'that stay relevant'], ['Better results', 'and a bigger impact']].map(([a, b]) => /*#__PURE__*/React.createElement("div", {
    key: a,
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 22,
      height: 22,
      borderRadius: '50%',
      background: 'var(--navy)',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "check",
    style: {
      width: 14,
      height: 14,
      color: 'var(--cyan)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      lineHeight: 1.4
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--fg1)'
    }
  }, a), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--fg2)'
    }
  }, b)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      aspectRatio: '1/1',
      minHeight: 440
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: '6% 6% 6% 6%',
      borderRadius: '50%',
      background: 'var(--yellow)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '10%',
      left: '8%',
      width: '62%',
      background: '#fff',
      borderRadius: 18,
      padding: 16,
      boxShadow: 'var(--shadow-lg)',
      border: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo/products/engage-navy-cyan.svg",
    style: {
      height: 20
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontSize: 11,
      color: 'var(--green-shade)',
      fontWeight: 700
    }
  }, "\u25CF Live")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--fg2)',
      marginBottom: 8
    }
  }, "Welcome journey \xB7 open rate"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 30,
      color: 'var(--navy)',
      letterSpacing: '-0.02em'
    }
  }, "48.2%"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--green-shade)',
      fontWeight: 600
    }
  }, "\u25B2 6.1")), /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 220 50",
    style: {
      width: '100%',
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M0,40 Q30,32 55,28 T110,18 T170,12 T220,6",
    stroke: "#23afe6",
    strokeWidth: "2.5",
    fill: "none",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M0,40 Q30,32 55,28 T110,18 T170,12 T220,6 L220,50 L0,50 Z",
    fill: "#e6f6fc"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '38%',
      right: '4%',
      width: '58%',
      background: 'var(--navy)',
      color: '#fff',
      borderRadius: 18,
      padding: 16,
      boxShadow: 'var(--shadow-xl)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      height: 28,
      borderRadius: '50%',
      background: 'var(--cyan)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "bot",
    style: {
      width: 16,
      height: 16,
      color: 'var(--navy)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13
    }
  }, "Spotler AI"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      padding: '2px 8px',
      borderRadius: 999,
      background: 'rgba(35,175,230,0.2)',
      color: 'var(--cyan)',
      fontSize: 10,
      fontWeight: 700
    }
  }, "NEW")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      lineHeight: 1.5,
      color: 'var(--cyan-tint)'
    }
  }, "I spotted 1,240 high-intent leads this week. Want me to draft a re-engagement journey?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      background: 'var(--cyan)',
      color: 'var(--navy)',
      border: 'none',
      padding: '6px 12px',
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "Draft it"), /*#__PURE__*/React.createElement("button", {
    style: {
      background: 'transparent',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.25)',
      padding: '6px 12px',
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, "Later"))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: '6%',
      left: '14%',
      background: '#fff',
      borderRadius: 14,
      padding: '10px 14px',
      boxShadow: 'var(--shadow-md)',
      border: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      background: 'var(--green-tint)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "trending-up",
    style: {
      width: 18,
      height: 18,
      color: 'var(--green-shade)'
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--navy)'
    }
  }, "+34% revenue uplift"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--fg3)'
    }
  }, "Luxury Coastal \xB7 this month"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: '64px auto 0',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--fg3)'
    }
  }, "Join 38,000+ marketing professionals creating impact with Spotler"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      gap: 48,
      marginTop: 24,
      opacity: 0.7,
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, ['DPD', 'ANWB', 'DHL', 'Santander', 'Rituals', 'Douwe Egberts', 'British Red Cross'].map(c => /*#__PURE__*/React.createElement("div", {
    key: c,
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 20,
      color: 'var(--fg2)',
      letterSpacing: '-0.01em'
    }
  }, c)))));
}
window.Hero = Hero;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/spotler-marketing/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/spotler-marketing/Nav.jsx
try { (() => {
/* @jsx React.createElement */
/* global React */
const {
  useState
} = React;
function Nav() {
  const [open, setOpen] = useState(null);
  const link = {
    color: 'var(--fg1)',
    fontSize: 14,
    fontWeight: 600,
    padding: '8px 14px',
    borderRadius: 999,
    cursor: 'pointer',
    position: 'relative'
  };
  const items = ['Products', 'Services', 'Success stories', 'Pricing', 'Resources', 'About us'];
  const hasDrop = new Set(['Products']);
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 20,
      background: 'rgba(255,255,255,0.88)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: '0 auto',
      padding: '16px 32px',
      display: 'flex',
      alignItems: 'center',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      textDecoration: 'none'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo/spotler-navy.svg",
    style: {
      height: 26
    },
    alt: "Spotler"
  })), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      gap: 2,
      marginLeft: 12
    }
  }, items.map(l => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: link,
    onMouseEnter: () => setOpen(l),
    onMouseLeave: () => setOpen(null)
  }, l, " ", hasDrop.has(l) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      marginLeft: 4,
      color: 'var(--fg3)'
    }
  }, "\u25BE")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      gap: 10,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 10px',
      borderRadius: 999,
      fontSize: 13,
      color: 'var(--fg2)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "globe",
    style: {
      width: 16,
      height: 16
    }
  }), " EN \xB7 International"), /*#__PURE__*/React.createElement("button", {
    style: {
      background: 'transparent',
      border: 'none',
      font: 'inherit',
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--fg1)',
      cursor: 'pointer',
      padding: '8px 14px'
    }
  }, "Login"), /*#__PURE__*/React.createElement("button", {
    style: {
      background: 'var(--cyan)',
      color: 'var(--navy)',
      border: 'none',
      font: 'inherit',
      fontSize: 14,
      fontWeight: 700,
      padding: '10px 20px',
      borderRadius: 999,
      cursor: 'pointer'
    }
  }, "Get a demo"))));
}
window.Nav = Nav;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/spotler-marketing/Nav.jsx", error: String((e && e.message) || e) }); }

// ui_kits/spotler-marketing/Pricing.jsx
try { (() => {
/* @jsx React.createElement */
/* global React */

// Spotler doesn't publish prices - this section showcases the product portfolio as logo cards,
// which mirrors the real site's "Tools" pages.

const PRODUCTS = [{
  file: 'crm-navy-cyan.svg',
  label: 'CRM',
  tag: 'B2B'
}, {
  file: 'engage-navy-cyan.svg',
  label: 'Marketing Automation',
  tag: 'B2B'
}, {
  file: 'connect-navy-cyan.svg',
  label: 'Website Personalisation',
  tag: 'B2B'
}, {
  file: 'leads-navy-cyan.svg',
  label: 'Lead Generation',
  tag: 'B2B'
}, {
  file: 'mailplus-navy-cyan.svg',
  label: 'Email for Commerce',
  tag: 'Commerce'
}, {
  file: 'mailpro-navy-cyan.svg',
  label: 'Email at Scale',
  tag: 'Commerce'
}, {
  file: 'sendpro-navy-cyan.svg',
  label: 'Transactional Email',
  tag: 'Commerce'
}, {
  file: 'message-navy-cyan.svg',
  label: 'SMS & WhatsApp',
  tag: 'Commerce'
}, {
  file: 'predict-navy-cyan.svg',
  label: 'Customer Data Platform',
  tag: 'Commerce'
}, {
  file: 'feedback-navy-cyan.svg',
  label: 'Surveys & Feedback',
  tag: 'All'
}, {
  file: 'feedbackpro-navy-cyan.svg',
  label: 'Enterprise Feedback',
  tag: 'All'
}];
function Pricing() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '96px 32px',
      background: 'var(--bg)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 48,
      maxWidth: 720,
      margin: '0 auto 48px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--cyan-shade)',
      fontSize: 12,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      fontWeight: 700
    }
  }, "The product portfolio"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 48,
      fontWeight: 800,
      color: 'var(--navy)',
      letterSpacing: '-0.02em',
      marginTop: 12,
      lineHeight: 1.08
    }
  }, "Pick the tools that fit. We will connect the rest.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 16
    }
  }, PRODUCTS.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.file,
    style: {
      background: '#fff',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      minHeight: 160,
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer'
    },
    onMouseEnter: e => {
      e.currentTarget.style.transform = 'translateY(-3px)';
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = 'none';
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 40,
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: `../../assets/logo/products/${p.file}`,
    style: {
      height: 36,
      maxWidth: '100%'
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--fg2)'
    }
  }, p.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--fg3)',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      marginTop: 4,
      fontWeight: 700
    }
  }, p.tag)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      fontSize: 13,
      color: 'var(--cyan-shade)',
      fontWeight: 700,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
    }
  }, "Explore ", /*#__PURE__*/React.createElement("i", {
    "data-lucide": "arrow-right",
    style: {
      width: 14,
      height: 14
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--navy)',
      borderRadius: 16,
      padding: 24,
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      minHeight: 160
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "sparkles",
    style: {
      width: 28,
      height: 28,
      color: 'var(--yellow)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 18,
      letterSpacing: '-0.01em',
      lineHeight: 1.2
    }
  }, "Not sure where to start?"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--cyan-tint)',
      lineHeight: 1.5
    }
  }, "We will build a growth plan tailored to your team."), /*#__PURE__*/React.createElement("button", {
    style: {
      marginTop: 'auto',
      background: 'var(--cyan)',
      color: 'var(--navy)',
      border: 'none',
      font: 'inherit',
      fontSize: 13,
      fontWeight: 700,
      padding: '10px 16px',
      borderRadius: 999,
      cursor: 'pointer',
      alignSelf: 'flex-start'
    }
  }, "Get a demo")))));
}
window.Pricing = Pricing;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/spotler-marketing/Pricing.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Spotlight = __ds_scope.Spotlight;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Card = __ds_scope.Card;

})();
