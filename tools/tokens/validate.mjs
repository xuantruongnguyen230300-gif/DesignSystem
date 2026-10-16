#!/usr/bin/env node
// NXT token validator — checks W3C DTCG token sources against docs/design/token-architecture.md.
//
// Usage: node tools/tokens/validate.mjs [--root packages/tokens] [--json] [--strict]
//   --root    token package folder (contains tokens.config.json and src/)
//   --json    machine-readable output
//   --strict  treat warnings as errors (exit 1)
//
// Exit code: 0 = clean, 1 = errors (or warnings with --strict), 2 = bad invocation.

import fs from 'node:fs';
import path from 'node:path';
import { contrastRatio, parseColor } from '../lib/color.mjs';

const DEFAULT_CONFIG = {
  prefix: 'nxt',
  src: 'src',
  brandsDir: 'brands',
  // tier -> tiers it may reference
  tiers: {
    primitive: ['primitive'],
    semantic: ['primitive', 'semantic'],
    component: ['semantic', 'component'],
  },
  // mode axis -> modes (first one is the default)
  modes: {
    color: ['light', 'dark'],
    density: ['comfortable', 'compact', 'spacious'],
    motion: ['full', 'reduced'],
  },
  contrastPairs: [],
};

const KNOWN_TYPES = new Set([
  'color', 'dimension', 'fontFamily', 'fontWeight', 'duration', 'cubicBezier', 'number',
  'strokeStyle', 'border', 'transition', 'shadow', 'gradient', 'typography',
]);
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const REF_RE = /\{([^{}]+)\}/g;
const FULL_REF_RE = /^\{([^{}]+)\}$/;

// ---------- args ----------
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => {
  const i = args.indexOf(n);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};
const root = path.resolve(opt('--root', 'packages/tokens'));
const asJson = flag('--json');
const strict = flag('--strict');

// ---------- problems ----------
const problems = new Map();
function report(level, where, message, file) {
  const key = `${level}|${where}|${message}`;
  if (!problems.has(key)) problems.set(key, { level, where, message, file: file ?? null });
}
const error = (where, msg, file) => report('error', where, msg, file);
const warn = (where, msg, file) => report('warn', where, msg, file);

// ---------- config ----------
function loadConfig() {
  const p = path.join(root, 'tokens.config.json');
  if (!fs.existsSync(p)) return { ...DEFAULT_CONFIG, _source: 'built-in defaults' };
  try {
    const user = JSON.parse(fs.readFileSync(p, 'utf8'));
    return { ...DEFAULT_CONFIG, ...user, _source: rel(p) };
  } catch (e) {
    console.error(`Cannot parse ${p}: ${e.message}`);
    process.exit(2);
  }
}
const config = loadConfig();
const srcDir = path.join(root, config.src);
const tierNames = Object.keys(config.tiers);
const modeOf = new Map(); // mode name -> axis
for (const [axis, modes] of Object.entries(config.modes)) {
  for (const m of modes) modeOf.set(m, axis);
}

// ---------- discovery ----------
function listJson(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return listJson(p);
    return d.name.endsWith('.json') ? [p] : [];
  });
}

function classify(file) {
  const rel = path.relative(srcDir, file).split(path.sep);
  let brand = null;
  if (rel[0] === config.brandsDir && rel.length > 2) brand = rel[1];
  const stemParts = path.basename(file).replace(/\.json$/, '').split('.').filter((s) => s !== 'tokens');
  const found = stemParts.filter((s) => modeOf.has(s));
  if (found.length > 1) error(rel.join('/'), `file name matches several modes (${found.join(', ')})`, file);
  const mode = found[0] ?? null;
  return { brand, mode, axis: mode ? modeOf.get(mode) : null };
}

function flatten(node, file, segs, inheritedType, out) {
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    const p = [...segs, key];
    const where = p.join('.');
    if (!child || typeof child !== 'object' || Array.isArray(child)) {
      error(where, 'is neither a token (has $value) nor a group', file);
      continue;
    }
    if (!NAME_RE.test(key)) error(where, `name segment "${key}" must be lowercase kebab-case (a-z, 0-9, -)`, file);
    const type = child.$type ?? inheritedType;
    if ('$value' in child) {
      out.push({
        path: where, segs: p, value: child.$value, type,
        description: child.$description, deprecated: child.$deprecated, file,
      });
    } else {
      flatten(child, file, p, type, out);
    }
  }
}

