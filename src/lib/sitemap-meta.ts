// Sitemap metadata (lastmod + image entries) for @astrojs/sitemap's `serialize`
// hook. Imported by astro.config.mjs, so it must not touch `astro:content`;
// it reads the same content files straight from disk instead.
//
// lastmod rules (never the build date):
//   - property  → latest of the listing's `newAt` and the JSON file's last git commit
//   - blog post → `updated` (if ever added) else `date` from frontmatter, or git
//   - locality  → last git commit of the locality dataset / template, or the
//                 newest listing shown on that page, whichever is later
//   - other     → last git commit touching that page's .astro file
//   Git dates are skipped when the checkout is shallow (all files would share
//   one date), in which case the URL is emitted without lastmod rather than
//   with a misleading one.
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { getAllLocalities, propertyTextMatchesLocality } from '../data/localities';
import { pageCombos } from './landing-core';

export interface SitemapImage { url: string; title?: string; caption?: string }
export interface SitemapMeta { lastmod?: string; img?: SitemapImage[] }

const ROOT = process.cwd();
const PROPERTIES_DIR = join(ROOT, 'src/content/properties');
const BLOG_DIR = join(ROOT, 'src/content/blog');

// ── git helpers ─────────────────────────────────────────────────────────
function sh(cmd: string): string {
  try { return execSync(cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); }
  catch { return ''; }
}
const shallow = sh('git rev-parse --is-shallow-repository') !== 'false';
const gitDateCache = new Map<string, string | undefined>();
/** ISO date of the last commit touching `relPath`; undefined if shallow/untracked. */
export function gitDate(relPath: string): string | undefined {
  if (shallow) return undefined;
  if (!gitDateCache.has(relPath)) {
    const d = sh(`git log -1 --format=%cI -- "${relPath}"`);
    gitDateCache.set(relPath, d || undefined);
  }
  return gitDateCache.get(relPath);
}
const later = (...dates: (string | undefined)[]) =>
  dates.filter(Boolean).sort().pop();

// ── content readers ─────────────────────────────────────────────────────
interface Prop {
  slug: string; title: string; draft?: boolean; newAt?: string; status: string; propertyType: string;
  localityName: string; localitySlug?: string; address?: string;
  priceValue?: number; priceDisplay: string; pricePer?: string; areaSqft?: number; area?: string; beds?: number | string;
  mainImage?: string; photos?: { url?: string; alt?: string; label?: string }[];
}
function readProperties(): Prop[] {
  return readdirSync(PROPERTIES_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const d = JSON.parse(readFileSync(join(PROPERTIES_DIR, f), 'utf8'));
      return { ...d, slug: d.slug || f.replace(/\.json$/, ''), _file: `src/content/properties/${f}` };
    })
    .filter((p) => !p.draft);
}
function readBlogDates(): Map<string, string> {
  const out = new Map<string, string>();
  for (const f of readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'))) {
    const fm = readFileSync(join(BLOG_DIR, f), 'utf8').split('---')[1] ?? '';
    const pick = (k: string) => fm.match(new RegExp(`^${k}:\\s*"?([0-9T:+.Z-]+)"?`, 'm'))?.[1];
    const d = later(pick('updated'), pick('date'), gitDate(`src/content/blog/${f}`));
    if (d) out.set(f.replace(/\.md$/, ''), d);
  }
  return out;
}

// Same name/alias → id resolution as src/lib/data.ts, so locality pages and
// the sitemap agree on which listings belong to which locality.
const nameToId = new Map<string, string>();
for (const l of getAllLocalities()) {
  nameToId.set(l.name.toLowerCase(), l.id);
  for (const a of l.aliases) nameToId.set(a.toLowerCase(), l.id);
}
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const resolveLocality = (p: Prop) =>
  p.localitySlug?.trim() || (p.localityName ? nameToId.get(p.localityName.toLowerCase()) || slugify(p.localityName) : undefined);

function propertyImages(p: Prop, site: string, limit: number): SitemapImage[] {
  const photos = [...(p.photos ?? [])];
  if (p.mainImage && !photos.some((x) => x.url)) photos.unshift({ url: p.mainImage, alt: p.title });
  return photos
    .filter((x) => x.url)
    .slice(0, limit)
    .map((x) => ({ url: new URL(x.url!, site).href, title: x.alt || p.title, caption: x.label }));
}

