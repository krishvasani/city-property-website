# SEO Batch 3 — crawlable listing surfaces and internal link distribution

**Date:** 2026-09-19  
**Branch:** `seo/discovery` (off `main` @ `f24cbdd`, which contains batches 1 and 2 merged). Changes are on the working tree, **not committed**.  
**Untouched, as instructed:** `/buy/`, `/rent/`, `/map/` explorers and their client-side filtering.

---

## Results at a glance

| Metric | Before (batch 2 build) | After |
|---|---|---|
| Built pages | 751 | **811** (+60 landing pages) |
| Sitemap URLs | 746 | **806** (all with `lastmod`; 1,983 image entries, was 1,660) |
| Inbound links per property page — min / median / max | 2 / 2 / 87 | **3 / 10 / 16** |
| Property pages with < 3 inbound links | **304** | **0** |
| Locality × type landing pages | 0 | **60** (473 of 600 listings appear on one) |
| Locality page listing cap | 9 cards | none (Ambli: 87 cards, grouped by type, 3 landing links) |
| "Similar" links per property page | 3, always the 3 newest in the locality | 6, seeded rotation (median 6 inbound from similar blocks) |
| Guide page | 2,141 words, 1,485 visible, 656 gated in `<section hidden>`, 11.0 % text/HTML | **2,126 words, 0 hidden, 14.5 % text/HTML** |
| JS-off render (4 page types) | `.reveal` sections at `opacity:0`; guide 30 % hidden | **all content visible, nothing hidden** |
| Property title sources (stored / generated) | 314 / 286 | **76 / 524** (mean length 56.3) |
| Property description sources | 591 stored / 9 generated | **97 stored / 96 stored+extended / 407 generated** (mean 138.3) |
| Guards | — | check-trailing-slash 63,736 links, 0 bad · check-seo-meta 806 indexable, 0 problems · 769/769 graphs validate |

---

## 1. Title and description rule change

[`src/lib/seo.ts`](../src/lib/seo.ts) `resolvePropertySeo()`:
- stored `seoTitle` wins only when unique **and 45–60 chars** (`STORED_TITLE_MIN/MAX`);
- stored `seoDescription` wins only when unique **and ≥ 110 chars**; a unique-but-short one is extended by `extendDescription()` appending, in order, a price clause (`Priced at ₹65 / sq.ft per month.`), an area clause (`2,972 sq.ft office space for rent in Thaltej.`) and the CTA, stopping once the text is in the 140–155 band; if no combination reaches 140 it falls back to the generated form.

New split across 600 property pages:

| | stored | stored+extended | generated | mean length |
|---|---|---|---|---|
| Title | 76 | — | 524 (incl. disambiguated) | **56.3** chars |
| Description | 97 | 96 | 407 | **138.3** chars |

Titles: 600 distinct, max 65. Descriptions: 600 distinct, max 155.

## 2. Locality × type landing pages

**URL:** `/{buy|rent}/{type-slug}-in-{locality-slug}/` — e.g. `/rent/office-space-in-thaltej/`, `/buy/flat-in-ambli/`. `buy` = `status: sale`; `rent` = `rent` + `lease` (mirrors the `/rent/` page).

**Type-slug mapping** (`TYPE_SLUG` in [`src/lib/landing-core.ts`](../src/lib/landing-core.ts)):

| propertyType | slug | label |
|---|---|---|
| office, commercial | `office-space` | Office Space |
| shop, retail | `shop` | Shop |
| showroom | `showroom` | Showroom |
| warehouse, warehousing | `warehouse` | Warehouse |
| industrial, industrial shed | `industrial-shed` | Industrial Shed |
| apartment, flat, penthouse, residential | `flat` | Flat |
| bungalow, villa, house, row house | `bungalow` | Bungalow |
| plot, residential land, commercial land | `plot` | Plot |
| land, industrial land | `land` | Land |
| investment | *(none — 8 pre-leased showrooms; not a locality search phrase)* | |

**Combination size distribution** (148 combos over 592 eligible listings; threshold ≥ 3):