// layers: base Map, modes[axis][mode] Map, brands[brand] = { base Map, modes }
const layers = { base: new Map(), modes: {}, brands: {} };
const allTokens = [];
const files = listJson(srcDir);

for (const file of files) {
  let json;
  try {
    json = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    error(path.relative(root, file), `invalid JSON: ${e.message}`, file);
    continue;
  }
  const { brand, mode, axis } = classify(file);
  const tokens = [];
  flatten(json, file, [], undefined, tokens);
  let target;
  if (brand) {
    layers.brands[brand] ??= { base: new Map(), modes: {} };
    const b = layers.brands[brand];
    target = mode ? ((b.modes[axis] ??= {})[mode] ??= new Map()) : b.base;
  } else {
    target = mode ? ((layers.modes[axis] ??= {})[mode] ??= new Map()) : layers.base;
  }
  for (const t of tokens) {
    t.layer = brand ? `brand:${brand}${mode ? `/${mode}` : ''}` : mode ?? 'base';
    if (target.has(t.path)) {
      error(t.path, `defined twice in layer "${t.layer}" (${rel(target.get(t.path).file)} and ${rel(file)})`, file);
    }
    target.set(t.path, t);
    allTokens.push(t);
  }
}

function rel(f) {
  return path.relative(process.cwd(), f).split(path.sep).join('/');
}

// ---------- structural checks ----------
const activeAxes = Object.keys(layers.modes);
const modePaths = new Map(); // path -> axis
for (const axis of activeAxes) {
  const present = Object.keys(layers.modes[axis]);
  const union = new Set(present.flatMap((m) => [...layers.modes[axis][m].keys()]));
  for (const p of union) {
    if (modePaths.has(p) && modePaths.get(p) !== axis) {
      error(p, `defined on two mode axes (${modePaths.get(p)}, ${axis})`);
    }
    modePaths.set(p, axis);
    if (layers.base.has(p)) error(p, `defined both in a base file and in "${axis}" mode files — pick one`);
    for (const m of config.modes[axis]) {
      if (!present.includes(m)) continue;
      if (!layers.modes[axis][m].has(p)) error(p, `missing in mode "${m}" (axis "${axis}") — every mode must define the same tokens`);
    }
  }
  const missingModes = config.modes[axis].filter((m) => !present.includes(m));
  if (missingModes.length) warn(`modes.${axis}`, `no files for mode(s): ${missingModes.join(', ')}`);
}

for (const [brand, b] of Object.entries(layers.brands)) {
  for (const t of b.base.values()) {
    if (!layers.base.has(t.path) && !modePaths.has(t.path)) {
      error(t.path, `brand "${brand}" overrides a token that does not exist — brands may only override, not add`, t.file);
    } else if (modePaths.has(t.path)) {
      error(t.path, `brand "${brand}" overrides a mode-dependent token in a base file — put it in a *.${'<mode>'}.json brand file`, t.file);
    }
  }
  for (const [axis, modes] of Object.entries(b.modes)) {
    for (const [m, map] of Object.entries(modes)) {
      for (const t of map.values()) {
        if (!layers.modes[axis]?.[m]?.has(t.path)) {
          error(t.path, `brand "${brand}" overrides "${t.path}" in mode "${m}" but the base mode file does not define it`, t.file);
        }
      }
    }
  }
}

// ---------- contexts ----------
function defaultSelection() {
  const sel = {};
  for (const axis of activeAxes) {
    sel[axis] = config.modes[axis].find((m) => layers.modes[axis][m]) ?? config.modes[axis][0];
  }
  return sel;
}

function buildContext(selection, brand) {
  const map = new Map(layers.base);
  for (const [axis, m] of Object.entries(selection)) {
    for (const [k, v] of layers.modes[axis]?.[m] ?? []) map.set(k, v);
  }
  if (brand) {
    const b = layers.brands[brand];
    for (const [k, v] of b.base) map.set(k, v);
    for (const [axis, m] of Object.entries(selection)) {
      for (const [k, v] of b.modes[axis]?.[m] ?? []) map.set(k, v);
    }
  }
  return map;
}

