#!/usr/bin/env node
// Build NXT tokens (W3C DTCG) → CSS custom properties, SCSS breakpoints, JS constants, JSON for docs.
//
// Usage: node tools/tokens/build.mjs [--root packages/tokens] [--out <root>/dist]
//
// CSS strategy (why this is not a plain `:root { … }` dump):
//   An alias such as `--nxt-button-bg: var(--nxt-color-bg-primary)` is computed on the element that
//   declares it. If it were declared only on :root, a nested `[data-nxt-color="dark"]` region would
//   change --nxt-color-bg-primary but keep the stale --nxt-button-bg inherited from :root.
//   So every mode/brand block re-declares the transitive dependents of what it changes, which makes
//   modes and brands work on any element and in any nesting order.

import fs from 'node:fs';
import path from 'node:path';
import { parseColor, toHex } from '../lib/color.mjs';
import { analyze, cssVarName, FULL_REF_RE, refsOf, rel, resolveIn } from '../lib/tokens.mjs';

const args = process.argv.slice(2);
const opt = (n, d) => {
  const i = args.indexOf(n);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};
const root = path.resolve(opt('--root', 'packages/tokens'));
const outDir = path.resolve(opt('--out', path.join(root, 'dist')));

const result = analyze(root);
if (result.summary.errors) {
  for (const p of result.problems.filter((x) => x.level === 'error')) console.error(`ERROR  ${p.where}  ${p.message}`);
  console.error(`Token build aborted: ${result.summary.errors} validation error(s). Run npm run ds:tokens for details.`);
  process.exit(1);
}
const { config, allTokens, activeAxes, defaultSelection, contexts } = result;
if (!allTokens.length) {
  console.error('No tokens to build.');
  process.exit(1);
}

// Modes that can follow an OS preference via a media query.
const AUTO = {
  color: { value: 'auto', mode: 'dark', media: '(prefers-color-scheme: dark)' },
  motion: { mode: 'reduced', media: '(prefers-reduced-motion: reduce)', byDefault: true },
};
const COLOR_SCHEME = { light: 'light', dark: 'dark' };
const TIER_ORDER = Object.keys(config.tiers);

