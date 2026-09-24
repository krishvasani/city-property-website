# SEO Diagnostic — cityprop.co.in

**Date:** 2026-09-19  
**Scope:** Read-only investigation of the codebase at `~/cps-website` (commit `f177c9e`, Sep 3 2026 build in `dist/`, identical to production), live HTTP probes, and the Semrush Site Audit API (project 31265807, snapshot `6aad0a62aa87d2849728a642`).  
**No code was changed.**

Measured counts (538 duplicate titles, 27 duplicate descriptions, 672 missing H1, 235 schema errors) match the Semrush audit exactly, so the checked-out build is what Google sees.

---

## A. Stack and architecture

| | |
|---|---|
| Framework | Astro **4.16.18** (`^4.16.18`, `package.json:15`), `@astrojs/sitemap` 3.2.1. No adapter. |
| Output | `output: 'static'` (`astro.config.mjs:14`). **Every route is pre-rendered HTML at build time.** No SSR, no client-rendered routes. |
| Hosting | Netlify, publish `dist` (`netlify.toml:2-4`). Netlify **Pretty URLs = ON** (site setting via API: `processing_settings.html.pretty_urls: true`). |
| Property data | 600 JSON files in `src/content/properties/` (Astro content collection, schema `src/content/config.ts:32-106`), edited via Decap CMS at `/cps-admin/`. Read through `src/lib/data.ts:104-114` (`getCollection('properties')`, drafts excluded). Sanity is no longer in the stack. |
| Locality data | Hard-coded dataset `src/data/localities.ts` (153 localities). |
| Blog | 20 Markdown files in `src/content/blog/`. |
| Route generation | `getStaticPaths()` in `property/[slug].astro` (all 600), `localities/[slug].astro` (priority ≤ 2 **or** has listings → 110 pages), `blog/[slug].astro` (20). All other routes are single `.astro` files. |
| Build output | 754 HTML pages. `build.format` default `directory` → `dist/property/<slug>/index.html`. |
| Client JS | Filtering/sorting/pagination on `/buy`, `/rent`, `/map` is client-side over server-rendered cards (see G). |

**Why Semrush saw 2,137 pages / 1,065 HTML pages when there are 754:** the site emits **319 distinct query-string URLs** (`/buy?locality=…`, `/rent?locality=…`, `/buy?type=…`, `/map?locality=…` ×71). Semrush crawls each as a separate page (754 + 319 ≈ 1,073 ≈ its 1,065 HTML pages after noindex exclusions), and every no-slash link it followed added a 301 entry.

---

## B. Template inventory

| Template | Route(s) | Pages | H1 | Unique title | Unique description | JSON-LD (beyond sitewide Org + WebSite) |
|---|---|---|---|---|---|---|
| `src/pages/property/[slug].astro` | `/property/:slug/` | 600 | **NO** — title is a `<div class="ttl">` (L139) | **NO** — computed as `{Type} for {Sale/Rent} in {Locality}, Ahmedabad` (L81); 538 pages share a title | Mostly (27 dupes — no-price listings in the same locality collapse, L84) | BreadcrumbList + **Product** |
| `src/pages/localities/[slug].astro` | `/localities/:slug/` | 110 | Yes (L82) | Yes (from `loc.seoTitle`; 227 site-wide titles >70 chars, mostly these) | Yes | BreadcrumbList + **Place** |
| `src/pages/blog/[slug].astro` | `/blog/:slug/` | 20 | Yes (L79) | Yes | Yes | BreadcrumbList + **BlogPosting** |
| `src/components/ServicePage.astro` via `services/*.astro` | `/services/:key/` | 6 | Yes (L104) | Yes | Yes | BreadcrumbList + **Service** |
| `src/components/ListingExplorer.astro` via `buy.astro`, `rent.astro` | `/buy/`, `/rent/` (+ query variants) | 2 (+248 URL variants) | Yes (L95) | Yes — but **every `?locality=`/`?type=` variant serves identical title/H1/content** | same | none |
| `src/pages/map.astro` | `/map/` (+71 `?locality=` variants) | 1 (+71) | **NO** (no `<h1>` in the file) | Yes | Yes | none |
| `src/pages/index.astro` | `/` | 1 | Yes | Yes | Yes | none |
| `localities/index`, `services/index`, `blog`, `about-us`, `sell`, `consult`, `guide` | one each | 7 | Yes | Yes | Yes | none |
| `saved`, `thanks`, `404`, `style-guide`, `privacy-policy` | one each | 5 | Yes | Yes | Yes | none — all `noindex` |
| Astro `redirects` (`astro.config.mjs:16-20`) | `/listings/`, `/list-property/`, `/contact/` | 3 | — | "Redirecting to…" | none | none (meta-refresh stubs, noindex) |

