#!/usr/bin/env node
// Local docs dev loop: build tokens, generate docs data in watch mode, run `ng serve docs`.
// Usage: npm start   (extra args are passed to ng serve, e.g. npm start -- --port 4300)
import { spawn, spawnSync } from 'node:child_process';

const run = (cmd, args) => spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' });
if (run('node', ['tools/tokens/build.mjs']).status !== 0) process.exit(1);

const children = [
  spawn('node', ['tools/docs/generate.mjs', '--watch'], { stdio: 'inherit' }),
  spawn('npx', ['ng', 'serve', 'docs', ...process.argv.slice(2)], { stdio: 'inherit', shell: process.platform === 'win32' }),
];
const stop = () => children.forEach((c) => c.kill());
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
children.forEach((c) => c.on('exit', (code) => {
  stop();
  process.exit(code ?? 0);
}));
