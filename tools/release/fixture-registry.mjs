// A tiny npm registry for tests: serves a few packed packages over HTTP so a REAL `npm install` (aliases, scoped registry,
// tarball integrity, dependency resolution) can run without network access and without publishing anything.
//
//   const registry = await startRegistry([{ dir: 'dist/publish/ui' }, { dir: 'node_modules/tslib' }], workDir);
//   registry.url      → 'http://127.0.0.1:<port>/'
//   await registry.close();
//
// It only implements what `npm install` needs: the package document (GET /<name>, with `/` of scopes encoded as %2f)
// and the tarball (GET /-/<file>).

import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const win = process.platform === 'win32';

/** @param {{ dir: string }[]} packages folders containing a package.json  @param {string} workDir where the tarballs are written */
export async function startRegistry(packages, workDir) {
  fs.mkdirSync(workDir, { recursive: true });
  const docs = new Map(); // name -> package document
  const files = new Map(); // tarball file name -> absolute path
  let origin = '';

  for (const { dir } of packages) {
    const abs = path.resolve(dir);
    const manifest = JSON.parse(fs.readFileSync(path.join(abs, 'package.json'), 'utf8'));
    // `npm pack <abs path>` (a bare folder name would be read as a GitHub shorthand).
    const out = execFileSync(win ? 'npm.cmd' : 'npm', ['pack', abs, '--pack-destination', workDir, '--silent'], { encoding: 'utf8', shell: win })
      .trim()
      .split(/\r?\n/)
      .pop();
    const tgz = path.join(workDir, out);
    const bytes = fs.readFileSync(tgz);
    files.set(out, tgz);
    docs.set(manifest.name, {
      manifest,
      file: out,
      integrity: `sha512-${crypto.createHash('sha512').update(bytes).digest('base64')}`,
      shasum: crypto.createHash('sha1').update(bytes).digest('hex'),
    });
  }

  const packument = (name) => {
    const d = docs.get(name);
    return {
      _id: name,
      name,
      'dist-tags': { latest: d.manifest.version },
      versions: {
        [d.manifest.version]: {
          ...d.manifest,
          _id: `${name}@${d.manifest.version}`,
          dist: { tarball: `${origin}-/${d.file}`, integrity: d.integrity, shasum: d.shasum },
        },
      },
    };
  };

  const server = http.createServer((req, res) => {
    const target = decodeURIComponent((req.url ?? '/').split('?')[0].slice(1));
    if (target.startsWith('-/') && files.has(target.slice(2))) {
      res.setHeader('content-type', 'application/octet-stream');
      fs.createReadStream(files.get(target.slice(2))).pipe(res);
    } else if (docs.has(target)) {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify(packument(target)));
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: `not found: ${target}` }));
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}/`;
  return { url: origin, close: () => new Promise((resolve) => server.close(resolve)) };
}