| listings in combo | 1 | 2 | 3–5 | 6–10 | 11+ |
|---|---|---|---|---|---|
| combos | 57 | 31 | 30 | 19 | 11 |

→ **60 pages** built (30 + 19 + 11), covering **473 / 600 listings**. Lowering the threshold to 2 would add 31 pages (62 listings); to 1, another 57 single-listing pages. Pages by side/type: rent/office-space 17, buy/office-space 14, rent/warehouse 8, buy/flat 7, rent/showroom 5, buy/bungalow 3, buy/showroom 3, rent/flat 2, buy/plot 1. Largest: `/buy/flat-in-ambli/` (54), `/rent/office-space-in-sg-highway/` (27), `/rent/office-space-in-vastrapur/` (25).

**Page anatomy** ([`LandingPage.astro`](../src/components/LandingPage.astro), content from [`landing.ts`](../src/lib/landing.ts)), in this order:
1. Breadcrumb nav, eyebrow (region · micro-market), **H1** `{Type} for {Sale|Rent} in {Locality}, Ahmedabad`.
2. Intro paragraph 1 — listing count, price range in the listings' own units (per-sq-ft rentals stay per sq ft; sale prices in Cr/L; ranges when the set mixes), size range, buildings with availability (max 5 named). Paragraph 2 — the locality dataset's own description (2 sentences) and connectivity. No invented claims.
3. Summary table — listings, price range (+ "n on request"), size range, typical price (median ₹/sq ft, with the sample size stated).
4. **All** listing cards (`PropertyCard`), no cap, no JS hiding — 3 to 54 per page.
5. Sibling links — other types with a page in the same locality (+ the locality page), and the same type in the **6 nearest** localities that have a page (nearest = dataset `nearbyAreas` first, then centroid distance). Anchor text is the full page name.
6. FAQ, 4–6 questions answered from the data (cost, sizes, buildings, count/photos/newest date, connectivity, opposite side) — marked up as `FAQPage`.
7. Lead form (`viewing`, with landing context fields) + call / WhatsApp CTA.

**Schema** (folded into the single `@graph` by `Base.astro`): `CollectionPage` (`#page`, mainEntity → list, about → locality Place, `dateModified` = newest `newAt`), `ItemList` (`#list`, `numberOfItems`, each `ListItem` with `url` and `item: {"@id": "…/property/x/#listing"}` — a cross-page reference to the node published on the listing page), locality `Place`, `FAQPage` (`#faq`), `BreadcrumbList` Home › Buy/Rent › Locality › page. The validator was extended to accept `@id` references to nodes on other pages of the site; **60/60 pass**.

**Meta:** titles 33–49 chars, no brand suffix; descriptions **141–155 chars** (built from clauses: count/type/locality → price range → size range → buildings → CTA, then padded from the locality description only if still < 140); all pass `check-seo-meta` with **no allowlist entry** (allowlist matching was tightened to exact paths / explicit `*` prefixes so `/rent/` no longer covers `/rent/…/`).

## 3. Locality page link cap

[`localities/[slug].astro`](../src/pages/localities/[slug].astro): `slice(0, 9)` removed. Listings are grouped by type slug (office spaces, showrooms, shops, warehouses, industrial sheds, flats, bungalows, plots, land, other) with an `h3` per group, a jump-link row, and a button per group linking to each existing landing page for that type (Buy and/or Rent). Ambli renders 87 cards in 3 groups with 3 landing links.

## 4. Similar-properties rotation

[`data.ts` `getSimilar()`](../src/lib/data.ts): listings in the same locality are sorted by slug; the current listing's index seeds the rotation, and the next 6 in cyclic order are shown, filled from the rest of the site (rotated by the listing's global index) when the locality has fewer than 7 listings. Deterministic, no randomness between builds.

Inbound links per property page (distinct indexable source pages, all sources — landing, locality, similar, hubs):

| | min | median | max | pages < 3 |
|---|---|---|---|---|
| Before | 2 | 2 | 87 | 304 |
| **After** | **3** | **10** | **16** | **0** |

