#!/usr/bin/env node
// `npm test` → `ng test ui --watch=false` (extra args are forwarded).
// On Windows, Vitest fails with "failed to find the runner" when the shell cwd is `d:\…` while modules
// resolve to `D:\…` (the runner gets loaded twice). Normalising the drive letter avoids that.
import { spawnSync } from 'node:child_process';

const cwd = process.cwd().replace(/^([a-z]):/, (_, drive) => `${drive.toUpperCase()}:`);
const result = spawnSync('npx', ['ng', 'test', 'ui', '--watch=false', ...process.argv.slice(2)], {
  cwd,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
process.exit(result.status ?? 1);
