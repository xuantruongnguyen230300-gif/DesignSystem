#!/usr/bin/env node
// Prepare the built packages for GitHub Packages (after `npm run build`):
//
//   npm run release:prepare                 scope = the GitHub account in packages/tokens/package.json "repository"
//   npm run release:prepare -- --scope <owner>
//
// Writes dist/publish/ui and dist/publish/tokens (see tools/release/stage.mjs) and leaves dist/ui untouched.
// Publishing is done by .github/workflows/publish.yml when a version tag is pushed; to publish by hand:
//   npm publish dist/publish/ui   and   npm publish dist/publish/tokens

import { ownerFromRepository, stagePackages } from './stage.mjs';

const args = process.argv.slice(2);
const i = args.indexOf('--scope');
const scope = (i >= 0 ? args[i + 1] : ownerFromRepository())?.replace(/^@/, '');
if (!scope) {
  console.error('Usage: node tools/release/prepare-publish.mjs --scope <github-owner>');
  process.exit(1);
}

try {
  const staged = stagePackages({ scope });
  for (const p of staged) console.log(`${p.name}@${p.version}  ->  ${p.dir}`);
  console.log(`\nConsumers install with an alias, so code keeps importing "@nxt/*":`);
  console.log(`  npm install @nxt/ui@npm:@${scope}/ui @nxt/tokens@npm:@${scope}/tokens`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