Distribution after: 3 ×13, 4 ×13, 5 ×7, 6 ×13, 7 ×11, 8 ×14, 9 ×38, 10 ×274, 11 ×135, 12 ×58, 13 ×21, 14 ×2, 16 ×1. From "similar" blocks alone: min 0 (16 listings in one-listing localities), median 6, max 10 — versus the previous pattern where the 3 newest per locality absorbed every link.

## 5. Listing discovery from the homepage

[`SearchBar.astro`](../src/components/SearchBar.astro) now embeds a JSON map (`#hero-landings`, 42 routes) of `{side}|{locality}|{category}` → landing path, built at render time. On submit, when a locality **and** a type are chosen, no budget filter is set, and **exactly one** landing page of that category exists for the locality (e.g. Rent + Thaltej + Commercial when offices are the only commercial type with a page there), the form navigates straight to that page. Ambiguous (Buy + Thaltej + Commercial where both office and showroom pages exist), unmatched, or budget-filtered searches keep the existing `/buy/?locality=…` behaviour. Markup and design unchanged.

## 6. Sitemap

[`sitemap-meta.ts`](../src/lib/sitemap-meta.ts) reuses `pageCombos()` on the raw JSON: 60 landing URLs, `lastmod` = newest listing in the set (`newAt` or git date, whichever is later), `<image:image>` = first photo of each listing shown. Sample: `/rent/office-space-in-thaltej/` lastmod `2026-08-19T07:18:56Z`, 4 images. Total 806 URLs / 806 lastmod / 1,983 images. (Note: the page's `CollectionPage.dateModified` uses `newAt` only — 2026-06-18 here — because the page can't see git dates; both are true "last changed" signals, the sitemap's being the later.)

## 7. Guide wall — removed

[`guide.astro`](../src/pages/guide.astro): the `.wall` section, the `hidden` attribute on the content, the seller panel's `hidden` toggle and the unlock script are gone. Both guides render stacked (`#buyer`, `#seller`) with the toggle turned into anchor jump links (the IntersectionObserver only highlights the active one). The lead form is now an ordinary inline block at the end of the page ("Want this tailored to your plans?"); nothing is gated.

| | Before | After |
|---|---|---|
| Words in HTML | 2,141 (1,485 visible + 656 in `<section hidden>`) | **2,126, all visible** |
| HTML size | 121 KB | 120 KB |
| Text/HTML ratio | 11.0 % (visible text) | **14.5 %** |

## 8. JavaScript render gating

[`system.css`](../src/styles/system.css) / [`motion.js`](../src/scripts/motion.js) / [`Base.astro`](../src/layouts/Base.astro):
- `.reveal { opacity: 0 }` is now `.motion-ready .reveal { opacity: 0 }` — hidden **only** after JS adds `motion-ready` to `<html>`. Before adding the class, `motion.js` marks every `.reveal` element already in the viewport as `.in`, so on-screen content never flashes; only off-screen sections animate as they scroll in. Reduced-motion users get everything visible with no transitions.
- The page-entry fade no longer depends on a `pt-ready` class set after `DOMContentLoaded` + rAF. It is a pure CSS animation (`ptIn` / `ptRise`) gated on `.pt-js` **and** `prefers-reduced-motion: no-preference`, so it always ends at `opacity: 1` on its own; the head failsafe script is reduced to one line. Only the exit fade uses a class.
- Base state with no JS: nothing is hidden anywhere. (`hero-anim` and `[data-stagger]` were already CSS-only / JS-gated respectively.)

**Verification with JS disabled.** Chrome's `--disable-javascript` flag is a no-op in current builds (the DOM still showed `pt-js motion-ready`), so the four pages were rendered from copies with every `<script>` removed — exactly what a non-executing crawler receives:

| page | `<html class>` | words in DOM | hidden sections | `.reveal` blocks | listing cards |
|---|---|---|---|---|---|
| `/` | (none) | 1,853 | 0 | 6 — all visible | 3 |
| `/property/whitecraft-ambli/` | (none) | 444 | 0 | 6 — all visible | 6 |
| `/rent/office-space-in-thaltej/` | (none) | 838 | 0 | 0 | 11 |
| `/guide/` | (none) | 2,126 | 0 | 0 | — |

Screenshots of the script-free renders (property page with About / Additional details / EMI / form all visible; landing page with intro, table and cards; guide fully open) are in this session's scratchpad (`nojs-property.png`, `nojs-landing.png`, `nojs-guide.png`, `nojs-index.png`).

---

## Verification output

```
[postbuild] sitemap: 806 URLs, 806 with <lastmod>, 1983 image entries
[check-trailing-slash] 63736 internal links scanned, 0 without trailing slash
[check-seo-meta] 812 pages (806 indexable): 806 distinct titles, 806 distinct descriptions,
  806 with exactly one h1; longest title 94 chars, longest description 191 chars; 0 problem(s);
  164 length issue(s) on allowlisted pages (scripts/seo-meta-allowlist.json — tech debt)
validate-jsonld: 769 PASS / 0 FAIL (60 landing + 600 property + 109 locality pages)

combination size distribution: { '1': 57, '2': 31, '3-5': 30, '6-10': 19, '11+': 11 } | total combos: 148
pages (>=3 listings): 60 | listings covered by a landing page: 473 of 600
listings excluded: investment type = 8, locality not in dataset = 0

pages: 751 → 811 | sitemap URLs: 746 → 806 | landing pages: 60
inbound per property page: BEFORE min 2 median 2 max 87 (<3: 304) → AFTER min 3 median 10 max 16 (<3: 0)
guide: BEFORE 2141 words (656 hidden), 11.0 % → AFTER 2126 words (0 hidden), 14.5 %
```

### Landing page `/rent/office-space-in-thaltej/`
```
H1: Office Space for Rent in Thaltej, Ahmedabad
Title (43): Office Space for Rent in Thaltej, Ahmedabad
Description (149): 11 office spaces for rent in Thaltej, Ahmedabad, from ₹35 to ₹65 / sq.ft per month, sizes 928 to 11,331 sq.ft. Compare, shortlist and book a viewing.
words 837 (697 in <main>) | 51 KB | text/html 11.8 % | 11 listing cards | 6 h2 | 6 FAQ items
```
Intro: *City Property Services currently lists 11 office spaces for rent in Thaltej, Ahmedabad. Asking prices run from ₹35 to ₹65 / sq.ft per month. Sizes range from 928 to 11,331 sq.ft. Buildings with current availability include Krish Cubical, Magnet Corporate Park, Maple Trade Centre, Shreeya Amalga, Titanium Square and 2 more.* / *Thaltej is a premium apartments area in West Ahmedabad, Ahmedabad. The area is reached via SG Highway and Sindhu Bhavan Road.*

Summary table: Listings 11 office spaces for rent · Price range ₹35 to ₹65 / sq.ft per month · Size range 928 to 11,331 sq.ft · Typical price ₹55 per sq.ft per month (median of 7).

Sibling links: Bungalow for Sale in Thaltej, Flat for Sale in Thaltej, Office Space for Sale in Thaltej, Flat for Rent in Thaltej, Showroom for Rent in Thaltej, All property in Thaltej · Office Space for Rent in Bodakdev / Shilaj / SG Highway / Satellite / Vastrapur / Ambli.

Full `@graph` (page nodes; the four sitewide nodes are unchanged from batch 2):
```json
[
 {"@type":"BreadcrumbList","@id":"https://cityprop.co.in/rent/office-space-in-thaltej/#breadcrumb","itemListElement":[
  {"@type":"ListItem","position":1,"name":"Home","item":"https://cityprop.co.in/"},
  {"@type":"ListItem","position":2,"name":"Rent","item":"https://cityprop.co.in/rent/"},
  {"@type":"ListItem","position":3,"name":"Thaltej","item":"https://cityprop.co.in/localities/thaltej/"},
  {"@type":"ListItem","position":4,"name":"Office Space for Rent in Thaltej, Ahmedabad","item":"https://cityprop.co.in/rent/office-space-in-thaltej/"}]},
 {"@type":"CollectionPage","@id":"https://cityprop.co.in/rent/office-space-in-thaltej/#page","url":"https://cityprop.co.in/rent/office-space-in-thaltej/",
  "name":"Office Space for Rent in Thaltej, Ahmedabad",
  "description":"11 office spaces for rent in Thaltej, Ahmedabad, from ₹35 to ₹65 / sq.ft per month, sizes 928 to 11,331 sq.ft. Compare, shortlist and book a viewing.",
  "isPartOf":{"@id":"https://cityprop.co.in/#website"},"about":{"@id":"https://cityprop.co.in/localities/thaltej/#place"},
  "mainEntity":{"@id":"https://cityprop.co.in/rent/office-space-in-thaltej/#list"},"dateModified":"2026-06-18"},
 {"@type":"ItemList","@id":"https://cityprop.co.in/rent/office-space-in-thaltej/#list","name":"Office Space for Rent in Thaltej, Ahmedabad","numberOfItems":11,"itemListOrder":"https://schema.org/ItemListUnordered",
  "itemListElement":[
   {"@type":"ListItem","position":1,"url":"https://cityprop.co.in/property/krish-cubical-2266-office-rent-thaltej/","item":{"@id":"https://cityprop.co.in/property/krish-cubical-2266-office-rent-thaltej/#listing"}},
   {"@type":"ListItem","position":2,"url":"https://cityprop.co.in/property/krish-cubical-6000-office-rent-thaltej/","item":{"@id":"https://cityprop.co.in/property/krish-cubical-6000-office-rent-thaltej/#listing"}},
   {"@type":"ListItem","position":3,"url":"https://cityprop.co.in/property/magnet-corporate-park-office-rent-thaltej/","item":{"@id":"https://cityprop.co.in/property/magnet-corporate-park-office-rent-thaltej/#listing"}},
   {"@type":"ListItem","position":4,"url":"https://cityprop.co.in/property/maple-trade-centre-2995-office-rent-thaltej/","item":{"@id":"https://cityprop.co.in/property/maple-trade-centre-2995-office-rent-thaltej/#listing"}},
   {"@type":"ListItem","position":5,"url":"https://cityprop.co.in/property/maple-trade-centre-office-rent-thaltej/","item":{"@id":"https://cityprop.co.in/property/maple-trade-centre-office-rent-thaltej/#listing"}},
   {"@type":"ListItem","position":6,"url":"https://cityprop.co.in/property/shreya-amalga-1720-office-rent-thaltej/","item":{"@id":"https://cityprop.co.in/property/shreya-amalga-1720-office-rent-thaltej/#listing"}},
   {"@type":"ListItem","position":7,"url":"https://cityprop.co.in/property/titanium-square-928-office-rent-thaltej/","item":{"@id":"https://cityprop.co.in/property/titanium-square-928-office-rent-thaltej/#listing"}},
   {"@type":"ListItem","position":8,"url":"https://cityprop.co.in/property/westport-11331-office-rent-thaltej/","item":{"@id":"https://cityprop.co.in/property/westport-11331-office-rent-thaltej/#listing"}},
   {"@type":"ListItem","position":9,"url":"https://cityprop.co.in/property/westport-5940-office-rent-thaltej/","item":{"@id":"https://cityprop.co.in/property/westport-5940-office-rent-thaltej/#listing"}},
   {"@type":"ListItem","position":10,"url":"https://cityprop.co.in/property/zion-z1-office-rent-thaltej/","item":{"@id":"https://cityprop.co.in/property/zion-z1-office-rent-thaltej/#listing"}},
   {"@type":"ListItem","position":11,"url":"https://cityprop.co.in/property/krish-cubical-office-rent-thaltej/","item":{"@id":"https://cityprop.co.in/property/krish-cubical-office-rent-thaltej/#listing"}}]},
 {"@type":"Place","@id":"https://cityprop.co.in/localities/thaltej/#place","name":"Thaltej, Ahmedabad","url":"https://cityprop.co.in/localities/thaltej/",
  "address":{"@type":"PostalAddress","addressLocality":"Thaltej","addressRegion":"Gujarat","addressCountry":"IN"},"geo":{"@type":"GeoCoordinates","latitude":23.047,"longitude":72.505}},
 {"@type":"FAQPage","@id":"https://cityprop.co.in/rent/office-space-in-thaltej/#faq","mainEntity":[
  {"@type":"Question","name":"How much does an office space cost to rent in Thaltej?","acceptedAnswer":{"@type":"Answer","text":"Current asking prices for office spaces for rent in Thaltej run from ₹35 to ₹65 / sq.ft per month across 11 priced listings; the typical rate is ₹55 per sq.ft per month (median of 7)."}},
  {"@type":"Question","name":"What sizes of office spaces are available for rent in Thaltej?","acceptedAnswer":{"@type":"Answer","text":"The 11 listings on this page range from 928 to 11,331 sq.ft, so there are options for both compact and larger requirements."}},
  {"@type":"Question","name":"Which buildings in Thaltej have office spaces for rent?","acceptedAnswer":{"@type":"Answer","text":"Listings on this page are in Krish Cubical, Magnet Corporate Park, Maple Trade Centre, Shreeya Amalga, Titanium Square, Westport and Zion Z1. Availability changes, so contact us for the latest."}},
  {"@type":"Question","name":"How many office spaces are listed for rent in Thaltej right now?","acceptedAnswer":{"@type":"Answer","text":"11 listings are live, 4 with photos; the most recent was added on 18 June 2026. Every listing is handled directly by City Property Services."}},
  {"@type":"Question","name":"How well connected is Thaltej?","acceptedAnswer":{"@type":"Answer","text":"Thaltej is reached via SG Highway and Sindhu Bhavan Road. Thaltej is a premium apartments area in West Ahmedabad, Ahmedabad."}},
  {"@type":"Question","name":"Can I also buy office spaces in Thaltej?","acceptedAnswer":{"@type":"Answer","text":"Yes. City Property Services lists 6 office spaces for sale in Thaltej; see Office Space for Sale in Thaltej at https://cityprop.co.in/buy/office-space-in-thaltej/."}}]}
]
```

---

## Diff summary

18 files changed, +827 / −138 (excluding `reports/`).

New: `src/lib/landing-core.ts` (combos, stats, neighbours — pure), `src/lib/landing.ts` (page content + schema), `src/components/LandingPage.astro`, `src/pages/buy/[combo].astro`, `src/pages/rent/[combo].astro`.  
Modified: `src/lib/seo.ts` (item 1), `src/lib/data.ts` (getSimilar rotation), `src/pages/property/[slug].astro` (similar count 6), `src/pages/localities/[slug].astro` (no cap, grouped, landing links), `src/components/SearchBar.astro` (landing routing), `src/lib/sitemap-meta.ts` (landing URLs), `src/pages/guide.astro` (wall removed), `src/styles/system.css` + `src/scripts/motion.js` + `src/layouts/Base.astro` (additive animation), `scripts/check-seo-meta.mjs` + `scripts/seo-meta-allowlist.json` (exact-match allowlist), `scripts/validate-jsonld.mjs` (cross-page `@id` refs).

## Notes / follow-ups

- The 164 allowlisted length issues (locality/blog/service/home titles with the brand suffix) remain for the template batch.
- Threshold revisit: 31 combos have exactly 2 listings (mostly single-building pairs); the distribution table above is the input for that decision.
- The hero-search shortcut covers 42 unambiguous (side, locality, category) routes; the ambiguous cases (a locality with both office and showroom pages, for example) could get a category hub page later.
- 127 listings are on no landing page (investment type, or their combo has < 3 listings); they still have ≥ 3 inbound links via locality pages and the similar rotation.
