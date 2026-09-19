#!/usr/bin/env node
// Post-build steps:
//  1. remove developer README files that Astro copies verbatim from public/
//     (they document where to drop images and must not be served)
//  2. print a summary of the generated sitemap (URL / lastmod / image counts)
import { existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const removed = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/^readme(\.|$)/i.test(name)) { rmSync(p); removed.push(relative(DIST, p)); }
  }
})(DIST);
console.log(`[postbuild] removed ${removed.length} README file(s) from dist${removed.length ? ': ' + removed.join(', ') : ''}`);

const sitemap = join(DIST, 'sitemap-0.xml');
if (existsSync(sitemap)) {
  const xml = readFileSync(sitemap, 'utf8');
  const n = (re) => (xml.match(re) ?? []).length;
  console.log(`[postbuild] sitemap: ${n(/<url>/g)} URLs, ${n(/<lastmod>/g)} with <lastmod>, ${n(/<image:image>/g)} image entries`);
}
