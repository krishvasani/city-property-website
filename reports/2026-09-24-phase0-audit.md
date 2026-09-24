# Phase 0 — Audit (no changes made)

**Date:** 2026-09-24 · **Repo:** `~/cps-website` @ `8286b0e` · **Live:** cityprop.co.in (837 URLs in the sitemap)

Nothing has been changed, removed or deployed. This is the audit and the inventory for your review.

**Deliverable:** `~/Downloads/CPS_listing_inventory.csv` (600 rows) — also at `reports/2026-09-24-phase0-listing-inventory.csv`.

---

## 1. Where listings are stored, and the data model

There is no database and no CMS server. Everything is **flat JSON files in the git repo**, compiled to static HTML at build time by Astro and served by Netlify.

```
src/content/properties/<slug>.json      600 files — one per listing.  The slug IS the URL:
                                        anusthan-bungalow-bungalow-245-sale-sola.json
                                        → /property/anusthan-bungalow-bungalow-245-sale-sola/
src/content/projects/shantigram/*.json   14 files — the Adani Shantigram township + 13 project
                                        records built in the last batch (currently noindex drafts)
src/content/blog/*.md                    20 posts
src/data/localities.ts                   153 Ahmedabad/Gandhinagar localities (names, aliases,
                                        coordinates, region, description). Hand-maintained TS, not content.
public/uploads/properties/<slug>/        photo files, referenced by path from the listing JSON
```

**Schema** (`src/content/config.ts`, enforced by Zod at build — a malformed listing fails the build):
identity `title, slug, status (sale|rent|lease), propertyType`; price `priceDisplay, priceValue, pricePer, priceOnRequest, deposit, maintenance, perSqftDisplay`; location `localityName, localitySlug, city, address, geo{lat,lng}`; size `area, areaSqft, carpetArea, builtUpArea, plotSize`; detail `beds, baths, floor, totalFloors, furnishing, parking, facing, age, possession, rera`; commercial/industrial extras `ceilingHeight, powerLoad, loadingAccess, warehouseType, dockAccess, frontage, plotZoning, naStatus, roadWidth`; content `description[], amenities[], suitableFor[], photos[{url,alt,label}], mainImage`; meta `featured, draft, newAt, seoTitle, seoDescription`.

**Editing path:** Decap CMS at `/cps-admin/` writes these same JSON files to GitHub; a Netlify build hook publishes. So "removing a listing" means deleting or archiving a JSON file and redeploying — there is no row to soft-delete in a database, which is why the archive step in your brief matters.

**How a listing becomes pages:** `src/lib/data.ts` reads the collection once per build and every page pulls from it. `propertyType` is mapped to a vertical by `categoryFor()` in `src/lib/format.ts` (residential / commercial / industrial / land / investment) and to a URL word by `TYPE_SLUG` in `src/lib/landing-core.ts` (office-space, shop, showroom, warehouse, flat, bungalow, plot, land).

---

## 2. The classification, and why it is reliable

Your rule "every Shantigram listing is a project, not a unit" already exists in the data: **64 listings carry `suitableFor: ["New project"]`**. I tested this tag against independent signals — price stated as a range, multiple configurations in `beds`, "under construction" in the description, plural title ("Flats" not "Flat"), and absence of a specific `areaSqft`:

- **0** listings tagged `New project` look like individual units.
- **0** untagged residential listings look like projects.

So the tag is a clean classifier and I have used it as the basis for `kind`. No guessing was needed.

| `kind` | Rule | Count | `proposed_action` |
|---|---|---|---|
| `project` | tagged `New project` | 64 | **keep** |
| `warehouse` | `propertyType` = warehouse | 55 | **keep** |
| `industrial` | industrial types | 0 | keep (none exist) |
| `unit` | everything else | 481 | **remove** |

**Keep 119 · Remove 481.**

Of the 64 projects: 13 are Adani Shantigram (all 13, including The North Park villas and The West Park plots, exactly as your brief requires), and 51 are in Ambli and similar — the "Ambli projects" you named. All 55 warehouses are on lease across the Aslali, Vadala, Vasai, Kanera, Changodar, Sanathal, Bavla, Kheda, Moraiya, Pirana, Vavdi, Bhayla, Kamod, Hariyala, Indrad, Kathwada, Miroli, Pinglaj, Rajoda and Sanand belts.

**Removals by type:** office rent 201 · office sale 83 · apartment sale 63 · showroom rent 41 · bungalow sale 25 · showroom sale 23 · plot sale 16 · apartment rent 13 · prelease 8 · bungalow rent 6 · penthouse 1 · commercial rent 1.

There is no `industrial` type in the data today — the industrial inventory is all recorded as `warehouse`. If you hold separate industrial sheds or industrial land, they are not on the site yet.

### 6 rows flagged `REVIEW` in the CSV — I need your call

