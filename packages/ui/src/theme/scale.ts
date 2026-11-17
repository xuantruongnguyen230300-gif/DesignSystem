import { contrastRatio, gamutMapOklch, oklchToSrgb, parseColor, srgbToOklch, toHex } from './color';

/** The brand scale has these 11 steps: `--nxt-color-brand-<step>`. */
export const NXT_SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type NxtScaleStep = (typeof NXT_SCALE_STEPS)[number];
/** A full brand scale: one CSS color per step. */
export type NxtScale = Readonly<Record<NxtScaleStep, string>>;

// Lightness / relative chroma per step. Same curves as `tools/lib/palette.mjs` (the `ds:palette` command):
// every brand gets the same lightness at each step, which is why white text on step 600 stays readable for any hue.
const LIGHTNESS = [0.971, 0.936, 0.885, 0.808, 0.704, 0.623, 0.546, 0.488, 0.424, 0.379, 0.282];
const CHROMA = [0.057, 0.131, 0.241, 0.429, 0.673, 0.873, 1, 0.992, 0.812, 0.596, 0.371];
const NEUTRAL_LIGHTNESS = [0.985, 0.952, 0.9, 0.85, 0.708, 0.556, 0.48, 0.371, 0.269, 0.205, 0.145];
const NEUTRAL_THRESHOLD = 0.03;

/**
 * Builds the 11-step brand scale from one seed color (`#hex`, `rgb()` or `oklch()`).
 * The seed lands exactly on the nearest step; the other steps follow the NXT curves in OKLCH.
 * Throws when the seed cannot be parsed.
 */
export function createNxtScale(seed: string): NxtScale {
  const rgb = parseColor(seed);
  if (!rgb) throw new Error(`Cannot parse the color "${seed}". Use a hex color like #1d4ed8, an rgb color or an oklch color.`);
  const s = srgbToOklch(rgb);
  const neutral = s.C < NEUTRAL_THRESHOLD;
  const curve = neutral ? NEUTRAL_LIGHTNESS : LIGHTNESS;
  const nearest = curve.reduce((best, L, i) => (Math.abs(L - s.L) < Math.abs(curve[best] - s.L) ? i : best), 0);
  const peak = neutral ? s.C : Math.min(0.37, s.C / CHROMA[nearest]);

  const entries = NXT_SCALE_STEPS.map((step, i) => {
    const base =
      i === nearest
        ? s
        : { L: curve[i], C: neutral ? s.C * (i === 0 || i === NXT_SCALE_STEPS.length - 1 ? 0.6 : 1) : peak * CHROMA[i], H: s.H };
    const mapped = gamutMapOklch(base.L, base.C, base.H);
    return [step, toHex(oklchToSrgb(mapped.L, mapped.C, mapped.H))] as const;
  });
  return Object.fromEntries(entries) as unknown as NxtScale;
}

/** True when `value` has a color for every one of the 11 steps. */
export function isNxtScale(value: unknown): value is NxtScale {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return NXT_SCALE_STEPS.every((step) => typeof record[String(step)] === 'string');
}

const WHITE = { r: 1, g: 1, b: 1 };

/**
 * Contrast problems of a scale in the NXT roles that sit on it (WCAG 2.2 AA): white text on the filled
 * button (600, hover 700, pressed 800), link text (700) on white and on the 50 tint, and the dark-mode link (400)
 * on the dark surface (skipped when `darkSurface` is not given). Scales made by `createNxtScale` pass; scales written
 * by hand may not. Colors that cannot be parsed (for example `var(--x)`) are skipped.
 */
export function checkNxtScale(scale: NxtScale, darkSurface?: string): string[] {
  const color = (step: NxtScaleStep) => parseColor(scale[step]);
  const issues: string[] = [];
  const need = (what: string, fg: ReturnType<typeof parseColor>, bg: ReturnType<typeof parseColor>, min: number) => {
    if (!fg || !bg) return;
    const ratio = contrastRatio(fg, bg);
    if (ratio < min) issues.push(`${what}: ${ratio.toFixed(2)}:1, needs ${min}:1`);
  };
  for (const step of [600, 700, 800] as const) need(`white text on brand-${step} (filled button)`, WHITE, color(step), 4.5);
  need('brand-700 link text on white', color(700), WHITE, 4.5);
  need('brand-700 link text on brand-50', color(700), color(50), 4.5);
  need('brand-400 link text on the dark surface', color(400), darkSurface ? parseColor(darkSurface) : null, 4.5);
  return issues;
}