// ── build the URL → meta index once per build ───────────────────────────
export function buildSitemapMeta(site: string): (url: string) => SitemapMeta {
  const props = readProperties();
  const blog = readBlogDates();
  const meta = new Map<string, SitemapMeta>();
  const path = (u: string) => new URL(u, site).pathname;

  // Property pages: lastmod + up to 10 photos each.
  const propMeta = new Map<string, { lastmod?: string; loc?: string; first?: SitemapImage }>();
  for (const p of props) {
    const lastmod = later(p.newAt, gitDate((p as any)._file));
    const img = propertyImages(p, site, 10);
    meta.set(`/property/${p.slug}/`, { lastmod, ...(img.length ? { img } : {}) });
    propMeta.set(p.slug, { lastmod, loc: resolveLocality(p), first: img[0] });
  }

  // Locality pages: listings matched exactly as localities/[slug].astro does;
  // images = first photo of the (up to 9) cards rendered on the page.
  const localityBase = later(gitDate('src/data/localities.ts'), gitDate('src/pages/localities/[slug].astro'));
  const byNewest = [...props].sort((a, b) => String(b.newAt || '').localeCompare(String(a.newAt || '')));
  for (const loc of getAllLocalities()) {
    const shown = byNewest.filter(
      (p) => propMeta.get(p.slug)?.loc === loc.id ||
        propertyTextMatchesLocality([p.title, p.localityName, p.address].filter(Boolean).join(' '), loc),
    );
    const img = shown.slice(0, 9).map((p) => propMeta.get(p.slug)?.first).filter(Boolean) as SitemapImage[];
    const lastmod = later(localityBase, ...shown.map((p) => propMeta.get(p.slug)?.lastmod));
    meta.set(`/localities/${loc.slug}/`, { lastmod, ...(img.length ? { img } : {}) });
  }

  // Locality × type landing pages (/buy|rent/{type}-in-{locality}/):
  // lastmod = newest listing in the set, images = first photo of each listing.
  const resolved = props.map((p) => ({ ...p, localitySlug: resolveLocality(p) }));
  for (const c of pageCombos(resolved)) {
    const img = c.listings.map((p) => propMeta.get(p.slug)?.first).filter(Boolean) as SitemapImage[];
    const lastmod = later(...c.listings.map((p) => propMeta.get(p.slug)?.lastmod));
    meta.set(c.path, { lastmod, ...(img.length ? { img } : {}) });
  }

  // Adani Shantigram hub + project pages (only listed when SHANTIGRAM_LIVE):
  // lastmod = last commit to the project's JSON or the template; images = photos.
  const projDir = join(ROOT, 'src/content/projects/shantigram');
  const projTemplate = later(gitDate('src/pages/projects/adani-shantigram/[project].astro'), gitDate('src/lib/shantigram-content.ts'));
  let newestProject: string | undefined;
  for (const f of readdirSync(projDir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))) {
    const d = JSON.parse(readFileSync(join(projDir, f), 'utf8'));
    const lastmod = later(gitDate(`src/content/projects/shantigram/${f}`), projTemplate);
    newestProject = later(newestProject, lastmod);
    const img = (d.photos ?? []).slice(0, 6).map((u: string) => ({ url: new URL(u, site).href, title: `${d.name}, Adani Shantigram — developer render` }));
    meta.set(`/projects/adani-shantigram/${d.slug}/`, { lastmod, ...(img.length ? { img } : {}) });
  }
  {
    const t = JSON.parse(readFileSync(join(projDir, '_township.json'), 'utf8'));
    const img = (t.photos ?? []).slice(0, 6).map((u: string) => ({ url: new URL(u, site).href, title: 'Adani Shantigram township — developer render' }));
    meta.set('/projects/adani-shantigram/', { lastmod: later(newestProject, gitDate('src/pages/projects/adani-shantigram/index.astro'), gitDate('src/content/projects/shantigram/_township.json')), ...(img.length ? { img } : {}) });
  }

  // Blog posts.
  for (const [slug, d] of blog) meta.set(`/blog/${slug}/`, { lastmod: d });
  const newestPost = later(...blog.values());
  meta.set('/blog/', { lastmod: later(newestPost, gitDate('src/pages/blog.astro')) });

  // Listing hubs change whenever any listing does.
  const newestListing = later(...[...propMeta.values()].map((m) => m.lastmod));
  meta.set('/buy/', { lastmod: later(newestListing, gitDate('src/pages/buy.astro')) });
  meta.set('/rent/', { lastmod: later(newestListing, gitDate('src/pages/rent.astro')) });
  meta.set('/map/', { lastmod: later(newestListing, gitDate('src/pages/map.astro')) });
  meta.set('/localities/', { lastmod: later(localityBase, gitDate('src/pages/localities/index.astro')) });
  meta.set('/', { lastmod: later(newestListing, gitDate('src/pages/index.astro')) });

  // Everything else: the page's own .astro file.
  const pageFile = (p: string) => {
    const base = `src/pages${p.replace(/\/$/, '')}`;
    for (const rel of [`${base}.astro`, `${base}/index.astro`]) {
      try { statSync(join(ROOT, rel)); return rel; } catch { /* try next */ }
    }
    return undefined;
  };

  return (url: string) => {
    const p = path(url);
    if (meta.has(p)) return meta.get(p)!;
    const f = pageFile(p);
    return { lastmod: f ? gitDate(f) : undefined };
  };
}

export const isShallowCheckout = shallow;
