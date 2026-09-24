# SEO Batch 1 — URL and crawl plumbing fixes

**Date:** 2026-09-19  
**Branch:** `seo/url-crawl-plumbing` (off `main` @ `f177c9e`) — changes are on the working tree, **not yet committed**.  
**Scope:** trailing slash, legacy redirects, nofollow, sitemap, robots, llms.txt, broken/exposed items. The property template's titles, H1 and JSON-LD were **not** touched (only five `href`/URL strings in it were slash-fixed, as required by item 1).

---

## Results at a glance

| Check | Before | After |
|---|---|---|
| Internal `<a href>` without trailing slash (dist) | **50,935** of 53,170 | **0** of 52,419 |
| Build-guard scan (`scripts/check-trailing-slash.mjs`, all `href`/`action`) | — | 56,496 scanned, **0** bad; exits 1 on any regression (tested) |
| `/property/zion-z1-office-rent-thaltej` (no slash) | 301 → `/…/` (1 hop) | 301 → `/…/` (1 hop, Netlify Pretty URLs — expected; **no internal link hits it any more**) |
| `/buy` (no slash) | 301 → `/buy/` (1 hop) | 301 → `/buy/` (same; no internal link hits it) |
| `/listings` | 301 → `/listings/` → **meta-refresh stub (200, noindex)** → `/buy` → 301 → `/buy/` (3 hops + HTML refresh) | **301 → `/buy/`, 1 hop** |
| `/contact`, `/list-property` | same 3-hop chain | 301 → `/consult/`, 301 → `/sell/`, 1 hop each |
| `rel="nofollow"` on internal anchors (dist) | 2,710 | **0** (3 external nofollows on `/privacy-policy/` kept) |
| Sitemap URLs | 749, incl. 3 noindex pages, 0 `lastmod`, 0 images | **746**, 0 noindex, **746 `lastmod`**, **1,660 `<image:image>`** |
| Pages linking `/cps-admin/` | every page (footer) | 0 |
| READMEs served from dist | 3 (200) | 0 (404) |
| `/llms.txt` | 404 | 200, 639 words; `/llms-full.txt` 200, 1,243 words |
| Dead link `/property/iscon-platinum-3bhk` | 404 from `/style-guide/` | resolved at build time to a live featured listing |
| Meta-refresh stub pages (`/listings/`, `/contact/`, `/list-property/`) | 3 built | 0 built |

---

## 1. Trailing slash

**Config** — [`astro.config.mjs`](../astro.config.mjs):
```js
trailingSlash: 'always',
build: { format: 'directory', inlineStylesheets: 'never' },
```
`redirects: {…}` removed (see §2).

**Source rewrite** — every internal URL literal in `src/` now ends with `/` (or `/?` before a query). A scripted regex pass covered `href="/…"`, template literals (`` `/property/${slug}/` ``), breadcrumb `url:` fields, `services.ts` hrefs, Nav link tables, SearchBar `action`/`data-target`/JS targets, `site.js` fallback, and the inline `<a href>`s inside 20 blog Markdown files. Files touched: `PropertyCard`, `map.astro` cards, `Nav`, `Footer`, `ServicePage`, `ListingExplorer` (no literals — uses `PropertyCard`), `localities/[slug]` + `index`, `blog.astro`, `blog/[slug]`, `index`, `about-us`, `guide`, `404`, `saved`, `thanks`, `services/index`, `style-guide`, `property/[slug]` (5 href strings only), `SearchBar`, `LeadForm`, `WhatsAppButton`, `FloatingWhatsApp`, `lib/services.ts`, `scripts/site.js`, 20 × `content/blog/*.md`.

Query-string URLs now read `/buy/?type=residential`, `/map/?locality=thaltej`, etc. — 319 distinct, 0 without the slash.

Side effect worth knowing: the `BreadcrumbList` JSON-LD `item` URLs on property/locality/blog/service pages are built from the same breadcrumb arrays, so they are now consistently slash-form too (previously mixed).

**Build guard** — [`scripts/check-trailing-slash.mjs`](../scripts/check-trailing-slash.mjs), wired in [`package.json`](../package.json):
```
"build": "astro build && node scripts/postbuild.mjs && node scripts/check-trailing-slash.mjs",
"check:links": "node scripts/check-trailing-slash.mjs"
```
It scans every `href=`/`action=` root-relative value in `dist/**/*.html`, treats any extension-less path as a route, and exits 1 listing the offending hrefs and pages. Regression test (a temp page with `href="/buy"` and `href="/property/foo?x=1"`) → exit 1 with both listed. Netlify's build command is `npm run build`, so a bad link now fails the deploy.

## 2. Legacy redirects