const contexts = [];
for (const brand of [null, ...Object.keys(layers.brands)]) {
  const base = defaultSelection();
  const variants = [base];
  for (const axis of activeAxes) {
    for (const m of config.modes[axis]) {
      if (m !== base[axis] && layers.modes[axis][m]) variants.push({ ...base, [axis]: m });
    }
  }
  for (const sel of variants) {
    const label = [brand ? `brand=${brand}` : 'core', ...Object.entries(sel).map(([a, m]) => `${a}=${m}`)].join(', ');
    contexts.push({ label, brand, selection: sel, map: buildContext(sel, brand) });
  }
}

// ---------- resolution ----------
function resolveIn(ctx, p, stack = []) {
  ctx.cache ??= new Map();
  if (ctx.cache.has(p)) return ctx.cache.get(p);
  const tok = ctx.map.get(p);
  if (!tok) return { ok: false, reason: 'missing' };
  if (stack.includes(p)) return { ok: false, reason: `circular reference ${[...stack, p].join(' -> ')}` };
  const out = resolveValue(ctx, tok.value, [...stack, p]);
  const res = out.ok ? { ok: true, value: out.value, type: tok.type } : out;
  ctx.cache.set(p, res);
  return res;
}

function resolveValue(ctx, value, stack) {
  if (typeof value === 'string') {
    const full = value.match(FULL_REF_RE);
    if (full) {
      const r = resolveIn(ctx, full[1], stack);
      if (r.ok) return r;
      if (r.reason === 'missing') return { ok: false, reason: `references {${full[1]}} which does not exist in this context`, missingRef: full[1] };
      return r;
    }
    return { ok: true, value };
  }
  if (Array.isArray(value)) {
    const outArr = [];
    for (const v of value) {
      const r = resolveValue(ctx, v, stack);
      if (!r.ok) return r;
      outArr.push(r.value);
    }
    return { ok: true, value: outArr };
  }
  if (value && typeof value === 'object') {
    if ('colorSpace' in value || 'unit' in value) return { ok: true, value };
    const outObj = {};
    for (const [k, v] of Object.entries(value)) {
      const r = resolveValue(ctx, v, stack);
      if (!r.ok) return r;
      outObj[k] = r.value;
    }
    return { ok: true, value: outObj };
  }
  return { ok: true, value };
}