**Missing-H1 reconciles exactly:** 600 property pages + `/map/` + 71 `/map?locality=` variants = **672**.

---

## C. Head and metadata layer

All head tags are built in one place: `src/layouts/Base.astro:50-52, 109-138`.

```astro
// Base.astro:50-52
const canonical = new URL(Astro.url.pathname, site.url).href;
const ogImageAbs = new URL(ogImage, site.url).href;
const fullTitle = title.includes(site.name) ? title : `${title} | ${site.name}`;
```
```html
<!-- Base.astro:114-135 -->
<title>{fullTitle}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
{noindex ? <meta name="robots" content="noindex, nofollow" />
         : <meta name="robots" content="index, follow, max-image-preview:large" />}
<meta property="og:type" content={ogType} />
<meta property="og:site_name" content={site.name} />
<meta property="og:locale" content="en_IN" />
<meta property="og:title" content={fullTitle} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta property="og:image" content={ogImageAbs} />
<meta name="twitter:card" content="summary_large_image" />
… twitter:title / twitter:description / twitter:image
```

Notes: `Astro.url.pathname` at build time is `/property/slug/` (directory format), so **canonicals use the trailing-slash form** — correct, and matches what Netlify serves. No `hreflang`, no `lastmod`, no `og:image:width/height`, no `og:image:alt`.

### Property detail template — head inputs (`src/pages/property/[slug].astro:71-108`)

```ts
const typeLabel = TYPE_LABELS[property.propertyType] ?? 'Property';
const listingWord = property.status === 'sale' ? 'for Sale' : property.status === 'lease' ? 'for Lease' : 'for Rent';
const seoTitle = `${typeLabel} ${listingWord} in ${property.localityName}, Ahmedabad`;
const onRequest = !property.priceValue || property.priceDisplay === 'Price on request';
const priceBit = onRequest ? '' : ` at ${property.priceDisplay}`;
const seoDescription = `${typeLabel} ${listingWord.toLowerCase()} in ${property.localityName}, Ahmedabad${priceBit}. ${property.area ? property.area + '. ' : ''}Contact City Property Services for photos, details and a viewing.`.slice(0, 158);
const ogImg = property.photos?.find((p) => p.url)?.url;
const propUrl = new URL(Astro.url.pathname, site.url).href;
const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: isRental ? 'Rent' : 'Buy', url: listPath },
  ...(selfLoc ? [{ name: property.localityName, url: `/localities/${property.localitySlug}` }] : []),
  { name: `${typeLabel} ${listingWord}`, url: Astro.url.pathname },
];
```
```astro
<Base title={seoTitle} description={seoDescription} active={isRental ? 'rent' : 'buy'}
      ogImage={ogImg} breadcrumbs={breadcrumbs} jsonLd={productSchema}>
```

**Key finding:** every one of the 600 property JSON files already has a hand-written `seoTitle` and `seoDescription` (schema `src/content/config.ts:100-101`, CMS fields `public/cps-admin/config.yml:196-197`), and `toProperty()` in `src/lib/data.ts:35-100` **never copies them onto the `Property` object**, so the template can't use them. Stored values: 411 distinct titles / 595 distinct descriptions across 600 records — far better than what ships (311 distinct titles site-wide), though still not fully unique. The building name (e.g. "Zion Z1", "Whitecraft") never reaches the `<title>`.

### Locality template — head inputs (`src/pages/localities/[slug].astro:39-73`)