New [`public/_redirects`](../public/_redirects):
```
/listings        /buy/       301
/listings/       /buy/       301
/list-property   /sell/      301
/list-property/  /sell/      301
/contact         /consult/   301
/contact/        /consult/   301
```
`redirects` block removed from `astro.config.mjs`; the three meta-refresh stubs are no longer generated (they were build output, not source files).

## 3. nofollow

`rel="nofollow noopener"` → `rel="noopener"` in `FloatingWhatsApp.astro`, `Footer.astro`, `WhatsAppButton.astro`, `LeadForm.astro`, `guide.astro`, `thanks.astro`. Built site: 0 internal nofollow anchors; the only remaining `nofollow`s are the 3 external ones on `/privacy-policy/`.

## 4. Sitemap

- **Filter**: `/saved/`, `/thanks/`, `/style-guide/`, `/privacy-policy/` (and `/404/`) excluded via a `NOINDEX` list in `astro.config.mjs` → 746 URLs, all slash-form.
- **lastmod** (new [`src/lib/sitemap-meta.ts`](../src/lib/sitemap-meta.ts), used by the `serialize` hook):
  - property → later of the listing's `newAt` and the JSON file's last git commit date
  - blog post → `updated` (if ever added) else frontmatter `date`, else git
  - locality → later of the dataset/template git date and the newest listing shown on that page
  - `/buy/`, `/rent/`, `/map/`, `/` → newest listing date; `/blog/` → newest post; other pages → git date of their `.astro` file
  - Result: 746/746 stamped across **15 distinct dates** (2026-06-05 → 2026-08-19); nothing uses the build time.
  - Guard: if the checkout is shallow (`git rev-parse --is-shallow-repository`), git dates are skipped rather than collapsed to one date, and a warning is logged. **Open question for the first production build:** Netlify's clone depth — if it's shallow, ~20 static pages (about, sell, consult, services/*) will have no `lastmod` until the build has history; content-dated URLs (properties, blog, localities, hubs) are unaffected. The Netlify deploy log will show `[sitemap] shallow git checkout …` if so.
- **Images**: up to 10 photos per property URL and the first photo of each of the (up to 9) listings rendered on a locality page → **1,660 `<image:image>` entries** with `image:title` (alt) and `image:caption` (label).
- `scripts/postbuild.mjs` prints `sitemap: N URLs, N with <lastmod>, N image entries` on every build.

Sample entry (from the draft deploy):
```xml
<url>
  <loc>https://cityprop.co.in/property/whitecraft-ambli/</loc>
  <lastmod>2026-08-07T10:05:15.000Z</lastmod>
  <image:image>
    <image:loc>https://cityprop.co.in/uploads/properties/whitecraft-ambli/photo-1.jpg</image:loc>
    <image:caption>Project photo</image:caption>
    <image:title>Whitecraft, Ambli — project photo</image:title>
  </image:image>
  …
</url>
```

## 5. robots.txt

[`public/robots.txt`](../public/robots.txt): keeps `Disallow: /cps-admin/`; adds Disallow for the three README paths (belt-and-braces — they are also **no longer shipped**: `scripts/postbuild.mjs` deletes `README.*` from `dist/`, confirmed 404 on the draft deploy); adds an explicit AI-crawler group (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, anthropic-ai, Claude-Web, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended, Applebot, Applebot-Extended, Bytespider, CCBot, meta-externalagent, meta-externalfetcher, Amazonbot, DuckAssistBot, cohere-ai, YouBot) with `Allow: /` + `Disallow: /cps-admin/`. The "Employee login" link (and its CSS) was removed from `Footer.astro`; `/cps-admin/` is reachable by direct URL only.

## 6. llms.txt

- [`public/llms.txt`](../public/llms.txt) — llmstxt.org format: H1, blockquote summary (Mukesh Vasani, 27+ years, 8,000+ transactions, CIRIL, seven verticals, RERA no.), office address + phone + email, then sections **Services** (6), **Property listings** (`/buy/`, `/rent/`, `/map/`, `/localities/`), **Top localities by listings** (15, descriptions taken from the locality dataset, with counts), **Guides & advice** (`/guide/`, `/blog/`), **Company & contact** (`/about-us/`, `/sell/`, `/consult/`), **Optional** (llms-full, services index, privacy, sitemap).
- [`public/llms-full.txt`](../public/llms-full.txt) — company facts block, then the full About page (story, what we help with, why clients choose us, vision) and the complete Buyer (13 steps) and Seller (12 steps) guide as plain markdown, extracted from the built pages so the wording matches the site exactly.
- Both are static files; the top-15 locality list is a snapshot as of today (600 listings). Regenerate when the listing mix shifts materially.

## 7. Broken and exposed

- **Dead link**: chose to **keep `/style-guide/` in the build** (it's already `noindex` and now out of the sitemap) and fix the link. `style-guide.astro` now resolves the "Property detail" screen card to the first featured listing via `getFeatured(1)` at build time, so it can never point at a removed slug again.
- **`/cps-admin/config.yml`** (publicly readable, 200): contains **no secrets** — no tokens, keys or credentials. Decap authenticates via GitHub OAuth through Netlify at runtime. What it does reveal: the private repo name `krishvasani/city-property-website`, branch `main`, the content folder layout and full field schema, and `local_backend: true` (only honoured when the CMS is opened on localhost with `decap-server` running — inert in production, but worth turning off in a later batch). Risk: low (information disclosure only). No auth changes made, as instructed.

---

## Verification output

Draft deploy used for the server-side checks (Netlify, unique preview URL, production untouched):  
`https://6aae52f93a9457e340dd3d91--city-property-ahmedabad.netlify.app`

### No-slash internal hrefs in dist (same counting script both times)
```
BEFORE  internal hrefs: 53170  no-slash: 50935
AFTER   internal hrefs: 52419  no-slash: 0
[check-trailing-slash] 56496 internal links scanned, 0 without trailing slash
```

### curl hop traces
```
BEFORE (https://cityprop.co.in)
/property/zion-z1-office-rent-thaltej  301 → /property/zion-z1-office-rent-thaltej/   final 200 after 1 redirect
/buy                                   301 → /buy/                                  final 200 after 1 redirect
/listings                              301 → /listings/  (200 stub: <meta http-equiv="refresh" content="0;url=https://cityprop.co.in/buy">) → /buy → 301 → /buy/
                                       = 3 hops incl. an HTML meta refresh

AFTER (draft deploy)
/property/zion-z1-office-rent-thaltej  301 → /property/zion-z1-office-rent-thaltej/   final 200 after 1 redirect  (Pretty URLs; no internal link targets this form any more)
/buy                                   301 → /buy/                                  final 200 after 1 redirect
/listings                              301 → /buy/                                  final 200 after 1 redirect
/contact                               301 → /consult/                              final 200 after 1 redirect
/list-property                         301 → /sell/                                 final 200 after 1 redirect

slash forms served directly (0 redirects): /property/zion-z1-office-rent-thaltej/  /buy/  /buy/?type=residential  /localities/thaltej/
```

### nofollow
```
rel=nofollow on INTERNAL anchors: 0
pages with any nofollow anchor: ['dist/privacy-policy/index.html']   (3 external links, unchanged)
```

### Sitemap
```
URLs: 746   with lastmod: 746   image entries: 1660
noindex URLs present: none      non-slash locs: 0
distinct lastmod dates: 15  (2026-06-05 → 2026-08-19)
```
(sample entry above in §4)

### llms.txt / robots.txt (draft deploy)
```
GET /llms.txt        HTTP/2 200  text/plain; charset=UTF-8   (639 words)
GET /llms-full.txt   HTTP/2 200  7,928 bytes
GET /robots.txt      HTTP/2 200  (content as in public/robots.txt)
GET /uploads/README.md            404
GET /team/README.txt              404
GET /images/company-logos/README.txt  404
```

---

## Diff summary

53 files changed, 625 insertions(+), 150 deletions(-)

New: `public/_redirects`, `public/llms.txt`, `public/llms-full.txt`, `scripts/check-trailing-slash.mjs`, `scripts/postbuild.mjs`, `src/lib/sitemap-meta.ts`  
Rewritten: `astro.config.mjs`, `public/robots.txt`  
Href-only edits: 20 blog `.md`, `Nav`, `Footer` (+ admin link removed), `PropertyCard`, `SearchBar`, `ServicePage`, `WhatsAppButton`, `FloatingWhatsApp`, `LeadForm`, `lib/services.ts`, `scripts/site.js`, `pages/{404,about-us,blog,blog/[slug],guide,index,localities/[slug],localities/index,map,property/[slug],saved,services/index,style-guide,thanks}.astro`  
`package.json`: build pipeline + `check:links` script.

## Notes / follow-ups (not in this batch)

- Netlify Pretty URLs stays on — it is now purely a safety net for external links using the bare form.
- First production build will reveal whether Netlify's clone is shallow (see §4). If it is, consider `git fetch --unshallow` in the build command or persisting page dates in content.
- `local_backend: true` in `cps-admin/config.yml` can be dropped for production in the admin batch.
- Nothing has been committed or pushed; `git diff` on branch `seo/url-crawl-plumbing` holds everything.
