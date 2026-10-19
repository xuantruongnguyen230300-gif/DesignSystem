#!/usr/bin/env node
// Generate docs-site data from sources (run before `ng build docs` / `ng serve docs`).
//   content/**/*.md         → generated/content.ts  (page metadata + TOC) + generated/pages/** (lazy HTML segments;
//                             markdown rendered at build time)
//   examples/**/*.example.ts → generated/examples.ts (lazy loaders + source) + examples.json (for Playwright)
//   packages/ui/<entry>/src → generated/api.ts       (inputs/outputs extracted from source — never hand-written)
//   + generated/public/llms.txt and raw markdown for AI agents
//
// Usage: node tools/docs/generate.mjs [--watch]
// Fails (exit 1) when a page references an example/API entry that does not exist.

import fs from 'node:fs';
import path from 'node:path';
import { Marked } from 'marked';

const DOCS = 'apps/docs/src';
const CONTENT = `${DOCS}/content`;
const EXAMPLES = `${DOCS}/examples`;
const OUT = `${DOCS}/generated`;
const UI = 'packages/ui';
const SECTIONS = {
  'getting-started': { title: 'Bắt đầu', order: 1 },
  foundations: { title: 'Nền tảng', order: 2 },
  components: { title: 'Components', order: 3 },
  templates: { title: 'Mẫu màn hình', order: 4 },
  patterns: { title: 'Patterns', order: 5 },
};

const list = (dir, test) =>
  !fs.existsSync(dir)
    ? []
    : fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
        const p = path.join(dir, d.name);
        return d.isDirectory() ? list(p, test) : test(d.name) ? [p] : [];
      });
const posix = (p) => p.split(path.sep).join('/');

