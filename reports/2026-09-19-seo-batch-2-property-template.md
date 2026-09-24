# SEO Batch 2 — property titles, H1, descriptions and structured data

**Date:** 2026-09-19  
**Branch:** `seo/property-template` (off `main` @ `c38d9a5`, which now contains batch 1 merged via `--no-ff`). Changes are on the working tree, **not committed**.  
**Scope honoured:** property template, `Base.astro` (sitewide schema / OG / brandSuffix), `/map/` H1, data layer, build guards. Locality, service and blog templates untouched (their JSON-LD is folded into the new single `@graph` by `Base.astro` without editing them).

---

## Results at a glance

| Check (600 property pages) | Before | After |
|---|---|---|
| Distinct `<title>` | 311 (538 dupes) | **600** |
| Distinct meta description | 573 (27 dupes) | **600** |
| Pages with exactly one `<h1>` | 0 | **600** |
| Brand suffix in property titles | 600 | 0 |
| Longest title / description | 63 / 158 | **65 / 155** |
| Titles ≤ 60 chars | — | 527 (73 disambiguated ones run 61–65) |
| JSON-LD blocks per page | 4 separate | **1 `@graph`** (8–9 nodes, all with `@id`) |
| `Product` / `brand` / anonymous Organization nodes | 600 pages | **0** |
| Property graphs passing the schema.org validator | — | **600 / 600** |
| OG image = company logo (no-photo listings) | 189 | 0 → category fallback (156 commercial, 20 residential, 12 land, 1 investment) |
| `og:image:width/height/alt` | none | on all 750 Base-rendered pages |
| `/map/` H1 | missing (+71 `?locality=` variants) | present |
| Site-wide (746 indexable pages) | — | 746 distinct titles, 746 distinct descriptions, 746 with one H1 |

---

## 1. H1 on property pages

[`property/[slug].astro`](../src/pages/property/[slug].astro): `<div class="ttl">` → `<h1 class="ttl">`. The global `h1` rule (44px display) is overridden in the page's own style block so it renders exactly as before (19px / 600 / `--ink`); screenshot-checked. Heading outline below it is unchanged: `h2` "Similar homes nearby", `h3` for About / Amenities / Additional details / Location / contact card.

Format (`propertyH1()` in [`src/lib/seo.ts`](../src/lib/seo.ts)): `{Building} · {Area} {Type} for {Sale|Rent|Lease} in {Locality}, Ahmedabad`; no building → `{Area} {Type} for … in {Locality}, Ahmedabad`; trailing segments (", Ahmedabad", then " in {Locality}") dropped only past 90 chars. Longest H1 = 90 chars. `{Area}` is the listing's `area` (with "super built up"/"carpet" suffixes stripped) or `{n} BHK` when only bedrooms are known.

Building name is derived from the authored title pattern `"{descriptor} · {Building}, {Locality}"` (545 listings); the 55 warehouse-belt listings ("Warehouse - Aslali (13,200 sq.ft)") and 9 locality-only tails have none.

Guard confirms exactly one `<h1>` on every indexable page site-wide (746/746).

## 2. Unique titles

- `toProperty()` now copies `seoTitle` / `seoDescription` onto `Property` ([`data.ts`](../src/lib/data.ts), [`types.ts`](../src/lib/types.ts)). A cached `getPropertySeo(slug)` resolves H1/title/description for all 600 at once (`resolvePropertySeo()`), so uniqueness is decided site-wide, not per page.
- Resolution order as specified: generated `{Building}, {Locality}, Ahmedabad · {Area} {Type} for {Status}` with right-to-left drops (Ahmedabad → area → building truncated at a word boundary, never leaving an unbalanced "("); stored `seoTitle` wins when unique among stored values, < 60 chars, and not colliding with anything else.
- Outcome: **314 stored, 258 generated, 28 generated + disambiguated**. Disambiguation (same building, same type, same status) appends the most meaningful tag not already present — floor → price → area → slug number — and regenerates the base with a tighter budget so segments are dropped rather than words cut (e.g. `Sankalp Square 3A, Bodakdev · Office Space for Rent · ₹45 / sq.ft`).
- One deliberate deviation: stored titles that already carried `| City Property Services` (334 of them) have the suffix stripped before the length/uniqueness test, since (c) removes the brand suffix from property pages — otherwise those 334 would have shown the brand while the rest didn't.
- `brandSuffix` prop added to `Base.astro` (default `true`); property page passes `false`. 0 property titles contain the brand.

