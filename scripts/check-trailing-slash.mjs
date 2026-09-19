#!/usr/bin/env node
// Build guard: fail if any built HTML page links to an internal route without
// the trailing slash. Netlify's Pretty URLs 301 `/buy` → `/buy/`, so a bare
// link costs a redirect hop for every visitor and crawler. Runs after
// `astro build` (see package.json "build"); exit code 1 blocks the deploy.
//
// Usage: node scripts/check-trailing-slash.mjs [--count]
//   --count  only print the counts, never fail (used for reporting)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const countOnly = process.argv.includes('--count');

function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* htmlFiles(p);
    else if (name.endsWith('.html')) yield p;
  }
}

// href="/..." on <a> and <link>, action="/..." on <form>, plus the redirect
// targets Astro would emit. Root-relative only; protocol-relative (//) and
// external URLs are ignored.
const ATTR_RE = /\b(?:href|action)="(\/[^"]*)"/g;
// A route is any path with no file extension. Files (.xml, .png, .css …) are
// served as-is and must NOT get a slash.
const isRoute = (path) => !/\.[a-z0-9]{1,5}$/i.test(path);

let total = 0, bad = 0;
const offenders = new Map(); // href → [pages]
for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, 'utf8');
  for (const m of html.matchAll(ATTR_RE)) {
    const href = m[1];
    if (href.startsWith('//')) continue;
    const path = href.split('#')[0].split('?')[0];
    if (!path) continue;               // "#anchor" / "?x" only
    total++;
    if (isRoute(path) && !path.endsWith('/')) {
      bad++;
      const list = offenders.get(href) ?? [];
      if (list.length < 3) list.push(relative(DIST, file));
      offenders.set(href, list);
    }
  }
}

console.log(`[check-trailing-slash] ${total} internal links scanned, ${bad} without trailing slash`);
if (bad && !countOnly) {
  console.error('\nInternal links missing the trailing slash (href → first pages):');
  for (const [href, pages] of [...offenders].sort()) console.error(`  ${href}  ←  ${pages.join(', ')}`);
  console.error('\nFix the source href (routes must end with "/" — e.g. /buy/, /buy/?type=x, /property/slug/).');
  process.exit(1);
}
