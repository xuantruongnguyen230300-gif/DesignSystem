/*
 * Color math for runtime theming. A TypeScript port of `tools/lib/color.mjs` (the build-time source of truth), reduced to
 * what generating a brand scale needs. `theme/scale.spec.ts` compares both implementations, so they cannot drift apart.
 * Internal form: gamma-encoded sRGB, 0..1; channels may leave the gamut while mapping.
 */

export interface Srgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

export interface Oklch {
  readonly L: number;
  readonly C: number;
  readonly H: number;
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

const toLinear = (c: number) => {
  const a = Math.abs(c);
  return Math.sign(c) * (a <= 0.04045 ? a / 12.92 : ((a + 0.055) / 1.055) ** 2.4);
};

const toGamma = (c: number) => {
  const a = Math.abs(c);
  return Math.sign(c) * (a <= 0.0031308 ? 12.92 * a : 1.055 * a ** (1 / 2.4) - 0.055);
};

export function oklchToSrgb(L: number, C: number, H: number): Srgb {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return {
    r: toGamma(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: toGamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: toGamma(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  };
}

export function srgbToOklch({ r, g, b }: Srgb): Oklch {
  const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)];
  const l = Math.cbrt(0.4122214708 * lr + 0.5363015264 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.sqrt(A * A + B * B);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, C, H: C < 1e-4 ? 0 : H };
}

const inGamut = ({ r, g, b }: Srgb, eps = 1e-4) => [r, g, b].every((c) => c >= -eps && c <= 1 + eps);

/** Reduces chroma at a fixed lightness and hue until the color fits in sRGB (binary search). */
export function gamutMapOklch(L: number, C: number, H: number): Oklch {
  if (inGamut(oklchToSrgb(L, C, H))) return { L, C, H };
  let lo = 0;
  let hi = C;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklchToSrgb(L, mid, H))) lo = mid;
    else hi = mid;
  }
  return { L, C: lo, H };
}

export function toHex({ r, g, b }: Srgb): string {
  const h = (x: number) => Math.round(clamp01(x) * 255).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

function parseHex(str: string): Srgb | null {
  let h = str.slice(1);
  if (![3, 4, 6, 8].includes(h.length) || /[^0-9a-f]/i.test(h)) return null;
  if (h.length <= 4) h = [...h].map((c) => c + c).join('');
  const n = (i: number) => parseInt(h.slice(i, i + 2), 16) / 255;
  return { r: n(0), g: n(2), b: n(4) };
}

function num(token: string, percentScale = 1): number {
  const t = token.trim();
  if (t === 'none') return 0;
  return t.endsWith('%') ? (parseFloat(t) / 100) * percentScale : parseFloat(t);
}

/** Parses `#rgb`, `#rrggbb` (alpha is ignored), `rgb()` / `rgba()` and `oklch()`. Returns `null` for anything else. */
export function parseColor(value: string): Srgb | null {
  const str = value.trim().toLowerCase();
  if (str.startsWith('#')) return parseHex(str);
  const match = str.match(/^(rgba?|oklch)\((.*)\)$/);
  if (!match) return null;
  const parts = match[2].split('/')[0].trim().split(/[\s,]+/).filter(Boolean);
  if (parts.length < 3) return null;
  const channels =
    match[1] === 'oklch'
      ? [num(parts[0], 1), num(parts[1], 0.4), num(parts[2])]
      : parts.slice(0, 3).map((p) => (p.endsWith('%') ? num(p, 1) : num(p) / 255));
  if (channels.some((c) => Number.isNaN(c))) return null;
  return match[1] === 'oklch'
    ? oklchToSrgb(channels[0], channels[1], channels[2])
    : { r: channels[0], g: channels[1], b: channels[2] };
}

const luminance = ({ r, g, b }: Srgb) => {
  const [R, G, B] = [r, g, b].map((c) => toLinear(clamp01(c)));
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

/** WCAG 2.x contrast ratio between two opaque colors. */
export function contrastRatio(a: Srgb, b: Srgb): number {
  const [l1, l2] = [luminance(a), luminance(b)];
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
