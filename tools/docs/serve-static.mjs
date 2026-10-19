#!/usr/bin/env node
// Minimal static server with SPA fallback for the built docs (Playwright + local preview).
// Usage: node tools/docs/serve-static.mjs [dir=dist/docs/browser] [port=4300]
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? 'dist/docs/browser');
const port = Number(process.argv[3] ?? 4300);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

if (!fs.existsSync(path.join(root, 'index.html'))) {
  console.error(`No index.html in ${root} — run: npm run build`);
  process.exit(1);
}

http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
    let file = path.join(root, path.normalize(urlPath).replace(/^([/\\])+/, ''));
    if (!file.startsWith(root)) {
      res.writeHead(403).end();
      return;
    }
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      // Unknown asset → 404; unknown route → SPA index.html.
      if (path.extname(urlPath)) {
        res.writeHead(404).end('Not found');
        return;
      }
      file = path.join(root, 'index.html');
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, () => console.log(`docs: http://localhost:${port}  (${path.relative(process.cwd(), root)})`));
