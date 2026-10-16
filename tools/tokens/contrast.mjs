#!/usr/bin/env node
// WCAG 2.x contrast between two CSS colors.
// Usage: node tools/tokens/contrast.mjs <fg> <bg> [--on <backdrop>]
//   Translucent colors are composited: fg over bg, bg over --on (default white).
// Example: node tools/tokens/contrast.mjs "#6B7280" "oklch(98.5% 0 0)"

import { contrastRatio, parseColor, wcagRating } from '../lib/color.mjs';

const args = process.argv.slice(2);
const onIdx = args.indexOf('--on');
const backdropStr = onIdx >= 0 ? args.splice(onIdx, 2)[1] : '#FFFFFF';
const [fgStr, bgStr] = args;

const fg = parseColor(fgStr);
const bg = parseColor(bgStr);
const backdrop = parseColor(backdropStr);
if (!fg || !bg || !backdrop) {
  console.error('Usage: node tools/tokens/contrast.mjs <fg> <bg> [--on <backdrop>]  (colors: #hex, rgb(), oklch(), oklab())');
  process.exit(2);
}

const r = wcagRating(contrastRatio(fg, bg, backdrop));
const mark = (ok) => (ok ? 'pass' : 'FAIL');
console.log(`${fgStr} on ${bgStr}: ${r.ratio}:1`);
console.log(`  AA text (4.5)        ${mark(r.aaText)}`);
console.log(`  AA large text (3)    ${mark(r.aaLargeText)}`);
console.log(`  AA non-text UI (3)   ${mark(r.aaNonText)}`);
console.log(`  AAA text (7)         ${mark(r.aaaText)}`);
process.exit(r.aaText ? 0 : 1);
