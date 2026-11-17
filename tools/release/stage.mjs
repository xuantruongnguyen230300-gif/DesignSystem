// Stages the built packages for GitHub Packages: copies them to dist/publish/{ui,tokens} and rewrites ONLY the copies.
// The sources and the build output (dist/ui) are never modified. Shared by `release:prepare` and `consumer:smoke --from-registry`,
// so what the smoke test installs is exactly what gets published.
//
// GitHub Packages requires the npm scope to equal the owning account, so the published names are `@<owner>/ui` and
// `@<owner>/tokens`. The built code keeps importing itself as `@nxt/ui/<entry>` (39 files do), therefore consumers install
// with an npm alias that keeps the `@nxt/*` name in node_modules:
//     npm install @nxt/ui@npm:@<owner>/ui @nxt/tokens@npm:@<owner>/tokens
// Renaming the package alone would break those internal imports, which is why aliasing (not path mapping) is the supported route.

import fs from 'node:fs';
import path from 'node:path';

export const REGISTRY = 'https://npm.pkg.github.com';

/** The GitHub account that owns the repo, read from `repository.url` in packages/tokens/package.json. Lowercase, like npm scopes. */
export function ownerFromRepository(root = process.cwd()) {
  const url = JSON.parse(fs.readFileSync(path.join(root, 'packages/tokens/package.json'), 'utf8')).repository?.url ?? '';
  return url.match(/github\.com[/:]([^/]+)\//i)?.[1].toLowerCase();
}

const TOKENS_ENTRIES = ['dist', 'src', 'cli', 'tokens.config.json', 'README.md', 'package.json'];

/**
 * @param {{ scope: string, root?: string, outDir?: string }} options
 * @returns {{ name: string, version: string, dir: string }[]} the staged packages (ui first, then tokens)
 */
export function stagePackages({ scope, root = process.cwd(), outDir = path.join(root, 'dist/publish') }) {
  const rename = (name) => (name.startsWith('@nxt/') ? `@${scope}/${name.slice('@nxt/'.length)}` : name);
  const license = path.join(root, 'LICENSE');
  const notice = path.join(root, 'NOTICE');
  if (!fs.existsSync(license)) throw new Error('LICENSE is missing at the repo root.');
  if (!fs.existsSync(notice)) throw new Error('NOTICE is missing at the repo root (third-party licenses: Tabler Icons).');
  if (!fs.existsSync(path.join(root, 'dist/ui/package.json'))) throw new Error('dist/ui is missing. Run npm run build first.');
  if (!fs.existsSync(path.join(root, 'packages/tokens/dist'))) throw new Error('packages/tokens/dist is missing. Run npm run build first.');

  fs.rmSync(outDir, { recursive: true, force: true });
  const staged = [];
  for (const { from, to, only } of [
    { from: 'dist/ui', to: 'ui', only: null },
    { from: 'packages/tokens', to: 'tokens', only: TOKENS_ENTRIES },
  ]) {
    const out = path.join(outDir, to);
    fs.mkdirSync(out, { recursive: true });
    if (only) {
      for (const entry of only) {
        const src = path.join(root, from, entry);
        if (fs.existsSync(src)) fs.cpSync(src, path.join(out, entry), { recursive: true });
      }
    } else {
      fs.cpSync(path.join(root, from), out, { recursive: true });
    }
    fs.copyFileSync(license, path.join(out, 'LICENSE'));
    if (to === 'ui') fs.copyFileSync(notice, path.join(out, 'NOTICE')); // the icon path data in @nxt/ui/icon is Tabler Icons (MIT)

    const file = path.join(out, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!pkg.name.startsWith('@nxt/')) throw new Error(`${from}/package.json is already named "${pkg.name}". Rebuild before staging.`);
    pkg.name = rename(pkg.name);
    for (const field of ['dependencies', 'peerDependencies']) {
      if (pkg[field]) pkg[field] = Object.fromEntries(Object.entries(pkg[field]).map(([k, v]) => [rename(k), v]));
    }
    // @nxt/ui only needs the tokens as CSS that the app imports itself. An optional peer never auto-installs a second copy
    // of the tokens (npm would otherwise fetch `@<owner>/tokens` next to the `@nxt/tokens` alias).
    const ownPeers = Object.keys(pkg.peerDependencies ?? {}).filter((k) => k.startsWith(`@${scope}/`));
    if (ownPeers.length) pkg.peerDependenciesMeta = { ...pkg.peerDependenciesMeta, ...Object.fromEntries(ownPeers.map((k) => [k, { optional: true }])) };
    pkg.publishConfig = { ...pkg.publishConfig, registry: REGISTRY };
    fs.writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`);
    staged.push({ name: pkg.name, version: pkg.version, dir: out });
  }
  return staged;
}
