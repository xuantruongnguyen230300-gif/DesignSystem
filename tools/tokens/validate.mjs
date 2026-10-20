#!/usr/bin/env node
// NXT token validator — checks W3C DTCG token sources against docs/design/token-architecture.md.
//
// Usage: node tools/tokens/validate.mjs [--root packages/tokens] [--json] [--strict]
//   --root    token package folder (contains tokens.config.json and src/)
//   --json    machine-readable output
//   --strict  treat warnings as errors (exit 1)
//
// Exit code: 0 = clean, 1 = errors (or warnings with --strict), 2 = bad invocation.

import { analyze, rel } from '../lib/tokens.mjs';

const args = process.argv.slice(2);
const opt = (n, d) => {
  const i = args.indexOf(n);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};

let result;
try {
  result = analyze(opt('--root', 'packages/tokens'));
} catch (e) {
  console.error(`Cannot analyze tokens: ${e.message}`);
  process.exit(2);
}
const { summary, problems, contrast, files, srcDir } = result;

if (args.includes('--json')) {
  console.log(JSON.stringify({ summary, problems: problems.map((p) => ({ ...p, file: p.file && rel(p.file) })), contrast }, null, 2));
} else if (!files.length) {
  console.log(`No token files found under ${rel(srcDir)} — nothing to validate.`);
} else {
  console.log(`NXT tokens: ${summary.tokens} tokens in ${summary.files} files · ${summary.contexts.length} context(s) · config: ${summary.config}`);
  for (const p of problems) {
    console.log(`${p.level === 'error' ? 'ERROR' : 'WARN '}  ${p.where}  ${p.message}${p.file ? `  (${rel(p.file)})` : ''}`);
  }
  const failed = contrast.filter((c) => !c.ok).length;
  if (contrast.length) console.log(`Contrast: ${contrast.length - failed}/${contrast.length} checks pass`);
  console.log(`Result: ${summary.errors} error(s), ${summary.warnings} warning(s)`);
}

process.exit(summary.errors || (args.includes('--strict') && summary.warnings) ? 1 : 0);
