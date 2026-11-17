#!/usr/bin/env node
// nxt-palette: makes an NXT brand color scale from one seed color, for products that want plain CSS instead of
// `provideNxt({ primary })`. Same algorithm and curves as the runtime option and as `npm run ds:palette` in the NXT repo.
//
//   npx nxt-palette "#0f766e" > brand.css      CSS to load after @nxt/tokens/css/core.css
//   npx nxt-palette "#0f766e" --json           the scale as JSON (for provideNxt({ primary: { … } }))
//
// The seed may be #rrggbb, rgb() or oklch(). The contrast report goes to stderr, so redirecting stdout is safe.

import fs from 'node:fs';
import { contrastRatio, parseColor } from '../dist/lib/color.mjs';
import { generateScale } from '../dist/lib/palette.mjs';

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h') || !args.some((a) => !a.startsWith('--'))) {
  console.error('Usage: nxt-palette <seed-color> [--json]\n  e.g.  npx nxt-palette "#0f766e" > brand.css');
  process.exit(args.includes('--help') || args.includes('-h') ? 0 : 1);
}

const seed = args.find((a) => !a.startsWith('--'));
let scale;
try {
  scale = generateScale(seed);
} catch {
  console.error(`Cannot parse the color "${seed}". Use #rrggbb, rgb() or oklch().`);
  process.exit(1);
}
const hex = Object.fromEntries(scale.steps.map((s) => [s.step, s.hex]));

if (args.includes('--json')) {
  console.log(JSON.stringify(hex, null, 2));
} else {
  const lines = scale.steps.map((s) => `  --nxt-color-brand-${s.step}: ${s.hex};`);
  console.log(`/* NXT brand scale from ${seed}. Load after @nxt/tokens/css/core.css. */\n:root {\n${lines.join('\n')}\n}`);
}

// The roles NXT puts on the scale (WCAG 2.2 AA); the dark surface is read from the installed tokens.
const core = fs.readFileSync(new URL('../dist/css/core.css', import.meta.url), 'utf8');
const dark = core.match(/--nxt-color-neutral-900:\s*(#[0-9a-f]+)/i)?.[1];
const white = parseColor('#ffffff');
const c = (step) => parseColor(hex[step]);
const checks = [
  ...[600, 700, 800].map((step) => [`white text on brand-${step} (filled button)`, white, c(step)]),
  ['brand-700 link text on white', c(700), white],
  ['brand-700 link text on brand-50', c(700), c(50)],
  ...(dark ? [['brand-400 link text on the dark surface', c(400), parseColor(dark)]] : []),
];
const bad = checks.filter(([, fg, bg]) => contrastRatio(fg, bg) < 4.5);
console.error(
  bad.length
    ? `Contrast below 4.5:1 (WCAG 2.2 AA):\n${bad.map(([what, fg, bg]) => `  ${what}: ${contrastRatio(fg, bg).toFixed(2)}:1`).join('\n')}`
    : `Contrast OK: ${checks.length} NXT roles reach 4.5:1 (WCAG 2.2 AA). The button fill is brand-600 = ${hex[600]}.`,
);
