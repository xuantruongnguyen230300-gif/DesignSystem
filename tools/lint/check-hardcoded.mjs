#!/usr/bin/env node
// Detect values that bypass NXT tokens in component/app code: color literals (error),
// px literals, numeric z-index, raw font-family, !important, ::ng-deep (warnings).
//
// Usage: node tools/lint/check-hardcoded.mjs [paths...] [--json] [--strict]
//   default paths: packages apps (packages/tokens and generated folders are skipped)
//   --strict  warnings also fail (exit 1)
// Suppress one line: put `nxt-allow: <rule>` in a comment on that line or the line above.

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const strict = args.includes('--strict');
const targets = args.filter((a) => !a.startsWith('--'));
const roots = (targets.length ? targets : ['packages', 'apps']).filter((p) => fs.existsSync(p));

// `generated` holds build output from tools/docs/generate.mjs (rendered prose mentions "rgb()" etc.).
const SKIP_DIRS = new Set(['node_modules', 'dist', '.angular', 'coverage', '.nx', 'out-tsc', 'tmp', 'generated']);
const SKIP_PATHS = [`packages${path.sep}tokens`];
const EXTS = new Set(['.css', '.scss', '.html', '.ts']);

const COLOR_FN = /\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/i;
const HEX_ANY = /(?<![\w&#-])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![\w-])/gi;
// In TS/HTML a hex only counts as a color when it is a whole quoted string or follows "prop:".
const HEX_IN_CODE = /(['"`])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\1|:\s*#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![\w-])/gi;
const PX = /(?<![\w.-])(\d*\.?\d+)px\b/g;

function walk(p, out) {
  const stat = fs.statSync(p);
  if (stat.isDirectory()) {
    if (SKIP_DIRS.has(path.basename(p)) || SKIP_PATHS.some((s) => path.normalize(p).endsWith(s))) return out;
    for (const name of fs.readdirSync(p)) walk(path.join(p, name), out);
  } else if (EXTS.has(path.extname(p)) && !/\.(spec|test|stories)\.ts$/.test(p)) {
    out.push(p);
  }
  return out;
}

function stripComments(line, state, ext) {
  let s = line;
  let out = '';
  while (s.length) {
    if (state.inBlock) {
      const end = s.indexOf('*/');
      if (end < 0) return out;
      state.inBlock = false;
      s = s.slice(end + 2);
      continue;
    }
    const start = s.indexOf('/*');
    const lineC = ext !== '.css' && ext !== '.html' ? s.search(/(?<![:'"])\/\//) : -1;
    if (lineC >= 0 && (start < 0 || lineC < start)) return out + s.slice(0, lineC);
    if (start < 0) return out + s;
    out += s.slice(0, start);
    state.inBlock = true;
    s = s.slice(start + 2);
  }
  return out;
}

const findings = [];
function add(file, line, col, rule, level, message) {
  findings.push({ file: file.split(path.sep).join('/'), line, col, rule, level, message });
}

for (const file of roots.flatMap((r) => walk(r, []))) {
  const ext = path.extname(file);
  const isStyle = ext === '.css' || ext === '.scss';
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const state = { inBlock: false };
  lines.forEach((raw, i) => {
    const allowed = (rule) =>
      new RegExp(`nxt-allow:[^\\n]*\\b${rule}\\b`).test(raw) || (i > 0 && new RegExp(`nxt-allow:[^\\n]*\\b${rule}\\b`).test(lines[i - 1]));
    const code = stripComments(raw, state, ext);
    if (!code.trim()) return;
    const ln = i + 1;
    if (/^\s*import\s/.test(code)) return;

    // color literals — always an error: use a semantic or component token.
    if (!allowed('color-literal')) {
      const hexRe = isStyle ? HEX_ANY : HEX_IN_CODE;
      for (const m of code.matchAll(hexRe)) add(file, ln, m.index + 1, 'color-literal', 'error', `hard-coded color ${m[0].trim()} — use var(--nxt-…) tokens`);
      const fn = code.match(COLOR_FN);
      if (fn && (isStyle || /['"`:]/.test(code))) add(file, ln, fn.index + 1, 'color-literal', 'error', `hard-coded ${fn[1]}() color — use var(--nxt-…) tokens`);
    }

    if (!isStyle && !/style|\[style|ngStyle/.test(code)) return;

    // px literals — breakpoints in @media/@container lines are allowed; 1px hairlines are allowed.
    if (!allowed('px-literal') && !/@(media|container)\b/.test(code)) {
      for (const m of code.matchAll(PX)) {
        const v = parseFloat(m[1]);
        if (v !== 0 && v !== 1) add(file, ln, m.index + 1, 'px-literal', 'warn', `literal ${m[0]} — use a space/size/radius token`);
      }
    }
    if (!allowed('z-index-literal')) {
      const z = code.match(/z-index\s*:\s*-?\d+/);
      if (z) add(file, ln, z.index + 1, 'z-index-literal', 'warn', 'numeric z-index — use var(--nxt-z-…)');
    }
    if (!allowed('font-family-literal')) {
      const f = code.match(/font-family\s*:\s*(?!\s*(var\(|inherit|initial|unset))/);
      if (f) add(file, ln, f.index + 1, 'font-family-literal', 'warn', 'raw font-family — use var(--nxt-font-family-…)');
    }
    if (!allowed('important') && code.includes('!important')) add(file, ln, code.indexOf('!important') + 1, 'important', 'warn', '!important — fix specificity with @layer instead');
    if (!allowed('ng-deep') && code.includes('::ng-deep')) add(file, ln, code.indexOf('::ng-deep') + 1, 'ng-deep', 'warn', '::ng-deep is deprecated — style through component tokens or a public class');
  });
}

const errors = findings.filter((f) => f.level === 'error').length;
const warnings = findings.length - errors;
if (asJson) {
  console.log(JSON.stringify({ roots, errors, warnings, findings }, null, 2));
} else if (!roots.length) {
  console.log('Nothing to scan (no packages/ or apps/ folder yet).');
} else {
  for (const f of findings) console.log(`${f.file}:${f.line}:${f.col}  ${f.level === 'error' ? 'ERROR' : 'WARN '}  ${f.rule}  ${f.message}`);
  console.log(`check-hardcoded: ${errors} error(s), ${warnings} warning(s) in ${roots.join(', ')}`);
}
process.exit(errors || (strict && warnings) ? 1 : 0);