```ts
const title = loc.seoTitle || `Property in ${loc.name}, Ahmedabad | Buy, Rent & Invest`;
const description =
  loc.seoDescription ||
  `${loc.name}, ${loc.city} real estate. Buy, rent, lease and invest in property in ${loc.name} with City Property Services, Ahmedabad's full spectrum property consultants.`;
const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Localities', url: '/localities' },
  { name: loc.name, url: `/localities/${loc.slug}` },
];
const placeSchema = { '@context': 'https://schema.org', '@type': 'Place',
  name: `${loc.name}, ${loc.city}`,
  address: { '@type': 'PostalAddress', addressLocality: loc.name, addressRegion: 'Gujarat', addressCountry: 'IN', ...(loc.pincode ? { postalCode: loc.pincode } : {}) },
  ...(loc.latitude != null ? { geo: { '@type': 'GeoCoordinates', latitude: loc.latitude, longitude: loc.longitude } } : {}),
};
---
<Base title={title} description={description} breadcrumbs={breadcrumbs} jsonLd={placeSchema} active="buy">
```

Locality H1 is the fixed string `Property in {loc.name}, Ahmedabad` (L82).

---

## D. Schema markup

### Every JSON-LD emitter

1. **Sitewide, every page** — `src/layouts/Base.astro:56-107`: `RealEstateAgent` (`@id …/#organization`, address, phone, email, areaServed, sameAs) + `WebSite` (`publisher` → org) + optional `BreadcrumbList` + any page `jsonLd`. Emitted at L138 as one `<script type="application/ld+json">` per object (not a `@graph`).
2. **Property** — `Product` (`src/pages/property/[slug].astro:93-108`):
   ```ts
   const schemaImages = (property.photos ?? []).filter((p) => p.url).slice(0, 6).map((p) => new URL(p.url!, site.url).href);
   const productSchema: Record<string, any> = {
     '@context': 'https://schema.org', '@type': 'Product',
     name: property.title, description: seoDescription, category: typeLabel,
     ...(schemaImages.length ? { image: schemaImages } : {}),
     brand: { '@type': 'Organization', name: site.name },
   };
   if (!onRequest) {
     productSchema.offers = property.status === 'sale'
       ? { '@type': 'Offer', price: property.priceValue, priceCurrency: 'INR', availability: 'https://schema.org/InStock', url: propUrl }
       : { '@type': 'Offer', priceCurrency: 'INR', availability: 'https://schema.org/InStock', url: propUrl,
           priceSpecification: { '@type': 'UnitPriceSpecification', price: property.priceValue, priceCurrency: 'INR', unitText: 'MONTH' } };
   }
   ```
3. **Locality** — `Place` (`src/pages/localities/[slug].astro:48-62`, pasted in C).
4. **Blog post** — `BlogPosting` (`src/pages/blog/[slug].astro:38-50`): headline, description, image, datePublished, dateModified, author (Organization), publisher (`@id` ref), mainEntityOfPage, articleSection. `dateModified` always equals `datePublished` because `updated` is not in the blog schema (L32 reads a field that can never exist).
5. **Service** — `Service` (`src/components/ServicePage.astro:86-98`): name, description, serviceType, url, provider (`@id` ref), areaServed.

### Rendered JSON-LD on a real page: `/property/zion-z1-office-rent-thaltej/`

Four blocks. The two page-specific ones:

```json
{ "@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
  {"@type":"ListItem","position":1,"name":"Home","item":"https://cityprop.co.in/"},
  {"@type":"ListItem","position":2,"name":"Rent","item":"https://cityprop.co.in/rent"},
  {"@type":"ListItem","position":3,"name":"Thaltej","item":"https://cityprop.co.in/localities/thaltej"},
  {"@type":"ListItem","position":4,"name":"Office Space for Rent","item":"https://cityprop.co.in/property/zion-z1-office-rent-thaltej/"}]}
```
```json
{ "@context":"https://schema.org","@type":"Product",
  "name":"2,972 sq.ft Office · Zion Z1, Thaltej",
  "description":"Office Space for rent in Thaltej, Ahmedabad at ₹65 / sq.ft. 2,972 sq.ft. Contact City Property Services for photos, details and a viewing.",
  "category":"Office Space",
  "brand":{"@type":"Organization","name":"City Property Services"},
  "offers":{"@type":"Offer","priceCurrency":"INR","availability":"https://schema.org/InStock",
    "url":"https://cityprop.co.in/property/zion-z1-office-rent-thaltej/",
    "priceSpecification":{"@type":"UnitPriceSpecification","price":193180,"priceCurrency":"INR","unitText":"MONTH"}}}
```