export function slugify(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: src };
  const data = {};
  let key = null;
  const unquote = (v) => v.replace(/^["'](.*)["']$/, '$1');
  for (const line of m[1].split(/\r?\n/)) {
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && key) {
      (data[key] = Array.isArray(data[key]) ? data[key] : []).push(unquote(item[1].trim()));
      continue;
    }
    const kv = line.match(/^([\w-]+):\s*(.*?)\s*(?:\s#.*)?$/);
    if (kv) {
      key = kv[1];
      data[key] = kv[2] === '' ? [] : unquote(kv[2]);
    }
  }
  return { data, body: src.slice(m[0].length) };
}

// ---------- examples ----------
function collectExamples() {
  const examples = {};
  for (const file of list(EXAMPLES, (n) => n.endsWith('.example.ts'))) {
    const src = fs.readFileSync(file, 'utf8');
    const id = path.basename(file).replace(/\.example\.ts$/, '');
    const cls = src.match(/export class (\w+)/)?.[1];
    if (!cls) throw new Error(`${posix(file)}: no exported class`);
    // Last JSDoc block directly above @Component (tempered: never spans across another */).
    const doc = src.match(/\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*@Component/)?.[1] ?? '';
    const title = doc.split('\n')[0].replace(/^\s*\*?\s*/, '').trim() || id;
    examples[id] = { id, cls, title, file: posix(path.relative(OUT, file)).replace(/\.ts$/, ''), source: src.trimEnd() };
  }
  return examples;
}

// ---------- API ----------
function splitTopLevel(s) {
  const out = [];
  let depth = 0;
  let cur = '';
  for (const ch of s) {
    if ('<({['.includes(ch)) depth++;
    if ('>)}]'.includes(ch)) depth--;
    if (ch === ',' && depth === 0) {
      out.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function collectApi() {
  const api = {};
  if (!fs.existsSync(UI)) return api;
  for (const entry of fs.readdirSync(UI)) {
    const srcDir = path.join(UI, entry, 'src');
    if (!fs.existsSync(path.join(UI, entry, 'public-api.ts')) || !fs.existsSync(srcDir)) continue;
    const docs = [];
    for (const file of list(srcDir, (n) => n.endsWith('.ts') && !n.endsWith('.spec.ts'))) {
      const src = fs.readFileSync(file, 'utf8');
      const aliases = {};
      for (const m of src.matchAll(/export type (\w+)\s*=\s*([^;]+);/g)) aliases[m[1]] = m[2].replace(/\s+/g, ' ').trim();
      // The decorator may be one line (`@Directive({ selector: '[x]' })`) and the class may implement/extend.
      const classRe =
        /(?:\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*)?@(Component|Directive)\(\{((?:(?!@(?:Component|Directive)\()[\s\S])*?)\}\)\s*(export )?class (\w+)[^{]*\{(?:\}|([\s\S]*?)\n\})/g;
      for (const m of src.matchAll(classRe)) {
        const [, jsdoc, kind, meta, exported, name, body = ''] = m;
        if (!exported) continue;
        const selector = meta.match(/selector:\s*'([^']+)'/)?.[1] ?? '';
        const members = [];
        // Inputs forwarded from a host directive: hostDirectives: [{ directive: CdkMenuTrigger, inputs: ['cdkMenuTriggerFor: nxtMenuTriggerFor'] }]
        for (const hd of meta.matchAll(/directive:\s*(\w+),\s*inputs:\s*\[([^\]]*)\]/g)) {
          for (const spec of hd[2].matchAll(/'([^']+)'/g)) {
            const [inner, outer = inner] = spec[1].split(':').map((s) => s.trim());
            members.push({ kind: 'input', name: outer, type: '', default: '', description: `Chuyển tiếp tới \`${hd[1]}.${inner}\`.` });
          }
        }
        const memberRe = /(?:\/\*\*\s*([\s\S]*?)\s*\*\/\s*)?readonly (\w+) = (input|model|output)(\.required)?(?:<([\s\S]*?)>)?\(([^;]*)\);/g;
        for (const mm of body.matchAll(memberRe)) {
          const [, mdoc, propName, fn, required, typeArg, argStr] = mm;
          const args = splitTopLevel(argStr);
          // Templates use the alias (`[(nxtSort)]`), not the class property name.
          const mname = argStr.match(/alias:\s*'([^']+)'/)?.[1] ?? propName;
          const isBool = /booleanAttribute/.test(argStr);
          const isNumber = /numberAttribute/.test(argStr);
          const literal = args[0] ?? '';
          const inferred = /^(true|false)$/.test(literal) ? 'boolean' : /^-?\d/.test(literal) ? 'number' : /^['"`]/.test(literal) ? 'string' : '';
          let type = typeArg ? typeArg.replace(/\s+/g, ' ').trim() : isBool ? 'boolean' : isNumber ? 'number' : inferred;
          type = type
            .split('|')
            .map((t) => aliases[t.trim()] ?? t.trim())
            .join(' | ');
          members.push({
            kind: fn === 'output' ? 'output' : fn === 'model' ? 'model' : 'input',
            name: mname,
            type,
            default: required ? '(bắt buộc)' : fn === 'output' || /^\{\s*(alias|transform)\b/.test(literal) ? '' : literal,
            description: (mdoc ?? '').replace(/\s*\n\s*\*\s?/g, ' ').trim(),
          });
        }
        const description = (jsdoc ?? '')
          .split('\n')
          .map((l) => l.replace(/^\s*\*\s?/, ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        docs.push({ name, kind: kind.toLowerCase(), selector, description, members });
      }
    }
    api[entry] = { entry, importPath: `@nxt/ui/${entry}`, classes: docs };
  }
  return api;
}

// ---------- content ----------
const DIRECTIVE_RE = /^::(example|tokens|api)\{([^}]+)\}\s*$/;

function renderMarkdown(md, toc, usedIds) {
  const marked = new Marked({
    gfm: true,
    renderer: {
      heading(token) {
        const inner = this.parser.parseInline(token.tokens);
        const plain = inner.replace(/<[^>]+>/g, '');
        let id = slugify(plain) || 'muc';
        while (usedIds.has(id)) id += '-2';
        usedIds.add(id);
        if (token.depth === 2) toc.push({ id, text: plain });
        return `<h${token.depth} id="${id}">${inner}</h${token.depth}>\n`;
      },
    },
  });
  return marked
    .parse(md)
    .replace(/<table>/g, '<div class="docs-table" role="region" aria-label="Bảng" tabindex="0"><table>')
    .replace(/<\/table>/g, '</table></div>')
    // Code blocks scroll horizontally — keyboard users must be able to reach them (WCAG 2.1.1).
    .replace(/<pre>/g, '<pre tabindex="0">');
}

function collectPages(examples, api) {
  const pages = [];
  const problems = [];
  for (const file of list(CONTENT, (n) => n.endsWith('.md'))) {
    const rel = posix(path.relative(CONTENT, file));
    const [section, name] = rel.split('/');
    if (!SECTIONS[section] || !name) {
      problems.push(`${rel}: content must live in ${Object.keys(SECTIONS).join(', ')}/<slug>.md`);
      continue;
    }
    const raw = fs.readFileSync(file, 'utf8');
    const { data, body } = parseFrontmatter(raw);
    const slug = name.replace(/\.md$/, '');
    const titleFromH1 = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
    const bodyNoH1 = body.replace(/^#\s+.+\r?\n/m, '');
    const toc = [];
    const usedIds = new Set();
    const segments = [];
    let buffer = [];
    const flush = () => {
      const md = buffer.join('\n').trim();
      if (md) segments.push({ kind: 'html', html: renderMarkdown(md, toc, usedIds) });
      buffer = [];
    };
    for (const line of bodyNoH1.split(/\r?\n/)) {
      const d = line.match(DIRECTIVE_RE);
      if (!d) {
        buffer.push(line);
        continue;
      }
      flush();
      const [, kind, arg] = d;
      if (kind === 'example' && !examples[arg]) problems.push(`${rel}: ::example{${arg}} — no apps/docs/src/examples/**/${arg}.example.ts`);
      if (kind === 'api' && !api[arg]) problems.push(`${rel}: ::api{${arg}} — no packages/ui/${arg}/public-api.ts`);
      segments.push(kind === 'example' ? { kind, id: arg } : kind === 'api' ? { kind, entry: arg } : { kind, prefix: arg });
    }
    flush();
    pages.push({
      section,
      sectionTitle: SECTIONS[section].title,
      slug,
      path: `/${section}/${slug}`,
      title: data.title || titleFromH1 || slug,
      description: data.description || '',
      status: data.status || null,
      group: data.group || null,
      order: Number(data.order ?? 100),
      package: data.package || null,
      keywords: Array.isArray(data.keywords) ? data.keywords : data.keywords ? String(data.keywords).split(/,\s*/) : [],
      segments,
      toc,
      raw,
    });
  }
  pages.sort((a, b) => SECTIONS[a.section].order - SECTIONS[b.section].order || a.order - b.order || a.title.localeCompare(b.title, 'vi'));
  return { pages, problems };
}

// ---------- write ----------
function writeIfChanged(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === content) return false;
  fs.writeFileSync(file, content);
  return true;
}

function generate() {
  const examples = collectExamples();
  const api = collectApi();
  const { pages, problems } = collectPages(examples, api);
  if (problems.length) {
    for (const p of problems) console.error(`docs: ${p}`);
    return false;
  }
  const header = '// GENERATED by tools/docs/generate.mjs — do not edit.\n';
  // Page metadata (nav, search, TOC) ships in the initial bundle; each page's rendered body is a lazy chunk,
  // so adding pages does not grow first load.
  const pagesTs = pages.map(({ raw, segments, ...p }) => p);
  const bodyFile = (p) => `pages/${p.section}/${p.slug}`;
  const loaders = pages
    .map((p) => `  ${JSON.stringify(p.path)}: () => import('./${bodyFile(p)}').then((m) => m.SEGMENTS),`)
    .join('\n');
  let changed = 0;
  changed += writeIfChanged(
    `${OUT}/content.ts`,
    `${header}import type { DocPage, DocSegment } from '../app/core/types';\n\nexport const PAGES: DocPage[] = ${JSON.stringify(pagesTs, null, 1)};\n\nexport const PAGE_CONTENT: Record<string, () => Promise<DocSegment[]>> = {\n${loaders}\n};\n`,
  );
  const bodyFiles = new Set(pages.map((p) => path.normalize(`${OUT}/${bodyFile(p)}.ts`)));
  for (const p of pages) {
    changed += writeIfChanged(
      `${OUT}/${bodyFile(p)}.ts`,
      `${header}import type { DocSegment } from '../../../app/core/types';\n\nexport const SEGMENTS: DocSegment[] = ${JSON.stringify(p.segments, null, 1)};\n`,
    );
  }
  for (const stale of list(`${OUT}/pages`, (n) => n.endsWith('.ts'))) {
    if (!bodyFiles.has(path.normalize(stale))) fs.rmSync(stale);
  }
  const exEntries = Object.values(examples)
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(
      (e) =>
        `  ${JSON.stringify(e.id)}: {\n    id: ${JSON.stringify(e.id)},\n    title: ${JSON.stringify(e.title)},\n    source: ${JSON.stringify(e.source)},\n    load: () => import('./${e.file}').then((m) => m.${e.cls}),\n  },`,
    )
    .join('\n');
  changed += writeIfChanged(
    `${OUT}/examples.ts`,
    `${header}import type { ExampleEntry } from '../app/core/types';\n\nexport const EXAMPLES: Record<string, ExampleEntry> = {\n${exEntries}\n};\n`,
  );
  const brandsDir = "packages/tokens/src/brands";
  const brands = fs.existsSync(brandsDir) ? fs.readdirSync(brandsDir).filter((d) => fs.statSync(path.join(brandsDir, d)).isDirectory()).sort() : [];
  changed += writeIfChanged(`${OUT}/brands.ts`, `${header}export const BRANDS: string[] = ${JSON.stringify(brands)};
`);
  // Numbers shown on the home page and in the header — derived, never typed by hand.
  const tokensJson = 'packages/tokens/dist/json/tokens.json';
  const tokenData = fs.existsSync(tokensJson) ? JSON.parse(fs.readFileSync(tokensJson, 'utf8')) : { tokens: [], contrast: [] };
  const stats = {
    version: JSON.parse(fs.readFileSync(`${UI}/package.json`, 'utf8')).version,
    pages: pages.length,
    entries: Object.keys(api).length,
    tokens: tokenData.tokens.length,
    contrastChecks: tokenData.contrast.length,
  };
  changed += writeIfChanged(`${OUT}/stats.ts`, `${header}export const STATS = ${JSON.stringify(stats, null, 1)};\n`);
  changed += writeIfChanged(`${OUT}/examples.json`, `${JSON.stringify(Object.keys(examples).sort(), null, 2)}\n`);
  changed += writeIfChanged(`${OUT}/pages.json`, `${JSON.stringify(['/', '/roadmap', ...pages.map((p) => p.path)], null, 2)}\n`);
  changed += writeIfChanged(
    `${OUT}/api.ts`,
    `${header}import type { ApiEntry } from '../app/core/types';\n\nexport const API: Record<string, ApiEntry> = ${JSON.stringify(api, null, 1)};\n`,
  );
  const llms = [
    '# NXT Design',
    '',
    '> Design system đa sản phẩm cho phần mềm nghiệp vụ: Angular 21 + CDK, token W3C DTCG (--nxt-*), tiếng Việt là ngôn ngữ chính.',
    '',
    ...Object.entries(SECTIONS).flatMap(([key, s]) => {
      const items = pages.filter((p) => p.section === key);
      if (!items.length) return [];
      return [
        `## ${s.title}`,
        '',
        ...items.map((p) => `- [${p.title}](${p.path}.md): ${p.description}${p.package ? ` · import '${p.package}'` : ''}`),
        '',
      ];
    }),
  ].join('\n');
  changed += writeIfChanged(`${OUT}/public/llms.txt`, `${llms}\n`);
  for (const p of pages) changed += writeIfChanged(`${OUT}/public${p.path}.md`, p.raw);
  console.log(`docs: ${pages.length} pages · ${Object.keys(examples).length} examples · ${Object.keys(api).length} API entries · ${changed} file(s) updated`);
  return true;
}

const ok = generate();
if (process.argv.includes('--watch')) {
  let timer = null;
  const rerun = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        generate();
      } catch (e) {
        console.error(`docs: ${e.message}`);
      }
    }, 150);
  };
  // Only files that change generated output: content markdown, example/component sources (not specs/tests).
  const relevant = (dir, f) =>
    dir === CONTENT ? /\.md$/.test(f) : /\.ts$/.test(f) && !/\.(spec|test)\.ts$/.test(f) && !f.includes('generated');
  for (const dir of [CONTENT, EXAMPLES, UI]) {
    if (fs.existsSync(dir)) fs.watch(dir, { recursive: true }, (_e, f) => f && relevant(dir, String(f)) && rerun());
  }
  console.log('docs: watching content/, examples/ and packages/ui/ …');
} else if (!ok) {
  process.exit(1);
}