1. **Aaryan The One, Satellite — 2 showroom listings** (one sale, one rent). These read as a new under-construction project but are typed as showrooms. Your table says showrooms go; your keep column says "new residential and commercial projects" stay. **Keep as a project, or remove?**
2. **The West Park** — a `plot` listing. Kept because your brief names it explicitly as a Shantigram project. Flagged only so you can see the one plot that survives while the other 16 go.
3. **The 3 listings currently flagged "featured" on the homepage** (WestFace office Thaltej, Santoor Farm plot Rancharda, Stellar showroom Bodakdev) are all in the remove set. The homepage featured strip will need three new picks from the keep set.

---

## 3. Every page type that depends on listings

| # | Page type | URLs today | After removal | What happens |
|---|---|---|---|---|
| 1 | `/property/<slug>/` | 600 | **119** | 481 pages go. These need the redirect map in Phase 1. |
| 2 | `/buy/` explorer | 1 | 1 | Cards drop 275 → 64. Type chips for commercial/land/investment become empty. |
| 3 | `/rent/` explorer | 1 | 1 | Cards drop 325 → 55, all warehouses. Page becomes warehouse-only. |
| 4 | `/buy|rent/<type>-in-<locality>/` landing pages | **91** | **16** | 75 pages lose their listings. Survivors: `/buy/flat-in-ambli/` (51), `/buy/flat-in-shantigram/` (11) and 14 warehouse pages. These 75 are ranking pages — they need redirects, not deletion. |
| 5 | `/localities/<slug>/` | 110 | 110 | **48 of the 71 populated localities lose every listing.** Per your brief these stay live as area guides; their market summary, price table and FAQ are all generated from listings, so that content has to be replaced with the enquiry-led version. |
| 6 | `/localities/` index | 1 | 1 | Live counts per locality and per region recalculate. |
| 7 | `/map/` | 1 | 1 | Pins 600 → 119. |
| 8 | `/` homepage | 1 | 1 | Category tiles (residential 171→63, commercial 349→**0**, land 17→1, investment 8→**0**, industrial 55→55), featured strip (all 3 current picks removed), and the "browse by area" module (built from the 91 landing pages → 16). |
| 9 | `/services/*` | 7 | 7 | Each page shows a live count and price range: corporate 285→0, retail →0, residential 171→63, investment →0, land 17→1, industrial-warehouse 55→55. Corporate, retail and investment would show zero. |
| 10 | `/saved/` | 1 | 1 | Reads slugs from the visitor's browser; removed slugs need the friendly note you asked for. |
| 11 | `sitemap-0.xml` | 837 | ~281 | Regenerate with live URLs only. |
| 12 | `llms.txt` / `llms-full.txt` | 2 | 2 | Generated at build; counts and the landing-page list update automatically. |
| 13 | Similar properties | 6 links on each of 600 pages | 6 × 119 | The rotation only picks from live listings, so it self-corrects. |
| 14 | `/projects/adani-shantigram/` + 13 project pages | 14 (noindex drafts) | 14 | Already built, still behind `SHANTIGRAM_LIVE = false`. **These are your project pages** — see the note below. |

No blog post links to a listing, so blog content is unaffected. The source files that read listings are: `data.ts`, `landing.ts`, `landing-core.ts`, `locality-content.ts`, `sitemap-meta.ts`, `PropertyCard`, `SearchBar`, `ServicePage`, and the pages `index`, `buy`, `rent`, `buy/[combo]`, `rent/[combo]`, `localities/[slug]`, `localities/index`, `map`, `property/[slug]`, `saved`, `llms.txt`.

---

## 4. Two things worth settling before Phase 1

**a. We already have two competing homes for Shantigram projects.** The 13 Shantigram listings at `/property/adani-*-shantigram/` are the keep-set project listings. The 14 pages at `/projects/adani-shantigram/…` are the richer project pages built last week (configurations, RERA, floor plans, FAQ), currently noindex. Your brief's project-page spec describes the second. Options: point the old listing URLs at the new project pages with 301s and let `/projects/…` become the canonical home, or fold the new content back into `/property/…` to preserve those URLs exactly. The first is cleaner; the second preserves ranking on URLs that already exist. **This decision shapes the whole redirect map**, so I would like your call before I build `redirects.csv`.

**b. After removal the site is 63 residential projects + 55 warehouses.** `/rent/` becomes warehouse-only and three service pages show zero inventory. Worth deciding now whether corporate, retail and investment service pages stay as enquiry pages or come out of the nav.

---

## STOP

Please review `~/Downloads/CPS_listing_inventory.csv` — correct any `proposed_action`, answer the 6 `REVIEW` rows, and tell me your call on 4(a). Nothing is deleted until you approve, and when we do it, the removals and the redirects ship in the same deploy.