### Validation against Google's requirements

Semrush's audit record for this page flags: **item `MERCHANT_LISTING`, field `image`, cause `REQUIRED`**. Breakdown of all 600 built Product items:

| Product variant in the build | Pages | Semrush verdict |
|---|---|---|
| has `image`, has `offers` | 365 | no error |
| no `image` (listing has no photos) | 189 | **error — `image` required** |
| has `image`, no `offers` (price on request) | 46 | **error — `offers`/`review`/`aggregateRating` required** |
| **total flagged** | **235** | matches Semrush exactly |

Google reads a `Product` with `offers` as a **Merchant Listing** candidate, which *requires* `image` and `offers.price`. Beyond what Semrush flagged:

- **Wrong type.** `Product` + `InStock` is the vocabulary for goods in a shop. schema.org's types for this content are `RealEstateListing` (the page) whose `mainEntity`/`about` is an `Apartment` / `House` / `Office` / `Accommodation` (with `floorSize`, `numberOfRooms`, `address`, `geo`) offered via an `Offer` with `businessFunction` (sell vs lease/rent) and `itemOffered`. Google has no rich-result type for real estate, so `Product` buys nothing in SERPs while exposing every page to "misleading structured data" review, and it tells AI crawlers the page sells a "product."
- **Rental `Offer` has no `price`** — 168 + 134 = 302 rental pages put the number only inside `priceSpecification`. `unitText: 'MONTH'` is not a UN/CEFACT code, and the 193,180 figure is derived (₹65 × 2,972) while the visible page shows "₹65 / sq.ft" — a visible-vs-markup mismatch.
- **No `@id`, no `url`, no `sku`/identifier** on the Product; nothing links it to the `#organization` node (`brand` is a fresh anonymous Organization instead of `{"@id": ".../#organization"}`).
- **`RealEstateAgent` has no `geo`, `openingHours`, `priceRange`, `hasMap`** — weak as a LocalBusiness signal; `telephone` is formatted with spaces rather than E.164.
- **BreadcrumbList item URLs mix forms**: positions 1 and 4 have trailing slashes, 2 and 3 do not (`/rent`, `/localities/thaltej`) — the latter are 301 targets.
- Blocks are emitted as four separate scripts with no `@graph`, so parsers can't join `publisher → #organization` reliably.
- `Place` on locality pages and `Service` on services pages are valid schema.org but trigger no Google feature; `Place` lacks `containedInPlace`.

**Why Semrush's Markup report says zero valid schema.org pages while its own audit shows 365 property pages with no schema error:** the Markup report only counts markup that maps to a Google rich-result type and validates cleanly. The Product items either fail (235) or, on the 365 that pass, still lack `sku`/`gtin`/`mpn`/`review` etc. that Semrush's Merchant-Listing profile scores; the `RealEstateAgent`, `WebSite`, `Place`, `Service` items are types Semrush doesn't count as rich-result-eligible at all. The Markup-report scoring rule isn't exposed in the API, so treat that sentence as a strong inference; the 235 error breakdown is confirmed.

---

## E. Trailing slash