## 3. Unique descriptions

Stored `seoDescription` used when unique and ≤ 155 chars (**591**); the rest generated (**9**): `{Building} in {Locality}, Ahmedabad. {Area} {Type} for sale/rent/lease at {priceDisplay} {pricePer}. {First sentence of description | top two amenities}. Contact City Property Services to arrange a viewing.` — built as the longest variant that fits 155 (detail sentence dropped first, then the CTA shortened), word-boundary cut as last resort. Price-on-request listings omit the price clause entirely. Longest = 155 chars, 0 over.

## 4. Build guard

[`scripts/check-seo-meta.mjs`](../scripts/check-seo-meta.mjs), wired in `package.json`:
```
"build": "astro build && node scripts/postbuild.mjs && node scripts/check-trailing-slash.mjs && node scripts/check-seo-meta.mjs"
```
Fails (exit 1) on indexable pages with h1 ≠ 1, duplicate titles, duplicate descriptions, title > 65 or description > 160. Prints counts on every build.

**Allowlist (please read):** the first run found **164 length violations, all on out-of-scope templates** — 109 locality titles (`… | City Property Services` pushes them to 73–94 chars), 19 blog titles, 5 service titles, home/rent titles, and 25 descriptions (locality index, services, about, home). Rather than touch those templates or silently weaken the rule, [`scripts/seo-meta-allowlist.json`](../scripts/seo-meta-allowlist.json) exempts those path prefixes from the **length** rule only (H1 and uniqueness still apply everywhere). The build log prints `164 length issue(s) on allowlisted pages … tech debt` on every build until the next batch fixes them and the entries are removed. All 600 property pages pass with no exemption.

## 5. Structured data rebuild

`Base.astro` now emits **one** `<script type="application/ld+json">` containing `{"@context": "https://schema.org", "@graph": [...]}`. Sitewide nodes: `RealEstateAgent`, `Person` (founder), `Organization` (CIRIL), `WebSite`, optional `BreadcrumbList`; page nodes are appended (nodes passed by other templates get an `@id` assigned if missing, so locality/blog/service pages joined the graph without edits).

Property page nodes ([`propertyGraph()`](../src/lib/seo.ts)):

| Node | `@id` | Notes |
|---|---|---|
| `RealEstateListing` | `{url}#listing` | url, mainEntityOfPage, name (= H1), description, datePosted (`newAt`), image (all photos, absolute), provider → org, isPartOf → website, **spatialCoverage** → locality Place, mainEntity → unit |
| `Apartment` / `SingleFamilyResidence` / `Place` / `Accommodation` | `{url}#property` | chosen by `propertyType`; `additionalType` on Accommodation: office → wikidata Q182060, showroom/investment → Q2094773, shop/retail → Q213441, warehouse → Q181623, industrial → Q1662011 (all labels verified against Wikidata). address (streetAddress = building/road part of the address field, addressLocality, Gujarat, IN, postalCode when present), geo, containedInPlace → locality, floorSize `QuantitativeValue` (FTK for sq ft; sq yd gets `unitCode: YDK` + `unitText: "sq yd"`), numberOfRooms / numberOfBathroomsTotal (residential only), amenityFeature as `LocationFeatureSpecification`, yearBuilt, floorLevel |
| `Place` (locality) | `{site}/localities/{slug}/#place` | name, url, address, geo (centroid), containedInPlace City Ahmedabad |
| `Offer` | `{url}#offer` | omitted entirely for the 54 price-on-request listings |
| `BreadcrumbList` | `{url}#breadcrumb` | all `item` URLs trailing-slash form (validator enforces) |

Two places where the letter of the spec was not valid schema.org and I chose the valid equivalent:
- **`containedInPlace` on the listing** — `RealEstateListing` is a `WebPage`; `containedInPlace` is Place-only and the validator rejected it. The listing uses `spatialCoverage` (CreativeWork property, the correct way to say "this page is about this place"); the Accommodation node carries `containedInPlace`.
- **Plot `floorSize`** — plots are plain `Place` nodes, which have no `floorSize`; the area is exposed as `additionalProperty: PropertyValue{name:"Plot area", value, unitCode, unitText}`.

