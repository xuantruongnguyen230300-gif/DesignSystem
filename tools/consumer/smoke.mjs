#!/usr/bin/env node
// Consumer smoke test: proves a project outside this repo can install @nxt/ui + @nxt/tokens and use them.
//
//   npm run build && npm run consumer:smoke                      packed tarballs, extracted into node_modules
//   npm run build && npm run consumer:smoke -- --from-registry   the way a stranger installs them from GitHub Packages (local registry)
//   GITHUB_TOKEN=<read:packages> npm run consumer:smoke:published  the same install from the REAL GitHub Packages (latest published
//                                                                version, or NXT_VERSION=0.1.2); no build needed
//
// Default: `npm pack` both packages, extract the tarballs into a fresh Angular app's node_modules.
// --from-registry: stage the packages exactly as the publish workflow does (tools/release/stage.mjs: scoped names), serve
// them from a throw-away local registry and run the documented command with a REAL `npm install`:
//   npm install @nxt/ui@npm:@<owner>/ui @nxt/tokens@npm:@<owner>/tokens        (scope registry set in .npmrc)
// Both modes then build the app with the production builder, serve the output and open it in Chromium: the page must render
// NXT components with their styles, `provideNxt()` must have set the density attribute, the primary color must follow
// `provideNxt({ primary })` and `NxtTheme`, there must be no console errors and axe must find no WCAG A/AA violations.
// The app's other dependencies (Angular, rxjs, …) are linked from this repo's node_modules, so nothing is downloaded.

