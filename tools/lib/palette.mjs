// OKLCH color-scale generation shared by tools/tokens/palette.mjs (single + batch mode).
import { gamutMapOklch, oklchToSrgb, parseColor, srgbToOklch, toHex } from './color.mjs';

export const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
// Chromatic scales: lightness/relative-chroma curves calibrated on widely used UI scales.
const LIGHTNESS = [0.971, 0.936, 0.885, 0.808, 0.704, 0.623, 0.546, 0.488, 0.424, 0.379, 0.282];
const CHROMA = [0.057, 0.131, 0.241, 0.429, 0.673, 0.873, 1, 0.992, 0.812, 0.596, 0.371];
// Neutral scales need a wider range: near-white surfaces and near-black dark-mode canvases.
// 600 sits at 0.48 so secondary text (~6:1 on white) stays clearly lighter than body text (~18:1).
const NEUTRAL_LIGHTNESS = [0.985, 0.967, 0.922, 0.87, 0.708, 0.556, 0.48, 0.371, 0.269, 0.205, 0.145];
const NEUTRAL_THRESHOLD = 0.03;

const round = (x, d) => Math.round(x * 10 ** d) / 10 ** d;

/**
 * @param {string} seedStr any CSS color
 * @param {{ anchor?: boolean, neutral?: boolean }} opts
 */
export function generateScale(seedStr, { anchor = true, neutral } = {}) {
  const seed = parseColor(seedStr);
  if (!seed) throw new Error(`Cannot parse seed color: ${seedStr}`);
  const s = srgbToOklch(seed);
  const isNeutral = neutral ?? s.C < NEUTRAL_THRESHOLD;
  const curve = isNeutral ? NEUTRAL_LIGHTNESS : LIGHTNESS;
  const nearest = curve.reduce((best, L, i) => (Math.abs(L - s.L) < Math.abs(curve[best] - s.L) ? i : best), 0);
  const peak = isNeutral ? s.C : Math.min(0.37, s.C / CHROMA[nearest]);

  const steps = STEPS.map((step, i) => {
    let L = curve[i];
    let C = isNeutral ? s.C * (i === 0 || i === STEPS.length - 1 ? 0.6 : 1) : peak * CHROMA[i];
    let H = s.H;
    if (anchor && i === nearest) ({ L, C, H } = s);
    const mapped = gamutMapOklch(L, C, H);
    const rgb = oklchToSrgb(mapped.L, mapped.C, mapped.H);
    return {
      step,
      L: round(mapped.L, 4),
      C: round(mapped.C, 4),
      H: round(mapped.H, 2),
      hex: toHex(rgb),
      rgb,
      anchored: anchor && i === nearest,
      clipped: mapped.C + 1e-4 < C,
    };
  });
  return { seed: s, neutral: isNeutral, anchorStep: STEPS[nearest], steps };
}

/** DTCG group { "50": { $value: {colorSpace…} }, … } for one scale. */
export function scaleToDtcg(scale, description) {
  const group = Object.fromEntries(
    scale.steps.map((c) => [String(c.step), { $value: { colorSpace: 'oklch', components: [c.L, c.C, c.H], alpha: 1, hex: c.hex } }]),
  );
  if (description) group.$description = description;
  return group;
}
