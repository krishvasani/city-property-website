# SEO Batch 4 — business facts, locality and service depth, internal link graph

**Date:** 2026-09-19  
**Branch:** `seo/authority-pages` → merged into `main` (`15a7c46`) and **deployed to production** via the Netlify build hook (deploy `6aaecc7a…`, published 2026-09-19 17:56 UTC). All four batch branches and `main` are pushed to GitHub.

---

## Results at a glance

| Metric | Before (batch 3) | After |
|---|---|---|
| Built pages / sitemap URLs | 811 / 806 | **842 / 837** (837 lastmod, 2,027 image entries) |
| Landing pages / listings covered | 60 / 473 | **91 / 535 of 600** (threshold 2) |
| Landing-page crawl depth from `/` | 18 at depth 2, 42 at depth 3 | **24 at depth 1, 67 at depth 2** (max 2) |
| Homepage links → landing pages | 0 | 24 (browse module) |
| Property inbound links (min / median / max, < 3) | 3 / 10 / 16, 0 | 3 / 10 / 16, 0 (unchanged; the 31 new landing pages add links to their 62 listings) |
| `check-seo-meta` | 0 problems + 164 allowlisted | **0 problems, allowlist deleted, no exemption logic** |
| Locality pages (109): median words | 526 (mean 660) | **613 (mean 753)**; 37 of 75 listing localities ≥ 700 |
| `/localities/thaltej/` words | 437 | **2,078** |
| Business facts | "27 years", 380052, `openingHours` string, foundingDate 1999 | **28+ years derived from `foundedYear: 1998`**, 380059, `openingHoursSpecification` Mon–Sat 09:30–19:00 + Sunday closed |
| JSON-LD validation | 769 pages | **827 / 827 pass** (landing + property + locality + service + home + blog) |
| `llms.txt` | static file | generated at build (125 links, incl. 91 landing pages grouped by type) |

---

## 1. Confirmed business facts

`src/lib/config.ts` is now the single source: `site.foundedYear = 1998`, `site.yearsInBusiness` (getter, `new Date().getFullYear() − foundedYear` → 28 in 2026) and `site.yearsLabel` ("28+"); `contact.postalCode = '380059'`; `contact.office.hours` (structured) and `hoursText`.

**Every change for the 27 → 28 / PIN / hours update** (grep of `27`, `380052`, `1999`, `Mo-Sa` across `src/`, `public/`, docs — all hits changed; the only remaining "27"s are an image-header byte offset and a `newAt` date):

| File | Line(s) | Change |
|---|---|---|
| `src/lib/config.ts` | 12–21 | `foundedYear: 1998`, `yearsInBusiness`, `yearsLabel` added |
| `src/lib/config.ts` | 36–37 | address `…Gujarat 380052` → `380059`; `postalCode: '380059'` |
| `src/lib/config.ts` | 43–49 | `mapUrl` query `380052` → `380059`; `openingHours: 'Mo-Sa 10:00-19:00'` → `hours` array (Mon–Sat 09:30–19:00, Sunday 00:00–00:00) + `hoursText` |
| `src/layouts/Base.astro` | 91 | `postalCode: '380052'` → `contact.postalCode` |
| `src/layouts/Base.astro` | 96–101 | `openingHours` string → `openingHoursSpecification` array |
| `src/layouts/Base.astro` | 103 | `foundingDate: '1999'` → `String(site.foundedYear)` |
| `src/pages/index.astro` | 87 | `<Stat display="27+ yrs" count={27}>` → `site.yearsLabel` / `site.yearsInBusiness` |
| `src/pages/index.astro` | 171 | `27 years of trusted property advice` → `{site.yearsInBusiness} years …` |
| `src/pages/index.astro` | 173 | `<strong>27 years</strong>` → `{site.yearsInBusiness} years` |
| `src/pages/sell.astro` | 38 | `27+ yrs` stat → derived |
| `src/pages/about-us.astro` | 15 | description now ends "led by Mukesh Vasani since {foundedYear}" |
| `src/data/about.ts` | story[0] | "We have spent many years…" → "Founded in {1998}, we have spent over {28} years…" |
| `src/components/Footer.astro` | 20 | visible hours line added (`contact.office.hoursText`), address now shows 380059 via `contact.address` |
| `public/llms.txt`, `public/llms-full.txt` | — | deleted (had "27+ years", 380052); regenerated at build with 1998 / 28+ / 380059 / hours |
| `SEO_SETUP_CHECKLIST.md` | 26 | 380052 → 380059 |