- **Served / canonical form:** trailing slash. Astro's default `build.format: 'directory'` writes `…/index.html`; `<link rel="canonical">` and every sitemap `<loc>` use `…/slug/`. Live: `/property/zion-z1-office-rent-thaltej/` → 200.
- **Form internal links emit:** **no** trailing slash. `PropertyCard` builds `` `/property/${p.slug}` `` (`src/components/PropertyCard.astro:12`); map cards the same (`src/pages/map.astro:132`); Nav/Footer/breadcrumbs/CTAs all hard-code `/buy`, `/rent`, `/consult`, `/localities/x`, etc. In the build: **53,107 internal `<a href>`; 50,874 (96%) without a trailing slash.**
- **What the server does with the other form:** Netlify **Pretty URLs** (site setting, not in the repo) 301s `/property/x` → `/property/x/` (live: `HTTP/2 301, location: /property/zion-z1-office-rent-thaltej/`). Same for `/buy` → `/buy/` and for query URLs: `/map?locality=thaltej` → `/map/?locality=thaltej`.
- **Config controlling it:** nothing in the repo. `astro.config.mjs` sets neither `trailingSlash` (default `'ignore'`) nor `build.format`; there is no `dist/_redirects` and no `@astrojs/netlify` adapter. Astro's dev server accepts both forms, which is why this was never noticed locally.
- **Legacy redirects are a 3-hop chain:** `/listings` → 301 `/listings/` → HTML stub with `<meta http-equiv="refresh">` + `noindex` (`dist/listings/index.html`) → `https://cityprop.co.in/buy` → 301 `/buy/`. Astro's `redirects` config only produces meta-refresh pages in static mode without an adapter.

Semrush's 100,000 "permanent redirects" count is capped; the real number of no-slash links is ~51k.

---

## F. `rel="nofollow"` on internal links

All instances are the WhatsApp click-to-chat anchors. Their `href` is `/consult` (an internal page) as a no-JS fallback, while the real destination is a base64 `data-wa` payload decoded on click by `src/scripts/site.js:6-17`. The `nofollow` was added because the author treated them as external WhatsApp links (anti-scrape design, `src/lib/config.ts:43-52`).

| File | Line | Present on |
|---|---|---|
| `src/components/FloatingWhatsApp.astro:7` | `<a class="fab-wa" href="/consult" data-wa rel="nofollow noopener">` | every page except style-guide |
| `src/components/Footer.astro:28` | footer WhatsApp icon | every page |
| `src/components/WhatsAppButton.astro:30` | "WhatsApp Us" button | property pages, sell, consult, etc. |
| `src/components/LeadForm.astro:133` | error-fallback link inside form | every page with a form |
| `src/pages/guide.astro:123`, `src/pages/thanks.astro:14` | inline CTAs | those pages |

Build total: **2,710 nofollow internal anchors** (4 per property page, 2 on most others). Semrush's 1,065 = one flagged link per crawled page. `/consult` is also linked with follow from the nav, so nothing is orphaned — but it's a wasted signal. The external `nofollow`s in `src/pages/privacy-policy.astro:119-130` are fine.

---

## G. Internal linking

**How a crawler reaches a property page** (raw HTML, no JS):

| Source page | Internal links | Links to `/property/*` | Notes |
|---|---|---|---|
| `/buy/` | 333 | **275** (all sale listings) | All cards in HTML (`ListingExplorer.astro:111-113`); JS then hides all but **6 per page** (`PER_PAGE = 6`, L158; `c.style.display='none'` L230); pager is `<button>`s, no `?page=` URLs (L237-251). 643 KB HTML. |
| `/rent/` | 383 | **325** | same; 754 KB HTML |
| `/map/` | 658 | **600** | All cards in HTML (`map.astro:109-134`); JS hides those outside the map bounds (L301). 820 KB HTML. |
| `/saved/` | 659 | 600 | **`noindex, nofollow`** — links carry nothing |
| `/localities/:slug/` | ~70-79 | 1–9 (cap `slice(0, 9)`, L111) | Only 110 of 153 localities have pages; Ambli has 54 listings but links 9 |
| `/property/:slug/` | ~70 | **3** ("Similar homes", L241-251) | `getSimilar` returns the 3 newest in the same locality (`data.ts:128-135`) → the same 3 URLs per locality receive every "similar" link; the rest get none |
| `/` | 70 | **3** (featured) | |
| `/services/:key/` | 70 | 3 each | |
| Nav / Footer | 4 locality links in footer (`Footer.astro:62-66`); none to properties | |

Inbound-link distribution for the 600 property pages in raw HTML: 304 pages have exactly 3 inbound (buy-or-rent + map + saved), 111 have 4; maximum 88 (a few "similar" magnets). Discount `/saved/` (nofollow) and the JS-hidden cards on `/buy`, `/rent`, `/map`, and you get Semrush's **1,061 pages with one effective inbound link**. Crawl depth is fine (Semrush issue 212 = 0), but link equity to listings is extremely thin and depends on 600-card pages.

