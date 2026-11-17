#!/usr/bin/env node
// Versions must agree before anything is published. The two packages release together, so this checks that
//   packages/ui and packages/tokens have the same version, NXT_UI_VERSION says the same,
//   the ui → tokens peer range accepts that tokens version, CHANGELOG.md has a heading for it,
//   and (when a tag is given) the tag is exactly v<version>.
//
//   node tools/release/check-version.mjs [v0.1.0]      npm run release:check -- v0.1.0

import fs from 'node:fs';

const json = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const ui = json('packages/ui/package.json');
const tokens = json('packages/tokens/package.json');
const constant = fs.readFileSync('packages/ui/src/public-api.ts', 'utf8').match(/NXT_UI_VERSION\s*=\s*'([^']+)'/)?.[1];
const changelog = fs.existsSync('CHANGELOG.md') ? fs.readFileSync('CHANGELOG.md', 'utf8') : '';
const tag = process.argv[2];

const parse = (v) => v.split('-')[0].split('.').map(Number);
const cmp = (a, b) => a.reduce((d, x, i) => d || x - b[i], 0);
/** `^x.y.z` the way npm reads it: below the next left-most non-zero part. */
function satisfiesCaret(version, range) {
  const m = range.match(/^\^(\d+\.\d+\.\d+)/);
  if (!m) return false;
  const base = parse(m[1]);
  const v = parse(version);
  const upper = base[0] > 0 ? [base[0] + 1, 0, 0] : base[1] > 0 ? [0, base[1] + 1, 0] : [0, 0, base[2] + 1];
  return cmp(v, base) >= 0 && cmp(v, upper) < 0;
}

const problems = [];
if (ui.version !== tokens.version) problems.push(`packages/ui is ${ui.version} but packages/tokens is ${tokens.version}; they release together.`);
if (constant !== ui.version) problems.push(`NXT_UI_VERSION in packages/ui/src/public-api.ts is "${constant}", package is ${ui.version}.`);
const peer = ui.peerDependencies?.['@nxt/tokens'];
if (!peer || !satisfiesCaret(tokens.version, peer)) problems.push(`the ui peer range for @nxt/tokens ("${peer}") does not accept tokens ${tokens.version}.`);
if (!new RegExp(`^## \\[?${ui.version.replace(/\./g, '\\.')}\\]?`, 'm').test(changelog)) problems.push(`CHANGELOG.md has no "## ${ui.version}" heading.`);
if (tag && tag !== `v${ui.version}`) problems.push(`the tag is ${tag} but the packages are ${ui.version} (expected v${ui.version}).`);

if (problems.length) {
  for (const p of problems) console.error(`release:check  ${p}`);
  process.exit(1);
}
console.log(`release:check  OK: ui ${ui.version} = tokens ${tokens.version} = NXT_UI_VERSION${tag ? `, tag ${tag}` : ''}, peer ${peer}, CHANGELOG has ${ui.version}.`);
