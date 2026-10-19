#!/usr/bin/env node
// Claude Code PostToolUse hook (Edit|Write|MultiEdit) — configured in .claude/settings.json.
// Checks the file Claude just edited:
//   packages/ or apps/ *.css|scss|html|ts  → tools/lint/check-hardcoded.mjs
//   packages/tokens/src/**.json, tokens.config.json → tools/tokens/validate.mjs
// Errors   → exit 2 with findings on stderr (Claude sees them and must fix).
// Warnings → JSON additionalContext (Claude is informed, nothing blocks).
// Anything else, or a hook-internal problem → exit 0 silently (never break editing).

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

let payload = {};
try {
  payload = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
} catch {
  process.exit(0);
}

const file = payload.tool_input?.file_path ?? payload.tool_response?.filePath;
if (!file) process.exit(0);
const rel = path.relative(repo, path.resolve(repo, file)).split(path.sep).join('/');
if (rel.startsWith('..')) process.exit(0);

const run = (script, args) =>
  spawnSync(process.execPath, [path.join(repo, script), ...args], { cwd: repo, encoding: 'utf8' });

let result = null;
let label = '';
if (/^packages\/tokens\/(src\/.+\.json|tokens\.config\.json)$/.test(rel)) {
  result = run('tools/tokens/validate.mjs', ['--root', 'packages/tokens']);
  label = 'token validator (npm run ds:tokens)';
} else if (/^(packages|apps)\/.+\.(css|scss|html|ts)$/.test(rel) && !/\.(spec|test)\.ts$/.test(rel) && !rel.includes('/generated/')) {
  result = run('tools/lint/check-hardcoded.mjs', [rel]);
  label = 'hard-coded value detector (npm run ds:hardcoded)';
}
if (!result || result.error) process.exit(0);

const out = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
const findings = out.split('\n').filter((l) => /\b(ERROR|WARN)\b/.test(l));

if (result.status === 1) {
  process.stderr.write(
    `NXT ${label} failed for ${rel}:\n${findings.join('\n')}\n` +
      'Fix these before continuing (see docs/design/token-architecture.md and principles.md). ' +
      'A justified exception needs a "nxt-allow: <rule>" comment on that line.\n',
  );
  process.exit(2);
}

const warnings = findings.filter((l) => /\bWARN\b/.test(l));
if (warnings.length) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext: `NXT ${label} — warnings in ${rel}:\n${warnings.join('\n')}`,
      },
    }),
  );
}
process.exit(0);