No locality or service copy cited the year count.

Rendered `RealEstateAgent` node (identical on every page):
```json
{
 "@type": "RealEstateAgent",
 "@id": "https://cityprop.co.in/#organization",
 "name": "City Property Services",
 "alternateName": "CPS Ahmedabad",
 "url": "https://cityprop.co.in/",
 "logo": {
  "@type": "ImageObject",
  "@id": "https://cityprop.co.in/#logo",
  "url": "https://cityprop.co.in/logo/city-property-logo-navy.png",
  "contentUrl": "https://cityprop.co.in/logo/city-property-logo-navy.png",
  "width": 1699,
  "height": 925
 },
 "image": "https://cityprop.co.in/logo/city-property-logo-navy.png",
 "telephone": "+919824900778",
 "email": "coordinator@cityprop.co.in",
 "address": {
  "@type": "PostalAddress",
  "streetAddress": "703 & 704 Zion Prime, Near Copper Stone, Thaltej Shilaj Road",
  "addressLocality": "Ahmedabad",
  "addressRegion": "Gujarat",
  "postalCode": "380059",
  "addressCountry": "IN"
 },
 "geo": {
  "@type": "GeoCoordinates",
  "latitude": 23.051225,
  "longitude": 72.492735
 },
 "hasMap": "https://www.google.com/maps/search/?api=1&query=Zion+Prime%2C+Thaltej+Shilaj+Road%2C+Ahmedabad+380059",
 "openingHoursSpecification": [
  {
   "@type": "OpeningHoursSpecification",
   "dayOfWeek": [
    "https://schema.org/Monday",
    "https://schema.org/Tuesday",
    "https://schema.org/Wednesday",
    "https://schema.org/Thursday",
    "https://schema.org/Friday",
    "https://schema.org/Saturday"
   ],
   "opens": "09:30",
   "closes": "19:00"
  },
  {
   "@type": "OpeningHoursSpecification",
   "dayOfWeek": [
    "https://schema.org/Sunday"
   ],
   "opens": "00:00",
   "closes": "00:00"
  }
 ],
 "priceRange": "₹₹₹",
 "foundingDate": "1998",
 "founder": {
  "@id": "https://cityprop.co.in/#founder"
 },
 "employee": {
  "@id": "https://cityprop.co.in/#founder"
 },
 "memberOf": {
  "@id": "https://www.ciril.in/#organization"
 },
 "areaServed": [
  {
   "@type": "City",
   "@id": "https://cityprop.co.in/#area-ahmedabad",
   "name": "Ahmedabad",
   "sameAs": "https://www.wikidata.org/entity/Q1070"
  },
  {
   "@type": "City",
   "@id": "https://cityprop.co.in/#area-gandhinagar",
   "name": "Gandhinagar",
   "sameAs": "https://www.wikidata.org/entity/Q11910"
  }
 ],
 "knowsAbout": [
  "Residential property",
  "Corporate office space",
  "Retail and showroom space",
  "Industrial property",
  "Warehousing and logistics",
  "Land and plots",
  "Property investment"
 ],
 "identifier": {
  "@type": "PropertyValue",
  "propertyID": "RERA",
  "value": "AG/GJ/AHMEDABAD/AHMADABADCITY/AUDA/AA00003/220329R2"
 },
 "sameAs": [
  "https://www.instagram.com/citypropertyservices.in/",
  "https://in.linkedin.com/company/city-propertyservices"
 ]
}
```

## 2. Locality page rebuild

`src/pages/localities/[slug].astro` + new `src/lib/locality-content.ts`. Every element is derived from listings or the locality dataset:

- **H1** `{Locality}, {City}: Property for Sale and Rent` (→ `…for Sale` / `…for Rent` when one side only; `…: Property Guide` for the 34 no-listing pages). Title = H1 (≤ 60, no brand suffix). Description 140–155 from count/type split → top price range → "known for" → CTA.
- **Intro**: listing count and buy/rent split, per-type counts, price and size range per type (up to 4), buildings with availability (case-insensitively de-duplicated), then the dataset's character, "known for", landmarks, connectivity and nearby areas.
- **Market summary table**: one row per (type, side): listings, price range (+ "n on request"), size range, typical ₹/unit with the median's sample size.
- **Browse by type** grid linking every landing page for the locality; grouped listing cards (batch 3, unchanged) with per-group landing buttons.
- **At a glance** facts list (city/district, region/zone, micro-market, PIN, typical property, what we advise on, landmarks, access, live listings) and **nearby-area cards** (each neighbour's own one-line description + live count) — all dataset fields.
- **FAQ** (4–6): what types are available · what does a {top type} cost · is it better for buying or renting (answered from the supply split) · what is near · what is it known for · which buildings have availability. Different shapes from the landing pages.
- **Schema**: `CollectionPage` (#page) → `ItemList` (#list, every listing by `@id`) + `Place` (#place, with description/geo/PIN/containedInPlace) + `FAQPage` (#faq) + `BreadcrumbList`, in the single `@graph`.

**Word-count distribution (109 pages):** min 412 · median 613 · mean 753 · max 2,649. `<500`: 26 · `500–699`: 46 · `700–999`: 22 · `1000–1999`: 13 · `2000+`: 2.

Of the **75 localities with listings**, 37 are ≥ 700 words; **38 fall short (486–699)** — every one has 1–7 listings and a one-line dataset entry, so there is no further real data to render (odhav 486/1 listing, guma 559/1, sanand 560/1, agol 565/1, bhadaj 567/1, ghuma 572/1, pirana 577/2, chekhla 577/1, shahibaug 578/1, jaspur 578/1, lapkaman 581/1, indrad 584/1, thol-road 588/1, vejalpur 593/1, gokuldham 595/1, miroli 596/1, pinglaj 600/1, jetalpur 603/2, rajoda 605/1, vasai 610/5, hariyala 613/1, kamod 619/3, hebatpur 620/2, kathwada 622/1, surdhara 627/2, iskcon 633/1, gulbai-tekra 643/1, gota 657/1, moraiya 657/2, manekbag 661/2, nehrunagar 662/3, vavdi 663/2, bavla 673/2, gurukul 689/3, kanera 690/4, gandhinagar 691/2, bhayla 695/3, naranpura 699/4). Closing that gap honestly means owner-authored locality copy or more listings, not generated text.

**Ten thinnest** (all no-listing "guide" pages): sabarmati 412 · ranip 416 · kankaria 424 · randesan 447 · law-garden 449 · sargasan 453 · nikol 455 · motera 460 · raysan 464 · jamalpur 467.

### `/localities/thaltej/`
```
H1: Thaltej, Ahmedabad: Property for Sale and Rent
Title (46): Thaltej, Ahmedabad: Property for Sale and Rent
Description (152): 53 properties in Thaltej, Ahmedabad: 19 flats for sale, 12 office spaces for rent and 6 office spaces for sale. Flats for sale from ₹1.15 Cr to ₹7.5 Cr.
words 2,078 | 139 KB | text/html 10.3 % | 53 cards | 24 landing links | 6 FAQ | @graph: RealEstateAgent, Person, Organization, WebSite, BreadcrumbList, CollectionPage, ItemList, Place, FAQPage
```
Intro: *City Property Services currently lists 53 properties in Thaltej, Ahmedabad — 32 for sale and 21 for rent or lease. By type: 19 flats for sale, 12 office spaces for rent, 6 office spaces for sale, 5 bungalows for sale, 4 showrooms for rent, 3 flats for rent, 2 showrooms for sale and 2 bungalows for rent.* / *Asking prices: flats for sale from ₹1.15 Cr to ₹7.5 Cr (1,629 to 7,900 sq.ft), office spaces for rent from ₹35 to ₹65 / sq.ft per month (928 to 41,000 sq.ft), office spaces for sale from ₹1.18 Cr to ₹9.63 Cr (1,484 to 11,331 sq.ft) and bungalows for sale from ₹3.25 Cr to ₹11.5 Cr (2,250 to 3,357 sq.ft).* / *Buildings and projects with current availability include West Face, Abhinav Bungalow, Casa emplio, Copper stone, Drive in road, Mapple tree, Nisarg Bungalow, Sankalp Grace 3 and 30 more.* / *Thaltej is a premium apartments area in West Ahmedabad, Ahmedabad. Thaltej is known for premium apartments, offices and showrooms.* / *Thaltej is reached via SG Highway and Sindhu Bhavan Road. Nearby areas: Bodakdev, Sindhu Bhavan Road, Sola and Shilaj.*

Market summary: Flats for sale 19 · ₹1.15 Cr to ₹7.5 Cr · 1,629 to 7,900 sq.ft · ₹9,276/sq.ft (median of 19) — Office spaces for rent 12 · ₹35 to ₹65 / sq.ft per month · 928 to 41,000 sq.ft · ₹56.5/sq.ft/month (median of 8) — Office spaces for sale 6 — Bungalows for sale 5 — Showrooms for rent 4 — Flats for rent 3 — Showrooms for sale 2 — Bungalows for rent 2.

Page-specific `@graph` nodes (sitewide four omitted; see §1 for the org node):
```json
[
 {
  "@type": "BreadcrumbList",
  "@id": "https://cityprop.co.in/localities/thaltej/#breadcrumb",
  "itemListElement": [
   {
    "@type": "ListItem",
    "position": 1,
    "name": "Home",
    "item": "https://cityprop.co.in/"
   },
   {
    "@type": "ListItem",
    "position": 2,
    "name": "Localities",
    "item": "https://cityprop.co.in/localities/"
   },
   {
    "@type": "ListItem",
    "position": 3,
    "name": "Thaltej",
    "item": "https://cityprop.co.in/localities/thaltej/"
   }
  ]
 },
 {
  "@type": "CollectionPage",
  "@id": "https://cityprop.co.in/localities/thaltej/#page",
  "url": "https://cityprop.co.in/localities/thaltej/",
  "name": "Thaltej, Ahmedabad: Property for Sale and Rent",
  "description": "53 properties in Thaltej, Ahmedabad: 19 flats for sale, 12 office spaces for rent and 6 office spaces for sale. Flats for sale from ₹1.15 Cr to ₹7.5 Cr.",
  "isPartOf": {
   "@id": "https://cityprop.co.in/#website"
  },
  "about": {
   "@id": "https://cityprop.co.in/localities/thaltej/#place"
  },
  "mainEntity": {
   "@id": "https://cityprop.co.in/localities/thaltej/#list"
  }
 },
 {
  "@type": "ItemList",
  "@id": "https://cityprop.co.in/localities/thaltej/#list",
  "name": "Property in Thaltej",
  "numberOfItems": 53,
  "itemListOrder": "https://schema.org/ItemListUnordered",
  "itemListElement": [
   {
    "@type": "ListItem",
    "position": 1,
    "url": "https://cityprop.co.in/property/west-face-showroom-2050-sale-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/west-face-showroom-2050-sale-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 2,
    "url": "https://cityprop.co.in/property/abhinav-bungalow-bungalow-480-rent-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/abhinav-bungalow-bungalow-480-rent-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 3,
    "url": "https://cityprop.co.in/property/casa-emplio-apartment-3600-sale-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/casa-emplio-apartment-3600-sale-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 4,
    "url": "https://cityprop.co.in/property/copper-stone-apartment-2250-rent-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/copper-stone-apartment-2250-rent-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 5,
    "url": "https://cityprop.co.in/property/copper-stone-apartment-2800-sale-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/copper-stone-apartment-2800-sale-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 6,
    "url": "https://cityprop.co.in/property/copper-stone-apartment-3400-rent-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/copper-stone-apartment-3400-rent-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 7,
    "url": "https://cityprop.co.in/property/copper-stone-apartment-3400-sale-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/copper-stone-apartment-3400-sale-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 8,
    "url": "https://cityprop.co.in/property/drive-in-road-apartment-480-rent-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/drive-in-road-apartment-480-rent-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 9,
    "url": "https://cityprop.co.in/property/mapple-tree-apartment-2394-sale-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/mapple-tree-apartment-2394-sale-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 10,
    "url": "https://cityprop.co.in/property/nisarg-bungalow-bungalow-373-sale-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/nisarg-bungalow-bungalow-373-sale-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 11,
    "url": "https://cityprop.co.in/property/sankalp-grace-3-apartment-3920-sale-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/sankalp-grace-3-apartment-3920-sale-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 12,
    "url": "https://cityprop.co.in/property/satyam-crystal-bunglows-bungalow-200-rent-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/satyam-crystal-bunglows-bungalow-200-rent-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 13,
    "url": "https://cityprop.co.in/property/shakti-140-apartment-189-sale-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/shakti-140-apartment-189-sale-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 14,
    "url": "https://cityprop.co.in/property/shalin-bungalow-bungalow-250-sale-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/shalin-bungalow-bungalow-250-sale-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 15,
    "url": "https://cityprop.co.in/property/sharanya-skyview-apartment-3400-sale-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/sharanya-skyview-apartment-3400-sale-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 16,
    "url": "https://cityprop.co.in/property/sky-deck-season-apartment-5900-sale-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/sky-deck-season-apartment-5900-sale-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 17,
    "url": "https://cityprop.co.in/property/status-tower-apartment-3300-sale-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/status-tower-apartment-3300-sale-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 18,
    "url": "https://cityprop.co.in/property/the-beaumonde-apartment-5250-sale-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/the-beaumonde-apartment-5250-sale-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 19,
    "url": "https://cityprop.co.in/property/verantes-22-apartment-5100-sale-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/verantes-22-apartment-5100-sale-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 20,
    "url": "https://cityprop.co.in/property/yogeshwar-bungalow-bungalow-350-sale-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/yogeshwar-bungalow-bungalow-350-sale-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 21,
    "url": "https://cityprop.co.in/property/zion-windfield-apartment-2598-sale-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/zion-windfield-apartment-2598-sale-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 22,
    "url": "https://cityprop.co.in/property/krish-cubical-2266-office-rent-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/krish-cubical-2266-office-rent-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 23,
    "url": "https://cityprop.co.in/property/krish-cubical-6000-office-rent-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/krish-cubical-6000-office-rent-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 24,
    "url": "https://cityprop.co.in/property/magnet-corporate-park-office-rent-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/magnet-corporate-park-office-rent-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 25,
    "url": "https://cityprop.co.in/property/maple-trade-centre-2995-office-rent-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/maple-trade-centre-2995-office-rent-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 26,
    "url": "https://cityprop.co.in/property/maple-trade-centre-office-rent-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/maple-trade-centre-office-rent-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 27,
    "url": "https://cityprop.co.in/property/shreya-amalga-1720-office-rent-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/shreya-amalga-1720-office-rent-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 28,
    "url": "https://cityprop.co.in/property/shreya-amalga-1720-office-sale-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/shreya-amalga-1720-office-sale-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 29,
    "url": "https://cityprop.co.in/property/swati-18-1484-office-sale-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/swati-18-1484-office-sale-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 30,
    "url": "https://cityprop.co.in/property/swati-18-2778-office-sale-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/swati-18-2778-office-sale-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 31,
    "url": "https://cityprop.co.in/property/titanium-square-928-office-rent-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/titanium-square-928-office-rent-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 32,
    "url": "https://cityprop.co.in/property/westport-11331-office-rent-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/westport-11331-office-rent-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 33,
    "url": "https://cityprop.co.in/property/westport-11331-office-sale-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/westport-11331-office-sale-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 34,
    "url": "https://cityprop.co.in/property/westport-5940-office-rent-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/westport-5940-office-rent-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 35,
    "url": "https://cityprop.co.in/property/westport-5940-office-sale-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/westport-5940-office-sale-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 36,
    "url": "https://cityprop.co.in/property/zion-z1-office-rent-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/zion-z1-office-rent-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 37,
    "url": "https://cityprop.co.in/property/acropolis-mall-office-rent-sg-highway/",
    "item": {
     "@id": "https://cityprop.co.in/property/acropolis-mall-office-rent-sg-highway/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 38,
    "url": "https://cityprop.co.in/property/krish-cubical-office-rent-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/krish-cubical-office-rent-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 39,
    "url": "https://cityprop.co.in/property/westface-office-sale-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/westface-office-sale-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 40,
    "url": "https://cityprop.co.in/property/artifino-4bhk-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/artifino-4bhk-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 41,
    "url": "https://cityprop.co.in/property/maple-trade-centre-showroom-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/maple-trade-centre-showroom-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 42,
    "url": "https://cityprop.co.in/property/maple-tree-3bhk-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/maple-tree-3bhk-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 43,
    "url": "https://cityprop.co.in/property/maruti-zenobia-3bhk-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/maruti-zenobia-3bhk-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 44,
    "url": "https://cityprop.co.in/property/one-world-metro-showroom-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/one-world-metro-showroom-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 45,
    "url": "https://cityprop.co.in/property/rangoli-road-showroom-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/rangoli-road-showroom-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 46,
    "url": "https://cityprop.co.in/property/sankalp-grace-3-4bhk-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/sankalp-grace-3-4bhk-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 47,
    "url": "https://cityprop.co.in/property/sankalp-grace-3-flat-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/sankalp-grace-3-flat-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 48,
    "url": "https://cityprop.co.in/property/shangrila-bungalow-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/shangrila-bungalow-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 49,
    "url": "https://cityprop.co.in/property/sheetal-enigma-4bhk-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/sheetal-enigma-4bhk-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 50,
    "url": "https://cityprop.co.in/property/siesta-dwelling-penthouse-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/siesta-dwelling-penthouse-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 51,
    "url": "https://cityprop.co.in/property/trinity-complex-showroom-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/trinity-complex-showroom-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 52,
    "url": "https://cityprop.co.in/property/vrundavan-7-bungalow-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/vrundavan-7-bungalow-thaltej/#listing"
    }
   },
   {
    "@type": "ListItem",
    "position": 53,
    "url": "https://cityprop.co.in/property/shreeya-amalga-showroom-thaltej/",
    "item": {
     "@id": "https://cityprop.co.in/property/shreeya-amalga-showroom-thaltej/#listing"
    }
   }
  ]
 },
 {
  "@type": "Place",
  "@id": "https://cityprop.co.in/localities/thaltej/#place",
  "name": "Thaltej, Ahmedabad",
  "url": "https://cityprop.co.in/localities/thaltej/",
  "description": "Thaltej is a premium apartments area in West Ahmedabad, Ahmedabad.",
  "address": {
   "@type": "PostalAddress",
   "addressLocality": "Thaltej",
   "addressRegion": "Gujarat",
   "addressCountry": "IN"
  },
  "geo": {
   "@type": "GeoCoordinates",
   "latitude": 23.047,
   "longitude": 72.505
  },
  "containedInPlace": {
   "@type": "City",
   "name": "Ahmedabad"
  }
 },
 {
  "@type": "FAQPage",
  "@id": "https://cityprop.co.in/localities/thaltej/#faq",
  "mainEntity": [
   {
    "@type": "Question",
    "name": "What types of property are available in Thaltej?",
    "acceptedAnswer": {
     "@type": "Answer",
     "text": "Right now City Property Services lists 19 flats for sale, 12 office spaces for rent, 6 office spaces for sale, 5 bungalows for sale, 4 showrooms for rent, 3 flats for rent, 2 showrooms for sale and 2 bungalows for rent in Thaltej. Each type has its own page: Flat for Sale in Thaltej, Office Space for Rent in Thaltej, Office Space for Sale in Thaltej, Bungalow for Sale in Thaltej, Showroom for Rent in Thaltej, Flat for Rent in Thaltej, Showroom for Sale in Thaltej and Bungalow for Rent in Thaltej."
    }
   },
   {
    "@type": "Question",
    "name": "What does a flat cost to buy in Thaltej?",
    "acceptedAnswer": {
     "@type": "Answer",
     "text": "Across 19 priced listings, flats for sale in Thaltej run from ₹1.15 Cr to ₹7.5 Cr, with a typical rate of ₹9,276 per sq.ft (median of 19). Sizes range from 1,629 to 7,900 sq.ft."
    }
   },
   {
    "@type": "Question",
    "name": "Is Thaltej better for buying or renting?",
    "acceptedAnswer": {
     "@type": "Answer",
     "text": "Both markets are active: 32 of the current listings are for sale and 21 for rent or lease. Supply currently leans towards sale, led by flats for sale. Talk to us about which suits your timeline and budget."
    }
   },
   {
    "@type": "Question",
    "name": "What is near Thaltej?",
    "acceptedAnswer": {
     "@type": "Answer",
     "text": "Neighbouring areas are Bodakdev, Sindhu Bhavan Road, Sola and Shilaj. The area connects via SG Highway and Sindhu Bhavan Road."
    }
   },
   {
    "@type": "Question",
    "name": "What is Thaltej known for?",
    "acceptedAnswer": {
     "@type": "Answer",
     "text": "Thaltej is known for premium apartments, offices and showrooms. Thaltej is a premium apartments area in West Ahmedabad, Ahmedabad."
    }
   },
   {
    "@type": "Question",
    "name": "Which buildings in Thaltej have availability right now?",
    "acceptedAnswer": {
     "@type": "Answer",
     "text": "Current listings are in West Face, Abhinav Bungalow, Casa emplio, Copper stone, Copper Stone, Drive in road, Mapple tree, Nisarg Bungalow and 31 other buildings. Availability changes, so contact us for the latest."
    }
   }
  ]
 }
]
```

## 3. Allowlist cleared

`scripts/seo-meta-allowlist.json` deleted; all allowlist code removed from `scripts/check-seo-meta.mjs` (which also now decodes numeric entities like `&#38;`). Fixed at source: `brandSuffix={false}` on blog posts, service pages, `/buy/`, `/rent/`, `/localities/` and locality pages; home title → "Property Consultants in Ahmedabad | City Property Services" (58); home, about, localities-index and all six service descriptions rewritten ≤ 155.

```
[check-seo-meta] 843 pages (837 indexable): 837 distinct titles, 837 distinct descriptions,
  837 with exactly one h1; longest title 65 chars, longest description 158 chars; 0 problem(s)
[check-trailing-slash] 67085 internal links scanned, 0 without trailing slash
```

## 4. Landing threshold → 2

`MIN_LISTINGS = 2` in `landing-core.ts`. Distribution unchanged (1: 57 · 2: 31 · 3–5: 30 · 6–10: 19 · 11+: 11); **91 pages** (was 60), **535 of 600 listings** covered (was 473). Single-listing combos stay excluded. All 91 pass the guard and the validator.

## 5. Service pages

`ServicePage.astro` gained `landingTypes`, `extraTypes`, `sides` and `faq` props:
- **Live line** under the hero: e.g. corporate → *285 live listings across 26 localities · for sale from ₹44.07 L to ₹16 Cr · for rent from ₹30 to ₹170 / sq.ft per month*; land → *17 live listings across 12 localities · for sale from ₹2.14 Cr to ₹30.76 Cr*.
- **Browse by locality** block: landing pages grouped by locality (locality name → its page), real anchor text with counts. Mapping: corporate → office-space (22 localities, 38 links); retail → shop + showroom; industrial-warehouse → warehouse + industrial-shed + land (+ industrial land listings in the count); residential → flat + bungalow; investment → showroom + office-space + shop **sale side only** (+ investment-type listings); land → plot + land.
- **FAQ** (5–6 each, `FAQPage` in the graph) authored from CPS practice with live placeholders (`{count}`, `{rentRange}`, `{saleRange}`, `{localityCount}`, `{topLocalities}`, `{sizeRange}`) filled at build.

## 6. Homepage and localities index

- **Homepage browse module** ("Find property by locality and type"): the four busiest markets by total listings — Office Space for Rent, Flat for Sale, Office Space for Sale, Warehouse for Rent — six most-stocked localities each with count badges, a "N more areas" link per card and "All localities". 24 landing links, laid out as four cards in the existing card/eyebrow/section-head language. Screenshot: `reports/2026-09-19-batch-4-home-browse.png`.
- **/localities/**: all **153** localities grouped by region (regions ordered by live listings, jump links at the top); each tile links to its page (or the filtered buy page for the 44 without one) and lists its landing pages beneath.
- Crawl depth of landing pages from `/`: **before** 18 at depth 2 + 42 at depth 3 → **after** 24 at depth 1 + 67 at depth 2.

## 7. llms.txt regenerated as a build step

`src/pages/llms.txt.ts` and `src/pages/llms-full.txt.ts` are Astro endpoints: the summary is built from `config` (year, hours, PIN, RERA), `serviceLinks`, live counts (600 listings: 275 sale / 325 rent), the 91 landing pages grouped by type (**"Property by type and area"** section — 125 links in total) and the top-15 localities by listing count; the full-text file is built from the new shared `src/data/about.ts` and `src/data/guide.ts` modules that the About and Guide pages also render from. `public/llms*.txt` removed.

---

## Verification (local build = deployed build)

```
pages 842 | sitemap 837 URLs (837 lastmod, 2027 images) | landing pages 91 | listings covered 535/600
[check-trailing-slash] 67085 internal links scanned, 0 without trailing slash
[check-seo-meta] … 0 problem(s)   (no allowlist file, no exemption logic)
validate-jsonld: 827 PASS / 0 FAIL

[BEFORE] landing crawl depth {2: 18, 3: 42} | property inbound min 3 median 10 max 16 (<3: 0) | home → landing links 0
[AFTER]  landing crawl depth {1: 24, 2: 67} | property inbound min 3 median 10 max 16 (<3: 0) | home → landing links 24
```

### Live (cityprop.co.in, after deploy)
```
200 /            200 /localities/thaltej/   200 /rent/office-space-in-thaltej/   200 /buy/flat-in-ambli/
200 /llms.txt    200 /llms-full.txt         200 /robots.txt                      200 /sitemap-0.xml (837 URLs, 837 lastmod)
homepage: 24 landing links · "28 years" ×2, "28+ yrs" ×1 · 0 bare-route hrefs
org node: foundingDate 1998 · postalCode 380059 · hours Mon–Sat 09:30–19:00 + Sunday closed
/listings → 301 → https://cityprop.co.in/buy/
```

## Diff summary (batch 4)

New: `src/lib/locality-content.ts`, `src/data/about.ts`, `src/data/guide.ts`, `src/pages/llms.txt.ts`, `src/pages/llms-full.txt.ts`.  
Rewritten: `src/pages/localities/[slug].astro`, `src/pages/localities/index.astro`.  
Modified: `src/lib/config.ts`, `src/layouts/Base.astro`, `src/components/{Footer,ServicePage,SearchBar}.astro`, `src/pages/{index,sell,about-us,guide,buy,rent}.astro`, `src/pages/blog/[slug].astro`, `src/pages/services/*.astro` (6), `src/lib/landing-core.ts`, `scripts/check-seo-meta.mjs`, `SEO_SETUP_CHECKLIST.md`.  
Deleted: `scripts/seo-meta-allowlist.json`, `public/llms.txt`, `public/llms-full.txt`.

## Follow-ups

- 38 listing localities sit at 486–699 words purely for lack of data; owner-written locality copy (a paragraph each in `localities.ts`) is the honest way to lift them.
- The `investment` service counts sale-side commercial assets (357 → 106 with the side filter); if the owner wants pre-leased assets only, tag them in the CMS.
- Semrush re-crawl recommended now that all four batches are live; expect the 809 errors / 2,907 warnings to be near zero except image-less listings and price-on-request items, which the markup now reports honestly.