function refsOf(value, out = []) {
  if (typeof value === 'string') for (const m of value.matchAll(REF_RE)) out.push(m[1]);
  else if (Array.isArray(value)) value.forEach((v) => refsOf(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => refsOf(v, out));
  return out;
}

// ---------- per-token rules ----------
const cssNames = new Map();
const seenPaths = new Set();
const allPaths = new Set(allTokens.map((t) => t.path));
const deprecated = new Set(allTokens.filter((t) => t.deprecated).map((t) => t.path));
// Brand files only override values, so a description anywhere in core layers is enough.
const described = new Set(allTokens.filter((t) => t.description && !t.layer.startsWith('brand:')).map((t) => t.path));
const missingDescriptions = [];

for (const t of allTokens) {
  const tier = t.segs[0];
  const firstVisit = !seenPaths.has(t.path);
  seenPaths.add(t.path);

  if (!tierNames.includes(tier)) {
    error(t.path, `top-level group must be a tier (${tierNames.join(' | ')}), got "${tier}"`, t.file);
    continue;
  }
  if (!t.type) error(t.path, 'has no $type (set it on the token or a parent group)', t.file);
  else if (!KNOWN_TYPES.has(t.type)) warn(t.path, `unknown $type "${t.type}"`, t.file);

  const refs = refsOf(t.value);
  const isFullRef = typeof t.value === 'string' && FULL_REF_RE.test(t.value);
  if (typeof t.value === 'string' && refs.length && !isFullRef) {
    warn(t.path, 'embeds a reference inside a string — DTCG only allows a whole-value alias', t.file);
  }
  for (const r of refs) {
    const targetTier = r.split('.')[0];
    if (!config.tiers[tier].includes(targetTier)) {
      error(t.path, `${tier} token may not reference ${targetTier} token {${r}} (allowed: ${config.tiers[tier].join(', ')})`, t.file);
    }
    if (!allPaths.has(r)) error(t.path, `references {${r}} which does not exist`, t.file);
    if (deprecated.has(r) && !t.deprecated) warn(t.path, `references deprecated token {${r}}`, t.file);
  }

  if (!refs.length) {
    if (t.type === 'color') {
      if (tier !== 'primitive') error(t.path, `${tier} color must alias a token, not a literal value`, t.file);
      else if (!parseColor(t.value)) error(t.path, `cannot parse color value ${JSON.stringify(t.value)}`, t.file);
    } else if (tier === 'component') {
      warn(t.path, 'component token uses a literal — prefer aliasing a semantic token', t.file);
    }
  }

  if (firstVisit) {
    if (tier !== 'primitive' && !described.has(t.path) && !deprecated.has(t.path)) missingDescriptions.push(t.path);
    const css = `--${config.prefix}-${t.segs.slice(1).join('-')}`;
    const other = cssNames.get(css);
    if (other && other !== t.path) error(t.path, `CSS variable ${css} collides with ${other}`, t.file);
    cssNames.set(css, t.path);
  }
}

if (missingDescriptions.length) {
  const sample = missingDescriptions.slice(0, 5).join(', ');
  warn('$description', `${missingDescriptions.length} semantic/component token(s) lack $description (e.g. ${sample})`);
}

// resolution in every context (cycles, chains broken only in some brand/mode)
for (const ctx of contexts) {
  for (const p of ctx.map.keys()) {
    const r = resolveIn(ctx, p);
    if (r.ok || r.reason === 'missing') continue;
    if (r.missingRef && !allPaths.has(r.missingRef)) continue; // already reported once above
    if (r.reason.startsWith('circular')) error(p, r.reason, ctx.map.get(p).file);
    else error(p, `${r.reason} [${ctx.label}]`, ctx.map.get(p).file);
  }
}

// ---------- contrast ----------
const contrastResults = [];
for (const pair of config.contrastPairs ?? []) {
  for (const ctx of contexts) {
    if (pair.when && Object.entries(pair.when).some(([a, m]) => ctx.selection[a] !== m)) continue;
    const fg = resolveIn(ctx, pair.fg);
    const bg = resolveIn(ctx, pair.bg);
    const on = pair.on ? resolveIn(ctx, pair.on) : null;
    const where = `contrast ${pair.fg} on ${pair.bg}`;
    if (!fg.ok || !bg.ok || (on && !on.ok)) {
      error(where, `cannot resolve pair in [${ctx.label}]`);
      continue;
    }
    const fc = parseColor(fg.value);
    const bc = parseColor(bg.value);
    const oc = on ? parseColor(on.value) : undefined;
    if (!fc || !bc) {
      error(where, `pair does not resolve to colors in [${ctx.label}]`);
      continue;
    }
    const ratio = contrastRatio(fc, bc, oc ?? undefined);
    const min = pair.min ?? 4.5;
    const ok = ratio + 1e-9 >= min;
    contrastResults.push({ fg: pair.fg, bg: pair.bg, context: ctx.label, ratio: +ratio.toFixed(2), min, ok });
    if (!ok) error(where, `ratio ${ratio.toFixed(2)}:1 < ${min}:1 [${ctx.label}]${pair.note ? ` — ${pair.note}` : ''}`);
  }
}

// ---------- output ----------
const list = [...problems.values()].sort((a, b) => (a.level === b.level ? a.where.localeCompare(b.where) : a.level === 'error' ? -1 : 1));
const errors = list.filter((p) => p.level === 'error').length;
const warnings = list.length - errors;
const summary = {
  root: rel(root),
  config: config._source,
  files: files.length,
  tokens: seenPaths.size,
  brands: Object.keys(layers.brands),
  contexts: contexts.map((c) => c.label),
  errors,
  warnings,
};

if (asJson) {
  console.log(JSON.stringify({ summary, problems: list.map((p) => ({ ...p, file: p.file && rel(p.file) })), contrast: contrastResults }, null, 2));
} else {
  if (!files.length) {
    console.log(`No token files found under ${rel(srcDir)} — nothing to validate.`);
  } else {
    console.log(`NXT tokens: ${summary.tokens} tokens in ${summary.files} files · ${contexts.length} context(s) · config: ${summary.config}`);
    for (const p of list) {
      console.log(`${p.level === 'error' ? 'ERROR' : 'WARN '}  ${p.where}  ${p.message}${p.file ? `  (${rel(p.file)})` : ''}`);
    }
    const failedPairs = contrastResults.filter((c) => !c.ok).length;
    if (contrastResults.length) console.log(`Contrast: ${contrastResults.length - failedPairs}/${contrastResults.length} checks pass`);
    console.log(`Result: ${errors} error(s), ${warnings} warning(s)`);
  }
}

process.exit(errors || (strict && warnings) ? 1 : 0);
