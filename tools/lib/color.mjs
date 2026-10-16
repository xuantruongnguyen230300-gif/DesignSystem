// Color utilities for NXT Design tooling — zero dependencies.
// Supports: hex (#rgb, #rgba, #rrggbb, #rrggbbaa), rgb()/rgba(), oklch(), oklab(),
// and W3C DTCG 2025.10 color objects { colorSpace, components, alpha, hex }.
// Internal representation: { r, g, b, alpha } in gamma-encoded sRGB, 0..1 (may be out of gamut).

const clamp01 = (x) => Math.min(1, Math.max(0, x));

export function srgbToLinear(c) {
  const a = Math.abs(c);
  const v = a <= 0.04045 ? a / 12.92 : ((a + 0.055) / 1.055) ** 2.4;
  return Math.sign(c) * v;
}

export function linearToSrgb(c) {
  const a = Math.abs(c);
  const v = a <= 0.0031308 ? 12.92 * a : 1.055 * a ** (1 / 2.4) - 0.055;
  return Math.sign(c) * v;
}

export function oklabToLinearSrgb(L, a, b) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

export function linearSrgbToOklab(r, g, b) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363015264 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

export function oklchToSrgb(L, C, H, alpha = 1) {
  const h = (H * Math.PI) / 180;
  const [r, g, b] = oklabToLinearSrgb(L, C * Math.cos(h), C * Math.sin(h));
  return { r: linearToSrgb(r), g: linearToSrgb(g), b: linearToSrgb(b), alpha };
}

export function srgbToOklch({ r, g, b }) {
  const [L, A, B] = linearSrgbToOklab(srgbToLinear(r), srgbToLinear(g), srgbToLinear(b));
  const C = Math.sqrt(A * A + B * B);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H: C < 1e-4 ? 0 : H };
}

export function inSrgbGamut({ r, g, b }, eps = 1e-4) {
  return [r, g, b].every((c) => c >= -eps && c <= 1 + eps);
}

// Reduce chroma at fixed L/H until the color fits in sRGB (binary search).
export function gamutMapOklch(L, C, H) {
  if (inSrgbGamut(oklchToSrgb(L, C, H))) return { L, C, H };
  let lo = 0;
  let hi = C;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (inSrgbGamut(oklchToSrgb(L, mid, H))) lo = mid;
    else hi = mid;
  }
  return { L, C: lo, H };
}

function parseHex(str) {
  let h = str.slice(1);
  if (![3, 4, 6, 8].includes(h.length) || /[^0-9a-f]/i.test(h)) return null;
  if (h.length <= 4) h = [...h].map((c) => c + c).join('');
  const n = (i) => parseInt(h.slice(i, i + 2), 16) / 255;
  return { r: n(0), g: n(2), b: n(4), alpha: h.length === 8 ? n(6) : 1 };
}

function num(token, percentScale = 1) {
  const t = token.trim();
  if (t === 'none') return 0;
  if (t.endsWith('%')) return (parseFloat(t) / 100) * percentScale;
  if (t.endsWith('deg')) return parseFloat(t);
  return parseFloat(t);
}

function splitArgs(inner) {
  const [main, alphaPart] = inner.split('/');
  const parts = main.trim().split(/[\s,]+/).filter(Boolean);
  return { parts, alpha: alphaPart === undefined ? 1 : num(alphaPart, 1) };
}

// Parse a CSS color string or a DTCG color object. Returns { r, g, b, alpha } or null.
export function parseColor(value) {
  if (value == null) return null;
  if (typeof value === 'object') return parseDtcgColor(value);
  const str = String(value).trim().toLowerCase();
  if (str === 'transparent') return { r: 0, g: 0, b: 0, alpha: 0 };
  if (str === 'white') return { r: 1, g: 1, b: 1, alpha: 1 };
  if (str === 'black') return { r: 0, g: 0, b: 0, alpha: 1 };
  if (str.startsWith('#')) return parseHex(str);
  const m = str.match(/^(rgba?|oklch|oklab)\((.*)\)$/);
  if (!m) return null;
  const { parts, alpha } = splitArgs(m[2]);
  if (parts.length < 3) return null;
  if (m[1].startsWith('rgb')) {
    const ch = parts.slice(0, 3).map((p) => (p.endsWith('%') ? num(p, 1) : num(p) / 255));
    const a = m[1] === 'rgba' && parts[3] !== undefined ? num(parts[3], 1) : alpha;
    return { r: ch[0], g: ch[1], b: ch[2], alpha: a };
  }
  if (m[1] === 'oklch') {
    return oklchToSrgb(num(parts[0], 1), num(parts[1], 0.4), num(parts[2]), alpha);
  }
  const [r, g, b] = oklabToLinearSrgb(num(parts[0], 1), num(parts[1], 0.4), num(parts[2], 0.4));
  return { r: linearToSrgb(r), g: linearToSrgb(g), b: linearToSrgb(b), alpha };
}

function parseDtcgColor(obj) {
  const alpha = obj.alpha ?? 1;
  const c = obj.components;
  if (Array.isArray(c) && c.every((x) => typeof x === 'number' || x === 'none')) {
    const [x, y, z] = c.map((v) => (v === 'none' ? 0 : v));
    switch (obj.colorSpace) {
      case 'srgb':
        return { r: x, g: y, b: z, alpha };
      case 'srgb-linear':
        return { r: linearToSrgb(x), g: linearToSrgb(y), b: linearToSrgb(z), alpha };
      case 'oklch':
        return oklchToSrgb(x, y, z, alpha);
      case 'oklab': {
        const [r, g, b] = oklabToLinearSrgb(x, y, z);
        return { r: linearToSrgb(r), g: linearToSrgb(g), b: linearToSrgb(b), alpha };
      }
      default:
        break;
    }
  }
  if (typeof obj.hex === 'string') {
    const parsed = parseHex(obj.hex);
    return parsed ? { ...parsed, alpha } : null;
  }
  return null;
}

export function toHex({ r, g, b, alpha = 1 }) {
  const h = (x) => Math.round(clamp01(x) * 255).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}${alpha < 1 ? h(alpha) : ''}`.toUpperCase();
}

// Source-over compositing in gamma-encoded sRGB (what browsers do by default).
export function composite(fg, bg) {
  const a = fg.alpha ?? 1;
  const mix = (f, b) => f * a + b * (1 - a);
  return { r: mix(fg.r, bg.r), g: mix(fg.g, bg.g), b: mix(fg.b, bg.b), alpha: 1 };
}

export function relativeLuminance({ r, g, b }) {
  const [R, G, B] = [r, g, b].map((c) => srgbToLinear(clamp01(c)));
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

// WCAG 2.x contrast ratio. Translucent colors are composited: fg over bg, bg over backdrop.
export function contrastRatio(fg, bg, backdrop = { r: 1, g: 1, b: 1, alpha: 1 }) {
  const solidBg = (bg.alpha ?? 1) < 1 ? composite(bg, backdrop) : bg;
  const solidFg = (fg.alpha ?? 1) < 1 ? composite(fg, solidBg) : fg;
  const l1 = relativeLuminance(solidFg);
  const l2 = relativeLuminance(solidBg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function wcagRating(ratio) {
  return {
    ratio: Math.round(ratio * 100) / 100,
    aaText: ratio >= 4.5,
    aaLargeText: ratio >= 3,
    aaNonText: ratio >= 3,
    aaaText: ratio >= 7,
  };
}