Also note: `Offer.itemOffered → Accommodation` is the standard pattern for real-estate offers even though schema.org's declared range for `itemOffered` doesn't list Accommodation; the schema.org validator does not flag range mismatches and Google ignores it. The Offer is a standalone graph node linked by `@id` rather than an `offers` property on the listing (which `RealEstateListing` doesn't have).

### Price construction (item 5, CRITICAL)

The rule: markup price = the price printed on the page, never a derived figure.

- **Sale, single price** (`₹1.59 Cr`): `Offer.price: 15950000`, `priceCurrency: INR`.
- **Sale, range** (`₹5.1 to 6.8 Cr`, 37 listings): `priceSpecification: PriceSpecification{minPrice: 51000000, maxPrice: 68000000}` — no single `price`, because the page shows a range.
- **Rent/lease per sq ft** (`₹65 / sq.ft per month`, 206 listings) — the previous markup put the derived monthly total (₹1,93,180) here. Now:
  ```json
  "priceSpecification": {
    "@type": "UnitPriceSpecification",
    "price": 65, "priceCurrency": "INR",
    "unitCode": "FTK", "unitText": "per sq.ft per month",
    "referenceQuantity": { "@type": "QuantitativeValue", "value": 1, "unitCode": "FTK" },
    "billingDuration":   { "@type": "QuantitativeValue", "value": 1, "unitCode": "MON" }
  }
  ```
  Why this construction: `UnitPriceSpecification` is schema.org's type for "price per unit"; `unitCode: FTK` (UN/CEFACT square foot) plus `referenceQuantity` 1 FTK states the *per-unit* basis unambiguously (some consumers read one, some the other), and `billingDuration` 1 MON is the schema.org 2021 property for recurring charges, giving "per month" without inventing a total. `unitText` carries the human reading. Nothing on the page (₹65 / sq.ft) is contradicted.
- **Rent/lease monthly total** (`₹2,25,000 per month`): `UnitPriceSpecification{price: 225000, unitText: "per month", billingDuration: 1 MON}`.
- **Price on request** (54): no Offer node.

`businessFunction` = `gr:Sell` for sale, `gr:LeaseOut` for rent and lease; `seller → #organization`; `availability: InStock`.

### Validator

[`scripts/validate-jsonld.mjs`](../scripts/validate-jsonld.mjs) (dev tool, not in the build; vocabulary cached in `.cache/`, gitignored) checks: one block, valid JSON, single `@graph`; every node has `@type` + unique `@id`; every `{"@id"}` reference resolves inside the graph; every `@type` exists in the **live schema.org vocabulary**; every property exists and is declared (`domainIncludes`) on the node's type or a supertype; Google BreadcrumbList rules; Offer carries a real price construction. Its first run caught three genuine errors (logo `@id` reference, `containedInPlace` on the listing, `floorSize` on Place) which are fixed above.

**Results** — the required six variants plus a plot and the four other templates:
```
PASS  /property/whitecraft-ambli/                     sale + photos + range price, Apartment, numberOfRooms 4
PASS  /property/zion-z1-office-rent-thaltej/          rent ₹65/sq.ft, Accommodation(office), no photos     warn: no image
PASS  /property/warehouse-vasai-43000-lease/          lease, price on request                              warn: no Offer
PASS  /property/ratnakar-artesia-ambli/               sale, price on request, photos, Apartment            warn: no Offer
PASS  /property/3rd-eye-vision-office-rent-ambawadi/  rent ₹55/sq.ft, no photos                            warn: no image
PASS  /property/26-samarpan-bungalow-bodakdev/        rent monthly total, SingleFamilyResidence, 5 rooms
PASS  /property/shilpgram-3-plot-534-sale-lapkaman/   plot → Place + additionalProperty (sq yd)            warn: no image
PASS  /  /blog/…/  /localities/thaltej/  /services/corporate/
All 600 property pages: 600 PASS, 0 FAIL (warnings only: 189 no-photo, 54 no-offer).
```

## 6. Organisation schema

Rendered `RealEstateAgent` (every page): E.164 `telephone` (`+919824900778`, derived from config), `geo` 23.051225 / 72.492735 (Zion Prime, Thaltej-Shilaj Road — Mappls listing), `hasMap` Google Maps search URL, `openingHours`, `priceRange`, `logo` as `ImageObject` (1699×925, read from the file), `image`, `founder`/`employee` → `Person` Mukesh Vasani, `foundingDate: "1999"`, `memberOf` → CIRIL `Organization` node, `areaServed` Ahmedabad (wikidata Q1070) and Gandhinagar (Q11910) as `City` nodes with `@id`, `knowsAbout` for the seven verticals, RERA as `identifier`, `sameAs` Instagram/LinkedIn. No `aggregateRating`.

**Three values need your confirmation** (flagged in [`config.ts`](../src/lib/config.ts) and here, not blocking):
1. **foundingDate 1999** — the About page does not state a year; the homepage says "over 27 years" (2026 − 27 = 1999). If the firm started earlier ("over"), change the string in `Base.astro:98`.
2. **openingHours `Mo-Sa 10:00-19:00`** — not published anywhere on the site; assumed. Edit `contact.office.openingHours`.
3. **Postal code** — the site's address says `380052`, but Mappls lists Zion Prime under `380059` (the usual Thaltej PIN). Left as 380052 for consistency with the visible footer; worth checking.

## 7. OG image fallback

Five branded 1200×630 PNGs generated in [`public/images/og/`](../public/images/og/) (navy brand palette, white logo, category headline, phone/RERA footer): `residential`, `commercial`, `industrial`, `land`, `investment`, selected via the existing `categoryFor(propertyType)`. Property pages with photos keep the first photo. `Base.astro` now emits `og:image:width`, `og:image:height` (read from the file header by the new [`src/lib/image-size.ts`](../src/lib/image-size.ts) — PNG/JPEG/WebP/GIF, no dependency) and `og:image:alt` + `twitter:image:alt` on every page; property pages pass the photo's alt or `{H1} — City Property Services`.

## 8. Map page H1

`<h1 class="mapx-h1">Property map of Ahmedabad</h1>` added as the first item of the filter bar (17px, bold, visible); clears `/map/` and its 71 `?locality=` variants.

---

## Verification output

### Property pages
```
property pages: 600
distinct titles: 600 | distinct descriptions: 600 | pages with exactly one h1: 600
longest title (65): Solaris Business, Ghatlodia · Office Space for Rent · 1,800 sq.ft
longest description (155): Fully furnished bungalow in Shangrila Bungalow Part 1, on Zydus Hospital Road, Thaltej, near the Shell petrol pump, on a 310 sq.yd plot with over 300 sq.yd
longest h1 (90): Iscon Elegance · 2,477 sq.ft super built up Office Space for Rent in SG Highway, Ahmedabad
title sources: stored 314, generated 258, generated+disambiguated 28
description sources: stored 591, generated 9
brand suffix in property titles: 0
og fallback images used: commercial 156, residential 20, land 12, investment 1; og:image:width present on 600/600
```
Samples:
```
zion-z1-office-rent-thaltej
  H1: Zion Z1 · 2,972 sq.ft Office Space for Rent in Thaltej, Ahmedabad
  T (22): Zion Z1 office Thaltej                                   [stored]
  D (78): Fully furnished office of 2,972 sq.ft for rent in Zion Z1, Thaltej, Ahmedabad.
whitecraft-ambli
  H1: Whitecraft · 4 BHK Flat for Sale in Ambli, Ahmedabad
  T (30): Whitecraft, Ambli: 4 BHK Flats                           [stored]
26-samarpan-bungalow-bodakdev
  H1: 26 Samarpan Bungalow · 5 BHK Bungalow for Rent in Bodakdev, Ahmedabad
warehouse-vasai-43000-lease
  H1: 43,000 sq.ft Warehouse for Lease in Vasai, Ahmedabad
  T (54): Warehouse for lease in Vasai, Ahmedabad (43,000 sq.ft)  [stored]
```

### Build guard
```
[check-seo-meta] 752 pages (746 indexable): 746 distinct titles, 746 distinct descriptions,
  746 with exactly one h1; longest title 94 chars, longest description 191 chars; 0 problem(s);
  164 length issue(s) on allowlisted pages (scripts/seo-meta-allowlist.json — tech debt)
```
(the 94/191 maxima are the allowlisted locality/services pages; property maxima are 65/155)

Seeded failure — a copy of the Whitecraft page at `/_dup1/` and a second copy with two `<h1>`s at `/_dup2/`:
```
[check-seo-meta] 754 pages (748 indexable): … 3 problem(s) …
SEO metadata problems on indexable pages:
  /_dup2/  h1 count = 2
  duplicate title "Whitecraft, Ambli: 4 BHK Flats" on 3 pages: /_dup1/, /_dup2/, /property/whitecraft-ambli/
  duplicate description "Whitecraft is an under construction residential project in A…" on 3 pages: /_dup1/, /_dup2/, /property/whitecraft-ambli/
exit: 1
```

### Full rendered `@graph` — `/property/zion-z1-office-rent-thaltej/`
```json
{"@context":"https://schema.org","@graph":[
 {"@type":"RealEstateAgent","@id":"https://cityprop.co.in/#organization","name":"City Property Services","alternateName":"CPS Ahmedabad","url":"https://cityprop.co.in/",
  "logo":{"@type":"ImageObject","@id":"https://cityprop.co.in/#logo","url":"https://cityprop.co.in/logo/city-property-logo-navy.png","contentUrl":"https://cityprop.co.in/logo/city-property-logo-navy.png","width":1699,"height":925},
  "image":"https://cityprop.co.in/logo/city-property-logo-navy.png","telephone":"+919824900778","email":"coordinator@cityprop.co.in",
  "address":{"@type":"PostalAddress","streetAddress":"703 & 704 Zion Prime, Near Copper Stone, Thaltej Shilaj Road","addressLocality":"Ahmedabad","addressRegion":"Gujarat","postalCode":"380052","addressCountry":"IN"},
  "geo":{"@type":"GeoCoordinates","latitude":23.051225,"longitude":72.492735},
  "hasMap":"https://www.google.com/maps/search/?api=1&query=Zion+Prime%2C+Thaltej+Shilaj+Road%2C+Ahmedabad+380052",
  "openingHours":"Mo-Sa 10:00-19:00","priceRange":"₹₹₹","foundingDate":"1999",
  "founder":{"@id":"https://cityprop.co.in/#founder"},"employee":{"@id":"https://cityprop.co.in/#founder"},"memberOf":{"@id":"https://www.ciril.in/#organization"},
  "areaServed":[{"@type":"City","@id":"https://cityprop.co.in/#area-ahmedabad","name":"Ahmedabad","sameAs":"https://www.wikidata.org/entity/Q1070"},{"@type":"City","@id":"https://cityprop.co.in/#area-gandhinagar","name":"Gandhinagar","sameAs":"https://www.wikidata.org/entity/Q11910"}],
  "knowsAbout":["Residential property","Corporate office space","Retail and showroom space","Industrial property","Warehousing and logistics","Land and plots","Property investment"],
  "identifier":{"@type":"PropertyValue","propertyID":"RERA","value":"AG/GJ/AHMEDABAD/AHMADABADCITY/AUDA/AA00003/220329R2"},
  "sameAs":["https://www.instagram.com/citypropertyservices.in/","https://in.linkedin.com/company/city-propertyservices"]},
 {"@type":"Person","@id":"https://cityprop.co.in/#founder","name":"Mukesh Vasani","jobTitle":"Founder","worksFor":{"@id":"https://cityprop.co.in/#organization"},"affiliation":{"@id":"https://www.ciril.in/#organization"},"knowsAbout":["Ahmedabad real estate","Commercial property","Property investment"]},
 {"@type":"Organization","@id":"https://www.ciril.in/#organization","name":"CIRIL","url":"https://www.ciril.in/","description":"Owner-operated commercial real estate network across 30+ Indian cities."},
 {"@type":"WebSite","@id":"https://cityprop.co.in/#website","name":"City Property Services","url":"https://cityprop.co.in/","publisher":{"@id":"https://cityprop.co.in/#organization"},"inLanguage":"en-IN"},
 {"@type":"RealEstateListing","@id":"https://cityprop.co.in/property/zion-z1-office-rent-thaltej/#listing","url":"https://cityprop.co.in/property/zion-z1-office-rent-thaltej/","mainEntityOfPage":"https://cityprop.co.in/property/zion-z1-office-rent-thaltej/",
  "name":"Zion Z1 · 2,972 sq.ft Office Space for Rent in Thaltej, Ahmedabad","description":"Fully furnished office of 2,972 sq.ft for rent in Zion Z1, Thaltej, Ahmedabad.","datePosted":"2026-06-18",
  "provider":{"@id":"https://cityprop.co.in/#organization"},"spatialCoverage":{"@id":"https://cityprop.co.in/localities/thaltej/#place"},"mainEntity":{"@id":"https://cityprop.co.in/property/zion-z1-office-rent-thaltej/#property"},"isPartOf":{"@id":"https://cityprop.co.in/#website"}},
 {"@type":"Accommodation","@id":"https://cityprop.co.in/property/zion-z1-office-rent-thaltej/#property","additionalType":"https://www.wikidata.org/entity/Q182060","name":"Zion Z1 · 2,972 sq.ft Office Space for Rent in Thaltej, Ahmedabad",
  "address":{"@type":"PostalAddress","addressLocality":"Thaltej","addressRegion":"Gujarat","addressCountry":"IN","streetAddress":"Zion Z1"},
  "geo":{"@type":"GeoCoordinates","latitude":23.0449193640152,"longitude":72.50789342271955},"containedInPlace":{"@id":"https://cityprop.co.in/localities/thaltej/#place"},
  "floorSize":{"@type":"QuantitativeValue","value":2972,"unitCode":"FTK","unitText":"sq ft"},
  "amenityFeature":[{"@type":"LocationFeatureSpecification","name":"3 car parks","value":true}]},
 {"@type":"Place","@id":"https://cityprop.co.in/localities/thaltej/#place","name":"Thaltej, Ahmedabad","url":"https://cityprop.co.in/localities/thaltej/",
  "address":{"@type":"PostalAddress","addressLocality":"Thaltej","addressRegion":"Gujarat","addressCountry":"IN"},"geo":{"@type":"GeoCoordinates","latitude":23.047,"longitude":72.505},"containedInPlace":{"@type":"City","name":"Ahmedabad"}},
 {"@type":"Offer","@id":"https://cityprop.co.in/property/zion-z1-office-rent-thaltej/#offer","url":"https://cityprop.co.in/property/zion-z1-office-rent-thaltej/","priceCurrency":"INR","availability":"https://schema.org/InStock",
  "itemOffered":{"@id":"https://cityprop.co.in/property/zion-z1-office-rent-thaltej/#property"},"seller":{"@id":"https://cityprop.co.in/#organization"},"businessFunction":"http://purl.org/goodrelations/v1#LeaseOut",
  "priceSpecification":{"@type":"UnitPriceSpecification","price":65,"priceCurrency":"INR","unitCode":"FTK","unitText":"per sq.ft per month","referenceQuantity":{"@type":"QuantitativeValue","value":1,"unitCode":"FTK"},"billingDuration":{"@type":"QuantitativeValue","value":1,"unitCode":"MON"}}},
 {"@type":"BreadcrumbList","@id":"https://cityprop.co.in/property/zion-z1-office-rent-thaltej/#breadcrumb","itemListElement":[
  {"@type":"ListItem","position":1,"name":"Home","item":"https://cityprop.co.in/"},
  {"@type":"ListItem","position":2,"name":"Rent","item":"https://cityprop.co.in/rent/"},
  {"@type":"ListItem","position":3,"name":"Thaltej","item":"https://cityprop.co.in/localities/thaltej/"},
  {"@type":"ListItem","position":4,"name":"Zion Z1 · 2,972 sq.ft Office Space for Rent in Thaltej, Ahmedabad","item":"https://cityprop.co.in/property/zion-z1-office-rent-thaltej/"}]}
]}
```

### Full rendered `@graph` — `/property/ratnakar-artesia-ambli/` (price on request)
Sitewide nodes identical to the above; page nodes:
```json
[
 {"@type":"RealEstateListing","@id":"https://cityprop.co.in/property/ratnakar-artesia-ambli/#listing","url":"https://cityprop.co.in/property/ratnakar-artesia-ambli/","mainEntityOfPage":"https://cityprop.co.in/property/ratnakar-artesia-ambli/",
  "name":"Ratnakar Artesia · 4 BHK Flat for Sale in Ambli, Ahmedabad","description":"Ratnakar Artesia is an under construction residential project by Ratnaakar Group in Ambli, Ahmedabad, offering 4 & 5 BHK homes.","datePosted":"2026-07-28",
  "image":["https://cityprop.co.in/uploads/properties/ratnakar-artesia-ambli/photo-1.jpg","https://cityprop.co.in/uploads/properties/ratnakar-artesia-ambli/photo-2.jpg"],
  "provider":{"@id":"https://cityprop.co.in/#organization"},"spatialCoverage":{"@id":"https://cityprop.co.in/localities/ambli/#place"},"mainEntity":{"@id":"https://cityprop.co.in/property/ratnakar-artesia-ambli/#property"},"isPartOf":{"@id":"https://cityprop.co.in/#website"}},
 {"@type":"Apartment","@id":"https://cityprop.co.in/property/ratnakar-artesia-ambli/#property","name":"Ratnakar Artesia · 4 BHK Flat for Sale in Ambli, Ahmedabad",
  "address":{"@type":"PostalAddress","addressLocality":"Ambli","addressRegion":"Gujarat","addressCountry":"IN","streetAddress":"Ratnakar Artesia"},
  "geo":{"@type":"GeoCoordinates","latitude":23.0374,"longitude":72.46669},"containedInPlace":{"@id":"https://cityprop.co.in/localities/ambli/#place"},"numberOfRooms":4,
  "image":["https://cityprop.co.in/uploads/properties/ratnakar-artesia-ambli/photo-1.jpg","https://cityprop.co.in/uploads/properties/ratnakar-artesia-ambli/photo-2.jpg"]},
 {"@type":"Place","@id":"https://cityprop.co.in/localities/ambli/#place","name":"Ambli, Ahmedabad","url":"https://cityprop.co.in/localities/ambli/","address":{"@type":"PostalAddress","addressLocality":"Ambli","addressRegion":"Gujarat","addressCountry":"IN"},"geo":{"@type":"GeoCoordinates","latitude":23.035,"longitude":72.478},"containedInPlace":{"@type":"City","name":"Ahmedabad"}},
 {"@type":"BreadcrumbList","@id":"https://cityprop.co.in/property/ratnakar-artesia-ambli/#breadcrumb","itemListElement":[
  {"@type":"ListItem","position":1,"name":"Home","item":"https://cityprop.co.in/"},
  {"@type":"ListItem","position":2,"name":"Buy","item":"https://cityprop.co.in/buy/"},
  {"@type":"ListItem","position":3,"name":"Ambli","item":"https://cityprop.co.in/localities/ambli/"},
  {"@type":"ListItem","position":4,"name":"Ratnakar Artesia · 4 BHK Flat for Sale in Ambli, Ahmedabad","item":"https://cityprop.co.in/property/ratnakar-artesia-ambli/"}]}
]
```
No `Offer` node — the page shows "Price on request".

---

## Diff summary

18 files changed, +832 / −70 (excluding `reports/`).

New: `src/lib/seo.ts` (H1/title/description resolution + graph builder), `src/lib/image-size.ts`, `scripts/check-seo-meta.mjs`, `scripts/seo-meta-allowlist.json`, `scripts/validate-jsonld.mjs`, `public/images/og/{residential,commercial,industrial,land,investment}.png`.  
Modified: `src/layouts/Base.astro` (single `@graph`, enriched org, `brandSuffix`, OG width/height/alt), `src/pages/property/[slug].astro` (h1, SEO wiring, graph, OG fallback), `src/pages/map.astro` (+h1), `src/lib/data.ts`, `src/lib/types.ts`, `src/lib/config.ts` (E.164 + office details), `package.json`, `.gitignore` (`.cache/`).

## Follow-ups (not in this batch)

- Clear the 164 allowlisted length issues when the locality / blog / service / home templates are reworked (mostly: shorten titles or drop the brand suffix), then delete the entries from `scripts/seo-meta-allowlist.json`.
- Confirm foundingDate, openingHours and the office PIN (see §6).
- 189 listings still have no photos and 54 no price — the schema now honestly reflects that (no image / no Offer); content work is the only fix.
- Stored `seoTitle`s are used on 314 pages per rule (b); many are terse ("Zion Z1 office Thaltej"). If you'd rather always use the richer generated form, it's a one-line change in `resolvePropertySeo()`.
