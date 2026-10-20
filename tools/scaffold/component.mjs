#!/usr/bin/env node
// Scaffold an NXT component (Angular 21 standalone, secondary entry point @nxt/ui/<name>).
//
// Usage: node tools/scaffold/component.mjs <kebab-name> [--attribute] [--dry-run]
//   --attribute  attribute selector on native elements (e.g. button[nxtButton]) instead of <nxt-name>
//   --dry-run    print the files that would be written
// Never overwrites: existing files are reported and skipped.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const tplDir = path.join(here, 'templates', 'component');

const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith('--'));
const dryRun = args.includes('--dry-run');
const attribute = args.includes('--attribute');

if (!name || !/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
  console.error('Usage: node tools/scaffold/component.mjs <kebab-name> [--attribute] [--dry-run]');
  process.exit(2);
}

const pascal = name.split('-').map((s) => s[0].toUpperCase() + s.slice(1)).join('');
const camel = pascal[0].toLowerCase() + pascal.slice(1);
const vars = {
  name,
  Name: pascal,
  nameCamel: camel,
  title: name.split('-').map((s) => s[0].toUpperCase() + s.slice(1)).join(' '),
  selector: attribute ? `button[nxt${pascal}], a[nxt${pascal}]` : `nxt-${name}`,
  tag: attribute ? `button nxt${pascal}` : `nxt-${name}`,
  tagClose: attribute ? 'button' : `nxt-${name}`,
  date: new Date().toISOString().slice(0, 10),
};

const plan = [
  ['ng-package.json.tpl', `packages/ui/${name}/ng-package.json`],
  ['public-api.ts.tpl', `packages/ui/${name}/public-api.ts`],
  ['component.ts.tpl', `packages/ui/${name}/src/${name}.ts`],
  ['component.css.tpl', `packages/ui/${name}/src/${name}.css`],
  ['component.spec.ts.tpl', `packages/ui/${name}/src/${name}.spec.ts`],
  ['SPEC.md.tpl', `packages/ui/${name}/SPEC.md`],
  ['tokens.json.tpl', `packages/tokens/src/component/${name}.tokens.json`],
  ['docs.md.tpl', `apps/docs/src/content/components/${name}.md`],
  ['example.ts.tpl', `apps/docs/src/examples/${name}/${name}-basic.example.ts`],
];

const render = (s) => s.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? vars[k] : m));

let written = 0;
for (const [tpl, target] of plan) {
  const file = path.resolve(target);
  if (fs.existsSync(file)) {
    console.log(`skip   ${target} (exists)`);
    continue;
  }
  const content = render(fs.readFileSync(path.join(tplDir, tpl), 'utf8'));
  if (dryRun) {
    console.log(`would  ${target}`);
    continue;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  console.log(`create ${target}`);
  written++;
}
if (!dryRun) {
  console.log(`\n${written} file(s) written. Next: fill SPEC.md first (skill nxt-component-spec), then implement (nxt-component-build).`);
}