**Flags:** `/buy`, `/rent`, `/map` are server-rendered but **paginated/filtered behind JavaScript with no URL state** — the 319 `?locality=`/`?type=` variants serve byte-identical HTML (title, H1, all cards), which is why Semrush reports 9 duplicate-content pages. There is no locality×type landing page (e.g. "Offices for rent in Thaltej").

Also: `src/scripts/motion.js` + `src/styles/system.css:342` render `.reveal` sections at `opacity:0`, and `.pt-js body { opacity: 0 }` (`system.css:441`) until JS runs. Content is in the DOM so Google indexes it, but a screenshot-based render (and some AI crawlers) sees a blank page if JS fails or times out.

---

## H. Sitemap and robots

`public/robots.txt` (identical live):
```
User-agent: *
Allow: /
Disallow: /cps-admin/

Sitemap: https://cityprop.co.in/sitemap-index.xml
```

**Sitemap:** generated by `@astrojs/sitemap` (`astro.config.mjs:26`) → `sitemap-index.xml` → `sitemap-0.xml`, **749 URLs, all trailing-slash form** (matches canonicals). Includes: home, 600 properties, 110 localities, 21 blog, 7 services, buy/rent/map/sell/consult/guide/about. Excludes only `/privacy-policy/` (filter) and the 3 redirect stubs. **No `<lastmod>`, `<changefreq>` or `<priority>` on any URL**, and no image sitemap despite 1,572 listing photos.

Problems:
- **Three `noindex` pages are in the sitemap:** `/saved/`, `/thanks/`, `/style-guide/`. `/thanks/` and `/style-guide/` have zero inbound links → Semrush's **2 orphaned sitemap pages**.
- **2 blocked pages:** the footer links `/cps-admin/` on every page ("Employee login", `Footer.astro:71`); `/cps-admin/` and `/cps-admin/config.yml` (200 live, publicly readable) are the robots-disallowed hits.
- **1 broken page:** `/style-guide/` links to `/property/iscon-platinum-3bhk`, which no longer exists (404).
- `/uploads/README.md`, `/team/README.txt`, `/images/company-logos/README.txt` are served publicly (200).
- No `llms.txt` (404) — Semrush issue 137.

---

## I. Content volume (rendered, script/style/SVG stripped)

| Page | Words in `<body>` | Words in `<main>` | HTML size | Text/HTML |
|---|---|---|---|---|
| `/property/zion-z1-office-rent-thaltej/` | 410 | 274 | 33 KB | 7.5 % |
| `/property/world-trade-center-office-rent-gift-city/` | 396 | 260 | 32 KB | 7.4 % |
| `/property/whitecraft-ambli/` | 390 | 254 | 35 KB | 6.6 % |
| `/localities/thaltej/` (has listings) | 437 | 301 | 37 KB | 7.1 % |
| `/localities/lapkaman/` (thin) | 256 | 120 | 21 KB | 7.9 % |
| `/blog/` index | 1,061 | 925 | 36 KB | 16.4 % |
| `/blog/<post>/` (typical) | 646 | 510 | 24 KB | 15.2 % |
| `/guide/` | 2,144 | 2,008 | 119 KB | 13.0 % — ~2,000 words sit in `<section hidden>` behind the lead-capture wall (`guide.astro:86`) |
| `/` | 1,856 | 1,720 | 128 KB | 10.8 % |
| `/buy/`, `/rent/`, `/map/` | 7,201 / 8,182 / 10,602 | — | 643 / 754 / 820 KB | 6.4–7.4 % |

Of a property page's ~274 `<main>` words, roughly 130 are template boilerplate. Unique listing text = the `description` array: **median 35 words, min 10, max 78**. Only 269/600 have amenities, 13 have a RERA number, 189 have no photos, 54 have no price. That, plus 30–60 KB of inline scripts and `data-*` attributes per page, is the low text/HTML ratio on 1,031 pages and low word count on 59.

---

## J. What hurts search and AI visibility, ranked by impact