import { execFile, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import { startRegistry } from '../release/fixture-registry.mjs';
import { ownerFromRepository, stagePackages } from '../release/stage.mjs';

const repo = process.cwd();
const fromRegistry = process.argv.includes('--from-registry');
const fromPublished = process.argv.includes('--from-published');
const work = path.join(os.tmpdir(), 'nxt-consumer-smoke');
const app = path.join(work, 'app');
const tgz = path.join(work, 'tgz');
const log = (m) => console.log(`[consumer] ${m}`);
const fail = (m) => {
  console.error(`[consumer] FAIL: ${m}`);
  process.exit(1);
};

for (const p of fromPublished ? [] : ['dist/ui/package.json', 'packages/tokens/dist/css/core.css']) {
  if (!fs.existsSync(path.join(repo, p))) fail(`${p} is missing. Run npm run build first.`);
}
fs.rmSync(work, { recursive: true, force: true });
fs.mkdirSync(tgz, { recursive: true });
fs.mkdirSync(app, { recursive: true });

const win = process.platform === 'win32';
const npm = win ? 'npm.cmd' : 'npm';
const nm = path.join(app, 'node_modules');

/** Everything the app needs besides NXT (Angular, rxjs, …) is linked from this repo; what is already installed stays. */
function linkRepoModules() {
  fs.mkdirSync(path.join(nm, '@nxt'), { recursive: true });
  for (const entry of fs.readdirSync(path.join(repo, 'node_modules'))) {
    if (entry === '.bin' || entry === '@nxt') continue;
    const src = path.join(repo, 'node_modules', entry);
    if (entry.startsWith('@')) {
      fs.mkdirSync(path.join(nm, entry), { recursive: true });
      for (const sub of fs.readdirSync(src)) {
        if (!fs.existsSync(path.join(nm, entry, sub))) fs.symlinkSync(path.join(src, sub), path.join(nm, entry, sub), 'junction');
      }
    } else if (!fs.existsSync(path.join(nm, entry))) {
      fs.symlinkSync(src, path.join(nm, entry), 'junction');
    }
  }
}

if (fromRegistry || fromPublished) {
  // 1+2. install with the documented alias command, from a fixture registry (staged like the publish workflow) or from GitHub Packages
  const scope = ownerFromRepository(repo);
  if (!scope) fail('cannot read the GitHub owner from packages/tokens/package.json "repository".');
  let registry = null;
  if (fromRegistry) {
    const staged = stagePackages({ scope, root: repo, outDir: path.join(work, 'publish') });
    log(`staged ${staged.map((p) => `${p.name}@${p.version}`).join(' and ')}`);
    registry = await startRegistry([...staged.map((p) => ({ dir: p.dir })), { dir: path.join(repo, 'node_modules/tslib') }], path.join(work, 'registry'));
  } else if (!process.env.GITHUB_TOKEN) {
    fail('GITHUB_TOKEN (a token with read:packages) is required to install from GitHub Packages.');
  }
  const registryUrl = registry ? registry.url : 'https://npm.pkg.github.com/';
  fs.writeFileSync(path.join(app, 'package.json'), JSON.stringify({ name: 'consumer-smoke', version: '0.0.0', private: true }, null, 2));
  // The project's .npmrc. Published mode writes exactly what the docs tell users to write (the token comes from the environment);
  // the local registry needs no token and also serves tslib. User and global npm config are replaced, so nothing from this machine leaks in.
  fs.writeFileSync(
    path.join(app, '.npmrc'),
    registry ? `@${scope}:registry=${registry.url}\nregistry=${registry.url}\n` : `@${scope}:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}\n`,
  );
  fs.writeFileSync(path.join(work, 'empty.npmrc'), '');
  const pin = fromPublished && process.env.NXT_VERSION ? `@${process.env.NXT_VERSION}` : '';
  const command = [`@nxt/ui@npm:@${scope}/ui${pin}`, `@nxt/tokens@npm:@${scope}/tokens${pin}`];
  log(`npm install ${command.join(' ')}   (registry ${registryUrl})`);
  // Asynchronous on purpose: the registry lives in this process, a blocking call would stop it from answering npm.
  try {
    await promisify(execFile)(npm, ['install', ...command, '--ignore-scripts', '--no-audit', '--no-fund', '--legacy-peer-deps', '--loglevel=error'], {
      cwd: app,
      encoding: 'utf8',
      shell: win,
      timeout: 180_000,
      env: { ...process.env, npm_config_userconfig: path.join(app, '.npmrc'), npm_config_globalconfig: path.join(work, 'empty.npmrc'), npm_config_cache: path.join(work, 'npm-cache') },
    });
  } catch (e) {
    fail(`npm install failed:\n${(e.stdout ?? '') + (e.stderr ?? '')}`.slice(0, 3000));
  } finally {
    await registry?.close();
  }
  for (const name of ['ui', 'tokens']) {
    const real = JSON.parse(fs.readFileSync(path.join(nm, '@nxt', name, 'package.json'), 'utf8')).name;
    if (real !== `@${scope}/${name}`) fail(`node_modules/@nxt/${name} holds "${real}", expected the alias of @${scope}/${name}.`);
  }
  if (!fs.existsSync(path.join(nm, 'tslib/package.json'))) fail('the dependency tslib of @nxt/ui was not installed.');
  linkRepoModules();
} else {
  // 1. pack
  const pack = (dir) =>
    execFileSync(npm, ['pack', path.resolve(repo, dir), '--pack-destination', tgz, '--silent'], { cwd: repo, encoding: 'utf8', shell: win })
      .trim()
      .split(/\r?\n/)
      .pop();
  const uiTgz = path.join(tgz, pack('dist/ui'));
  const tokensTgz = path.join(tgz, pack('packages/tokens'));
  const kb = (f) => (fs.statSync(f).size / 1024).toFixed(0);
  log(`packed ${path.basename(uiTgz)} (${kb(uiTgz)} KB) and ${path.basename(tokensTgz)} (${kb(tokensTgz)} KB)`);

  // 2. node_modules: link everything from the repo (except @nxt), then "install" the tarballs
  linkRepoModules();
  for (const [file, name] of [
    [uiTgz, 'ui'],
    [tokensTgz, 'tokens'],
  ]) {
    const dir = path.join(nm, '@nxt', name);
    fs.mkdirSync(dir, { recursive: true });
    // A relative path: GNU tar (Git for Windows) reads "C:\…" as a remote host.
    execFileSync('tar', ['-xzf', path.relative(dir, file).split(path.sep).join('/'), '--strip-components=1'], { cwd: dir });
  }
}
const ui = JSON.parse(fs.readFileSync(path.join(nm, '@nxt/ui/package.json'), 'utf8'));
log(`installed @nxt/ui ${ui.version}${fromRegistry || fromPublished ? ` (package "${ui.name}", from ${fromPublished ? 'GitHub Packages' : 'the local registry'})` : ''}, peer @angular/core ${ui.peerDependencies?.['@angular/core']}`);

// 3. the consumer app (a few components + provideNxt)
const w = (rel, content) => {
  fs.mkdirSync(path.dirname(path.join(app, rel)), { recursive: true });
  fs.writeFileSync(path.join(app, rel), content);
};
w('package.json', JSON.stringify({ name: 'consumer-smoke', version: '0.0.0', private: true }, null, 2));
w(
  'tsconfig.json',
  JSON.stringify(
    {
      compileOnSave: false,
      compilerOptions: { strict: true, skipLibCheck: true, isolatedModules: true, experimentalDecorators: true, importHelpers: true, target: 'ES2022', module: 'preserve', moduleResolution: 'bundler' },
      angularCompilerOptions: { strictTemplates: true },
    },
    null,
    2,
  ),
);
w('tsconfig.app.json', JSON.stringify({ extends: './tsconfig.json', compilerOptions: { outDir: './out-tsc', types: [] }, files: ['src/main.ts'], include: ['src/**/*.d.ts'] }, null, 2));
w(
  'angular.json',
  JSON.stringify(
    {
      $schema: './node_modules/@angular/cli/lib/config/schema.json',
      version: 1,
      cli: { analytics: false },
      projects: {
        app: {
          projectType: 'application',
          root: '',
          sourceRoot: 'src',
          architect: {
            build: {
              builder: '@angular/build:application',
              options: { browser: 'src/main.ts', index: 'src/index.html', tsConfig: 'tsconfig.app.json', styles: ['src/styles.css'], outputPath: 'dist' },
              configurations: { production: { optimization: true } },
              defaultConfiguration: 'production',
            },
          },
        },
      },
    },
    null,
    2,
  ),
);
w('src/index.html', '<!doctype html>\n<html lang="vi">\n<head><meta charset="utf-8"><title>Consumer smoke</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>\n<body><app-root></app-root></body>\n</html>\n');
w(
  'src/styles.css',
  "@import '@nxt/tokens/css/core.css';\n@import '@nxt/ui/styles/nxt.css';\nbody { margin: 0; padding: 24px; background: var(--nxt-color-bg-canvas); color: var(--nxt-color-text-default); font: var(--nxt-typography-body-md); }\n",
);
w(
  'src/main.ts',
  `import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { NxtTheme, provideNxt } from '@nxt/ui';
import { NxtButton } from '@nxt/ui/button';
import { NxtProgress } from '@nxt/ui/progress';
import { NxtSlider } from '@nxt/ui/slider';
import { NxtStepper } from '@nxt/ui/stepper';
import { NxtTag } from '@nxt/ui/tag';

@Component({
  selector: 'app-root',
  imports: [NxtButton, NxtTag, NxtStepper, NxtSlider, NxtProgress],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <main>
      <h1>Xin chào NXT</h1>
      <p>Đã bấm {{ clicks() }} lần</p>
      <button nxtButton variant="primary" type="button" (click)="clicks.set(clicks() + 1)">Lưu hồ sơ</button>
      <button nxtButton type="button">Huỷ</button>
      <button nxtButton variant="secondary" type="button" (click)="theme.setPrimary('#0F766E')">Đổi sang xanh ngọc</button>
      <nxt-tag tone="success">Đang sử dụng</nxt-tag>
      <nxt-stepper label="Số ngày phép" [min]="0" [max]="30" [value]="12" />
      <nxt-slider label="Âm lượng" [min]="0" [max]="100" [value]="40" />
      <nxt-progress label="Tiến độ" [value]="60" />
    </main>
  \`,
})
class App {
  protected readonly clicks = signal(0);
  protected readonly theme = inject(NxtTheme);
}

bootstrapApplication(App, { providers: [provideNxt({ density: 'comfortable', primary: '#E11D48' })] }).catch((e) => console.error(e));
`,
);

// 4. build
log('building the consumer app (production)…');
const ng = path.join(repo, 'node_modules/@angular/cli/bin/ng.js');
try {
  execFileSync(process.execPath, [ng, 'build'], { cwd: app, stdio: 'pipe', encoding: 'utf8' });
} catch (e) {
  fail(`ng build failed:\n${(e.stdout ?? '') + (e.stderr ?? '')}`.slice(0, 3000));
}
const out = path.join(app, 'dist/browser');
const size = (ext) => fs.readdirSync(out).filter((f) => f.endsWith(ext)).reduce((s, f) => s + fs.statSync(path.join(out, f)).size, 0) / 1024;
log(`built: JS ${size('.js').toFixed(0)} KB, CSS ${size('.css').toFixed(0)} KB (raw)`);

// 5. serve + browser check
const server = http.createServer((req, res) => {
  let f = path.join(out, req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(out, 'index.html');
  res.setHeader('content-type', { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }[path.extname(f)] ?? 'application/octet-stream');
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const load = (rel) => import(pathToFileURL(path.join(repo, 'node_modules', rel)).href);
const { chromium } = await load('@playwright/test/index.mjs');
const axeModule = await load('@axe-core/playwright/dist/index.mjs').catch(() => load('@axe-core/playwright/dist/index.js'));
const AxeBuilder = axeModule.default ?? axeModule.AxeBuilder;
const browser = await chromium.launch();
const page = await (await browser.newContext()).newPage();
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'Lưu hồ sơ' }).click();
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const token = (name) => page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim().toUpperCase(), name);
const settled = async () => {
  await page.mouse.move(0, 0); // leave the hover state, then let the color transition finish
  await page.waitForTimeout(600);
};
const buttonBg = () => page.getByRole('button', { name: 'Lưu hồ sơ' }).evaluate((el) => getComputedStyle(el).backgroundColor);
const rgbOf = (h) => `rgb(${[1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(', ')})`;

// the scale the SHIPPED command-line tool makes for the same seeds (run from the installed package, like a product would)
const cli = (seed) => JSON.parse(execFileSync(process.execPath, [path.join(nm, '@nxt/tokens/cli/nxt-palette.mjs'), seed, '--json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
const rose = cli('#E11D48');
const teal = cli('#0F766E');

const checks = {
  'renders the heading': (await page.locator('h1').innerText()) === 'Xin chào NXT',
  'button click works (signals)': (await page.getByText('Đã bấm 1 lần').count()) === 1,
  'provideNxt set data-nxt-density': (await page.evaluate(() => document.documentElement.getAttribute('data-nxt-density'))) === 'comfortable',
  'tokens loaded (CSS variable)': (await token('--nxt-color-bg-primary')) !== '',
  'component styles applied (primary button is filled)': (await page.getByRole('button', { name: 'Lưu hồ sơ' }).evaluate((el) => getComputedStyle(el).backgroundColor)) !== 'rgba(0, 0, 0, 0)',
  'stepper is a spinbutton': (await page.getByRole('spinbutton').count()) >= 1,
  'slider has role slider': (await page.getByRole('slider').count()) >= 1,
  'no console errors': errors.length === 0,
};
const axeOf = async (label) => {
  const result = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
  checks[`axe: no WCAG A/AA violations (${label})`] = result.violations.length === 0;
  return result;
};

// provideNxt({ primary: '#E11D48' }) → the app is rose, same scale as the packaged CLI
await settled();
checks['primary: provideNxt({ primary }) sets the brand scale (= CLI output)'] = (await token('--nxt-color-brand-600')) === rose[600].toUpperCase();
checks['primary: the filled button is drawn in brand-600'] = (await buttonBg()) === rgbOf(rose[600]);
const axeRose = await axeOf('rose theme');

// NxtTheme.setPrimary() at run time → teal
await page.getByRole('button', { name: 'Đổi sang xanh ngọc' }).click();
await settled();
checks['primary: NxtTheme.setPrimary() recolors at run time (= CLI output)'] = (await token('--nxt-color-brand-600')) === teal[600].toUpperCase();
checks['primary: the filled button follows'] = (await buttonBg()) === rgbOf(teal[600]);
const axeTeal = await axeOf('after setPrimary');
const axe = { violations: [...axeRose.violations, ...axeTeal.violations] };
await browser.close();
server.close();

let ok = true;
for (const [name, pass] of Object.entries(checks)) {
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}`);
  if (!pass) ok = false;
}
if (errors.length) console.log('  console errors:', errors.slice(0, 3).join(' | '));
if (axe.violations.length) console.log('  axe:', axe.violations.map((v) => `${v.id}: ${v.nodes[0]?.target}`).join(' | '));
if (!ok) process.exit(1);
log('OK: a project outside the repo can install the packed packages, build and run them.');
