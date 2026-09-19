#!/usr/bin/env node
// Build guard for on-page SEO basics. Scans every built HTML page and fails
// the build (exit 1) when an INDEXABLE page (no robots noindex) has:
//   - zero or more than one <h1>
//   - a <title> shared with another indexable page
//   - a meta description shared with another indexable page
//   - a <title> over 65 chars or a description over 160 chars
// Prints counts on every build. Usage: node scripts/check-seo-meta.mjs [--count]
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const TITLE_MAX = 65, DESC_MAX = 160;
const countOnly = process.argv.includes('--count');

// Known length debt on templates not yet reworked (see the JSON's _comment).
// Exact path "/" matches only the homepage; other entries match as prefixes.
const allowlistFile = join(process.cwd(), 'scripts/seo-meta-allowlist.json');
const lengthExempt = existsSync(allowlistFile) ? JSON.parse(readFileSync(allowlistFile, 'utf8')).lengthExempt ?? [] : [];
const isLengthExempt = (path) => lengthExempt.some((p) => (p === '/' ? path === '/' : path.startsWith(p)));

function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* htmlFiles(p);
    else if (name.endsWith('.html')) yield p;
  }
}
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];

const pages = [];
for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, 'utf8');
  const head = html.slice(0, html.indexOf('</head>') + 7);
  const robots = [...head.matchAll(/<meta\s[^>]*name="robots"[^>]*>/g)].map((m) => attr(m[0], 'content') ?? '');
  const noindex = robots.some((c) => /noindex/i.test(c));
  const title = decode(head.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
  const descTag = [...head.matchAll(/<meta\s[^>]*name="description"[^>]*>/g)][0]?.[0];
  const description = decode(descTag ? attr(descTag, 'content') ?? '' : '');
  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  pages.push({ path: '/' + relative(DIST, file).replace(/index\.html$/, ''), noindex, title, description, h1s });
}

const indexable = pages.filter((p) => !p.noindex);
const problems = [];
const exempted = [];
const lengthIssue = (p, msg) => (isLengthExempt(p.path) ? exempted : problems).push(msg);
const groupBy = (key) => {
  const m = new Map();
  for (const p of indexable) { const k = p[key]; if (!m.has(k)) m.set(k, []); m.get(k).push(p.path); }
  return m;
};
for (const p of indexable) {
  if (p.h1s !== 1) problems.push(`${p.path}  h1 count = ${p.h1s}`);
  if (!p.title) problems.push(`${p.path}  missing <title>`);
  if (p.title.length > TITLE_MAX) lengthIssue(p, `${p.path}  title ${p.title.length} chars > ${TITLE_MAX}: "${p.title}"`);
  if (!p.description) problems.push(`${p.path}  missing meta description`);
  if (p.description.length > DESC_MAX) lengthIssue(p, `${p.path}  description ${p.description.length} chars > ${DESC_MAX}`);
}
const dupTitles = [...groupBy('title')].filter(([k, v]) => k && v.length > 1);
const dupDescs = [...groupBy('description')].filter(([k, v]) => k && v.length > 1);
for (const [t, paths] of dupTitles) problems.push(`duplicate title "${t}" on ${paths.length} pages: ${paths.slice(0, 3).join(', ')}${paths.length > 3 ? ', …' : ''}`);
for (const [d, paths] of dupDescs) problems.push(`duplicate description "${d.slice(0, 60)}…" on ${paths.length} pages: ${paths.slice(0, 3).join(', ')}${paths.length > 3 ? ', …' : ''}`);

const longest = (key) => indexable.reduce((a, b) => (b[key].length > a[key].length ? b : a), indexable[0]);
const lt = longest('title'), ld = longest('description');
console.log(
  `[check-seo-meta] ${pages.length} pages (${indexable.length} indexable): ` +
  `${new Set(indexable.map((p) => p.title)).size} distinct titles, ` +
  `${new Set(indexable.map((p) => p.description)).size} distinct descriptions, ` +
  `${indexable.filter((p) => p.h1s === 1).length} with exactly one h1; ` +
  `longest title ${lt.title.length} chars, longest description ${ld.description.length} chars; ` +
  `${problems.length} problem(s)` +
  (exempted.length ? `; ${exempted.length} length issue(s) on allowlisted pages (scripts/seo-meta-allowlist.json — tech debt)` : ''),
);
if (problems.length && !countOnly) {
  console.error('\nSEO metadata problems on indexable pages:');
  for (const p of problems.slice(0, 40)) console.error('  ' + p);
  if (problems.length > 40) console.error(`  … and ${problems.length - 40} more`);
  process.exit(1);
}