1. **Property pages have no H1, non-unique titles, and the building name appears only in a `<div>`** — 600 pages competing for ~300 title strings. Highest-impact single fix; unique `seoTitle`/`seoDescription` already exist in every JSON file and just aren't wired through `toProperty()`.
2. **~51k internal links 301 to the trailing-slash canonical** — every link leaks a hop; internal PageRank flows through redirects and crawl budget is halved. One setting (`trailingSlash: 'always'`) plus the ~15 hard-coded `href` sites and `PropertyCard`.
3. **Wrong structured-data vocabulary (`Product`/Merchant Listing) for real-estate listings**, with 235 invalid items; no `RealEstateListing`/`Accommodation`, no `@graph`, mixed-slash breadcrumb items, `dateModified` never updates on posts.
4. **Listing discovery depends on three 600-card pages hidden behind JS pagination, plus 319 query-string URLs serving identical content.** No crawlable locality×type or paginated listing URLs; localities cap at 9 property links; "similar" links pile onto the same 3 URLs per locality.
5. **Thin, templated listing content** — median 35 unique words, 189 listings without images, 46 without price, RERA on 13. Also caps what any AI system can say about a listing.
6. **`noindex` pages in the sitemap (`/saved/`, `/thanks/`, `/style-guide/`)**, no `lastmod`, no image sitemap, broken link from `/style-guide/`, `/cps-admin/` and `config.yml` linked/exposed publicly.
7. **`rel="nofollow"` on 2,710 internal `/consult` links** — wasted signal, trivially removable.
8. **Guide content is `hidden` behind a lead wall** — 2,000 words of the site's best buyer/seller copy invisible to ranking weight and AI crawlers.
9. **JS-gated visibility** (`body { opacity:0 }` until `pt-ready`, `.reveal` at opacity 0) — safe for Googlebot, risky for AI crawlers and renderers that don't wait.
10. **No `llms.txt`**, no `dateModified` signals, no FAQ/HowTo content on service or locality pages, `RealEstateAgent` lacks `geo`/`openingHours`/`priceRange` — cheap AI-visibility and local-pack wins.
11. **3-hop meta-refresh legacy redirects** (`/listings`, `/contact`, `/list-property`) — low volume, but should be `_redirects` 301s.
12. Minor: 227 titles over 70 characters (locality pages), 80 flagged as too long by Semrush; `og:image` falls back to the logo for 189 image-less listings.

---

### Semrush issue-ID reconciliation (snapshot `6aad0a62aa87d2849728a642`)

| Semrush issue | Count | Root cause in code |
|---|---|---|
| 6 Duplicate title | 538 | `property/[slug].astro:81` computed title; stored `seoTitle` unused |
| 15 Duplicate meta description | 27 | `property/[slug].astro:84` (no-price listings in same locality) |
| 45 Structured data errors | 235 | 189 Products without `image` + 46 without `offers` |
| 103 Missing H1 | 672 | 600 property pages (`<div class="ttl">`) + `/map/` + 71 `/map?locality=` variants |
| 112 Low text/HTML ratio | 1,031 | boilerplate-heavy pages, inline scripts, data-attrs |
| 117 Low word count | 59 | thin `description` arrays / thin locality pages |
| 123 Nofollow internal links | 1,065 | WhatsApp anchors `href="/consult" rel="nofollow"` |
| 213 Only one internal link | 1,061 | cards hidden by JS pagination; `/saved/` is nofollow |
| 214 Permanent redirects | 100,000 (capped) | no-slash hrefs + Netlify Pretty URLs |
| 7 Duplicate content | 9 | `?locality=`/`?type=` variants of `/buy`, `/rent` |
| 102 Title too long | 80 | locality `seoTitle` strings + brand suffix |
| 4 Blocked from crawling | 2 | `/cps-admin/` linked from footer, disallowed in robots |
| 207 Orphaned sitemap pages | 2 | `/thanks/`, `/style-guide/` (noindex, no inbound links, in sitemap) |
| 137 llms.txt not found | 1 | none at root |
| 1 broken page | 1 | `/style-guide/` → `/property/iscon-platinum-3bhk` (404) |