// ---------- CSS text ----------
const ref = (p) => `var(${cssVarName(config, p)})`;
const GENERIC_FAMILIES = new Set(['serif', 'sans-serif', 'monospace', 'system-ui', 'ui-sans-serif', 'ui-serif', 'ui-monospace', 'cursive', 'fantasy', 'emoji', 'math']);
const fmtDim = (x) => (x && typeof x === 'object' ? `${x.value}${x.unit}` : typeof x === 'number' ? (x === 0 ? '0' : `${x}px`) : String(x));
const fmtDuration = (x) => (x && typeof x === 'object' ? `${x.value}${x.unit}` : typeof x === 'number' ? `${x}ms` : String(x));
const fmtColor = (x) => {
  const c = parseColor(x);
  return c ? toHex(c) : String(x);
};
const fmtFamily = (x) =>
  (Array.isArray(x) ? x : [x]).map((f) => (/\s/.test(f) && !/^["']/.test(f) && !GENERIC_FAMILIES.has(f) ? `"${f}"` : f)).join(', ');
const fmtBezier = (x) => (Array.isArray(x) ? `cubic-bezier(${x.join(', ')})` : String(x));
const sub = (val, fmt) => (typeof val === 'string' && FULL_REF_RE.test(val) ? ref(val.slice(1, -1)) : fmt(val));
const fmtShadow = (x) => {
  const one = (s) =>
    [s.inset ? 'inset' : '', sub(s.offsetX, fmtDim), sub(s.offsetY, fmtDim), sub(s.blur, fmtDim), sub(s.spread ?? 0, fmtDim), sub(s.color, fmtColor)]
      .filter(Boolean)
      .join(' ');
  return Array.isArray(x) ? x.map(one).join(', ') : one(x);
};
const fmtTypography = (x) =>
  [x.fontStyle ? sub(x.fontStyle, String) : '', sub(x.fontWeight, String), `${sub(x.fontSize, fmtDim)}/${sub(x.lineHeight, String)}`, sub(x.fontFamily, fmtFamily)]
    .filter(Boolean)
    .join(' ');

function cssText(type, val) {
  if (typeof val === 'string' && FULL_REF_RE.test(val)) return ref(val.slice(1, -1));
  switch (type) {
    case 'color':
      return fmtColor(val);
    case 'dimension':
      return fmtDim(val);
    case 'duration':
      return fmtDuration(val);
    case 'fontFamily':
      return fmtFamily(val);
    case 'fontWeight':
    case 'number':
      return String(val);
    case 'cubicBezier':
      return fmtBezier(val);
    case 'shadow':
      return fmtShadow(val);
    case 'typography':
      return fmtTypography(val);
    case 'border':
      return `${sub(val.width, fmtDim)} ${sub(val.style, String)} ${sub(val.color, fmtColor)}`;
    case 'transition':
      return `${sub(val.duration, fmtDuration)} ${sub(val.timingFunction, fmtBezier)} ${sub(val.delay ?? 0, fmtDuration)}`;
    default:
      return typeof val === 'object' ? JSON.stringify(val) : String(val);
  }
}

// ---------- dependency graph ----------
const dependents = new Map();
for (const t of allTokens) {
  for (const r of refsOf(t.value)) {
    if (!dependents.has(r)) dependents.set(r, new Set());
    dependents.get(r).add(t.path);
  }
}
function closure(paths) {
  const out = new Set(paths);
  const queue = [...paths];
  while (queue.length) {
    for (const d of dependents.get(queue.pop()) ?? []) {
      if (!out.has(d)) {
        out.add(d);
        queue.push(d);
      }
    }
  }
  return out;
}

// ---------- contexts ----------
const ctxOf = (brand, axis = null, mode = null) => contexts.find((c) => c.brand === brand && c.axis === axis && c.mode === mode);
const textCache = new Map();
function textOf(ctx, p) {
  const key = `${ctx.label}|${p}`;
  if (!textCache.has(key)) {
    const t = ctx.map.get(p);
    textCache.set(key, t ? cssText(t.type, t.value) : undefined);
  }
  return textCache.get(key);
}
const diff = (a, b, paths) => new Set([...paths].filter((p) => textOf(a, p) !== textOf(b, p)));

const tierRank = (p) => TIER_ORDER.indexOf(p.split('.')[0]);
const sortPaths = (ps) => [...ps].sort((a, b) => tierRank(a) - tierRank(b) || a.localeCompare(b, 'en', { numeric: true }));

function block(selector, ctx, paths, extra = []) {
  if (!paths.size && !extra.length) return '';
  const lines = [...extra];
  let tier = null;
  for (const p of sortPaths(paths)) {
    const t = p.split('.')[0];
    if (t !== tier) {
      lines.push(`/* ${t} */`);
      tier = t;
    }
    lines.push(`${cssVarName(config, p)}: ${textOf(ctx, p)};`);
  }
  return `${selector} {\n${lines.map((l) => `  ${l}`).join('\n')}\n}\n`;
}
const media = (query, css) => (css ? `@media ${query} {\n${css.replace(/^/gm, '  ').trimEnd()}\n}\n` : '');
const attr = (axis, mode) => `[data-${config.prefix}-${axis}="${mode}"]`;
const brandAttr = (b) => `[data-${config.prefix}-brand="${b}"]`;
const combo = (b, axis, mode) => {
  const B = brandAttr(b);
  const A = attr(axis, mode);
  return `${B}${A},\n${B} ${A},\n${A} ${B}`;
};
const schemeLine = (axis, mode) => (axis === 'color' && COLOR_SCHEME[mode] ? [`color-scheme: ${COLOR_SCHEME[mode]};`] : []);

const header = `/* GENERATED by tools/tokens/build.mjs from ${rel(result.srcDir)} — do not edit. */\n`;
const coreDefault = ctxOf(null);
const allPaths = new Set(coreDefault.map.keys());

// ---------- core CSS ----------
let coreCss = header;
coreCss += block(':root', coreDefault, allPaths, schemeLine('color', defaultSelection.color));
const coreVariantSets = {};
for (const axis of activeAxes) {
  coreVariantSets[axis] = {};
  const variantModes = config.modes[axis].filter((m) => m !== defaultSelection[axis] && ctxOf(null, axis, m));
  for (const m of variantModes) coreVariantSets[axis][m] = closure(diff(ctxOf(null, axis, m), coreDefault, allPaths));
  const restore = new Set(variantModes.flatMap((m) => [...coreVariantSets[axis][m]]));
  coreCss += `\n/* ${axis}: ${config.modes[axis].join(' | ')} */\n`;
  coreCss += block(attr(axis, defaultSelection[axis]), coreDefault, restore, schemeLine(axis, defaultSelection[axis]));
  for (const m of variantModes) {
    const ctx = ctxOf(null, axis, m);
    coreCss += block(attr(axis, m), ctx, coreVariantSets[axis][m], schemeLine(axis, m));
    const auto = AUTO[axis];
    if (auto?.mode === m) {
      const sel = auto.byDefault ? `:root:not([data-${config.prefix}-${axis}])` : attr(axis, auto.value);
      coreCss += media(auto.media, block(sel, ctx, coreVariantSets[axis][m], schemeLine(axis, m)));
    }
  }
}

// ---------- brand CSS ----------
const brandCss = {};
for (const b of Object.keys(result.layers.brands)) {
  const bDefault = ctxOf(b);
  const bDefaultSet = closure(diff(bDefault, coreDefault, allPaths));
  let css = header + block(brandAttr(b), bDefault, bDefaultSet);
  for (const axis of activeAxes) {
    const variantModes = Object.keys(coreVariantSets[axis]);
    const sets = {};
    for (const m of variantModes) {
      const bCtx = ctxOf(b, axis, m);
      const cCtx = ctxOf(null, axis, m);
      const seeds = new Set([...allPaths].filter((p) => textOf(bCtx, p) !== textOf(bDefault, p) && textOf(bCtx, p) !== textOf(cCtx, p)));
      for (const p of coreVariantSets[axis][m]) if (bDefaultSet.has(p)) seeds.add(p);
      sets[m] = closure(seeds);
    }
    const restore = new Set(variantModes.flatMap((m) => [...sets[m]]));
    if (!restore.size) continue;
    css += `\n/* brand ${b} × ${axis} */\n`;
    css += block(combo(b, axis, defaultSelection[axis]), bDefault, restore);
    for (const m of variantModes) {
      const bCtx = ctxOf(b, axis, m);
      css += block(combo(b, axis, m), bCtx, sets[m]);
      const auto = AUTO[axis];
      if (auto?.mode === m && sets[m].size) {
        const sel = auto.byDefault
          ? `${brandAttr(b)}:not([data-${config.prefix}-${axis}])`
          : combo(b, axis, auto.value);
        css += media(auto.media, block(sel, bCtx, sets[m]));
      }
    }
  }
  brandCss[b] = css;
}

// ---------- resolved values (JSON / JS) ----------
function literal(ctx, p) {
  const r = resolveIn(ctx, p);
  return r.ok ? cssText(r.type, r.value) : undefined;
}
const byPath = new Map();
for (const t of allTokens) if (!byPath.has(t.path) || !t.layer.startsWith('brand:')) byPath.set(t.path, t);

const jsonTokens = sortPaths(allPaths).map((p) => {
  const t = byPath.get(p);
  const raw = coreDefault.map.get(p).value;
  const values = {};
  for (const ctx of contexts) values[ctx.label] = literal(ctx, p);
  return {
    path: p,
    cssVar: cssVarName(config, p),
    tier: p.split('.')[0],
    type: t.type,
    description: t.description ?? null,
    deprecated: t.deprecated ?? null,
    axis: result.modePaths.get(p) ?? null,
    alias: typeof raw === 'string' && FULL_REF_RE.test(raw) ? raw.slice(1, -1) : null,
    values,
  };
});

const shortName = (p) => p.split('.').slice(1).join('-');
const breakpoints = Object.fromEntries(
  jsonTokens
    .filter((t) => t.path.startsWith('primitive.breakpoint.'))
    .map((t) => [t.path.split('.').pop(), parseFloat(t.values[coreDefault.label])]),
);

// ---------- write ----------
const write = (file, content) => {
  const f = path.join(outDir, file);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content);
  return f;
};
fs.rmSync(outDir, { recursive: true, force: true });
const written = [];
written.push(write(`css/${config.prefix}.css`, coreCss));
for (const [b, css] of Object.entries(brandCss)) written.push(write(`css/brands/${b}.css`, css));

const bpEntries = Object.entries(breakpoints);
written.push(
  write(
    'scss/_breakpoints.scss',
    `// GENERATED by tools/tokens/build.mjs — do not edit.\n@use 'sass:map';\n\n$${config.prefix}-breakpoints: (\n${bpEntries.map(([k, v]) => `  '${k}': ${v}px,`).join('\n')}\n);\n\n` +
      `/// Viewport ≥ breakpoint. Components should prefer container queries.\n@mixin ${config.prefix}-up($bp) {\n  @media (min-width: map.get($${config.prefix}-breakpoints, $bp)) {\n    @content;\n  }\n}\n\n` +
      `/// Viewport < breakpoint.\n@mixin ${config.prefix}-down($bp) {\n  @media (max-width: calc(map.get($${config.prefix}-breakpoints, $bp) - 0.02px)) {\n    @content;\n  }\n}\n`,
  ),
);

const flat = Object.fromEntries(jsonTokens.map((t) => [shortName(t.path), t.values[coreDefault.label]]));
written.push(
  write(
    'js/index.js',
    `// GENERATED by tools/tokens/build.mjs — do not edit.\n` +
      `/** Resolved values in the default context (${coreDefault.label}). Prefer CSS variables in UI code. */\n` +
      `export const tokens = ${JSON.stringify(flat, null, 2)};\n\n` +
      `/** Breakpoints in px — for @angular/cdk/layout BreakpointObserver and charts. */\n` +
      `export const breakpoints = ${JSON.stringify(breakpoints)};\n\n` +
      `/** \`cssVar('color-bg-surface')\` → \`var(--${config.prefix}-color-bg-surface)\` */\n` +
      `export function cssVar(name) {\n  return \`var(--${config.prefix}-\${name})\`;\n}\n`,
  ),
);
written.push(
  write(
    'js/index.d.ts',
    `// GENERATED by tools/tokens/build.mjs — do not edit.\n` +
      `export type NxtTokenName =\n${Object.keys(flat).map((k) => `  | '${k}'`).join('\n')};\n` +
      `export declare const tokens: Record<NxtTokenName, string>;\n` +
      `export type NxtBreakpoint = ${bpEntries.map(([k]) => `'${k}'`).join(' | ') || 'never'};\n` +
      `export declare const breakpoints: Record<NxtBreakpoint, number>;\n` +
      `export declare function cssVar(name: NxtTokenName): string;\n`,
  ),
);
written.push(
  write(
    'json/tokens.json',
    `${JSON.stringify(
      {
        generator: 'tools/tokens/build.mjs',
        prefix: config.prefix,
        modes: Object.fromEntries(activeAxes.map((a) => [a, config.modes[a].filter((m) => m === defaultSelection[a] || ctxOf(null, a, m))])),
        defaultSelection,
        brands: Object.keys(result.layers.brands),
        contexts: contexts.map((c) => ({ label: c.label, brand: c.brand, axis: c.axis, mode: c.mode })),
        contrast: result.contrast,
        tokens: jsonTokens,
      },
      null,
      1,
    )}\n`,
  ),
);

const kb = (f) => (fs.statSync(f).size / 1024).toFixed(1);
console.log(`NXT tokens built: ${jsonTokens.length} tokens · ${contexts.length} contexts · warnings: ${result.summary.warnings}`);
for (const f of written) console.log(`  ${rel(f).padEnd(48)} ${kb(f).padStart(7)} KB`);
