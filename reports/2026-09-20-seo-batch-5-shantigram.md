# SEO Batch 5 — Adani Shantigram township hub and 13 project pages

**Date:** 2026-09-20  
**Branch:** `seo/shantigram` → merged into `main` (`7081d61`, then `7e2ff4f` with Series Master pricing) and **deployed as noindex drafts** (latest deploy live 12:16 UTC). The 14 pages are reachable at their real URLs for review, carry `noindex, nofollow`, are excluded from the sitemap, and nothing on the site links to them.

## The one flag

`src/lib/flags.ts` → `export const SHANTIGRAM_LIVE = false;` **Change `false` to `true`**, commit, and trigger a deploy. That single constant switches, in one build: robots `noindex` → `index, follow` on all 14 pages; sitemap inclusion (with `lastmod` from the JSON/template commit dates and 6 images per URL); the "Township guide" card in the homepage browse module; the feature block on `/services/residential/`; the cross-link card on `/localities/shantigram/`; and a 14-line "Adani Shantigram township" section in `llms.txt`. I dry-ran the flip locally: the build passes `check-seo-meta` with 851 indexable pages (851 distinct titles/descriptions, one H1 each), the sitemap grows to 851 URLs, 3 pages link to the hub, and `llms.txt` gains 14 lines. Then I set it back to `false`.

---

## 1. Extraction and gap report

Source folder `…/Content Creation/Adani_Shantigram_Reel_Series` (added to `.gitignore`; 37 Word docs + 37 PDFs read via `textutil` and PyMuPDF; 12 reel videos ignored). Primary facts per project came from the CPS July 2026 fact sheets (`*_Project_Details.docx`) and Adani's June 2026 configuration sheets; brochures supplied amenities, township facts, distances and images. Output: `src/content/projects/shantigram/{slug}.json` ×13 + `_township.json`, each with `sources` and `dataGaps`.

**Pricing authority (owner's instruction, 2026-09-20): `00 Series Master.docx`.** Each project JSON now carries `priceRange {display, min, max, source: 'CPS Series Master, July 2026'}` taken from the master's reel-order table; the per-configuration prices from the fact sheets are retained where they exist and agree. Every price on the pages is dated "as of July 2026" from the data, never the build date.

| Project | Developer | Type | Configs | Carpet area | Super built-up | Price | Price date | Possession | Status | RERA no. | Units | Towers | Floors | Land area | Amenities | Location in twp | Landmarks / distances | Photos | Floor plans |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Ambrosia | ✔ | ✔ | 2 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✘ | 23 | ✘ | 0 | 10 | 0 |
| Amora | ✔ | ✔ | 2 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✘ | 13 | ✘ | 0 | 9 | 0 |
| Belrosa | ✔ | ✔ | 4 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | 22 | ✔ | 0 | 10 | 7 |
| Elysium Novus | ✔ | ✔ | 2 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✘ | 18 | ✘ | 0 | 8 | 8 |
| Embrace | ✔ | ✔ | 3 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✘ | 10 | ✘ | 0 | 12 | 7 |
| Greenfield | ✔ | ✔ | 2 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✘ | 8 | ✘ | 0 | 9 | 3 |
| Ikaria | ✔ | ✔ | 3 | ✔ | ✘ | ✔ | ✔ | ✔ | ✔ | ✔ | ✘ | ✘ | ✘ | ✘ | 10 | ✘ | 0 | 9 | 1 |
| Paarijat | ✔ | ✔ | 2 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✘ | 7 | ✘ | 0 | 11 | 0 |
| Skyline | ✔ | ✔ | 2 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✘ | 8 | ✔ | 0 | 9 | 1 |
| The North Park | ✔ | ✔ | 1 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✘ | ✘ | ✘ | 14 | ✔ | 0 | 12 | 0 |
| The Storeys Golf Coast | ✔ | ✔ | 3 | ✔ | ✘ | ✔ (band) | ✔ | ✘ | ✔ | ✔ | ✔ | ✘ | ✘ | ✘ | 10 | ✔ | 7 | 10 | 2 |
| The Storeys Infinity | ✔ | ✔ | 3 | ✘ | ✔ | ✔ (band) | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | 7 | ✔ | 0 | 12 | 0 |
| The West Park | ✔ | ✔ | 1 | ✔ | ✘ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✘ | ✘ | ✔ | 15 | ✔ | 0 | 10 | 2 |
| **Missing (of 13)** | 0 | 0 | 0 | 1 | 3 | 0 | 0 | 1 | 0 | 0 | 1 | 4 | 4 | 10 | 0 | 7 | 12 | 0 | 5 |

Notes on the ✘ cells and on conflicts recorded verbatim in `dataGaps` (none resolved by inference):
- **Prices — The Storeys Golf Coast / The Storeys Infinity:** the project fact sheets say "Not published" / "On request"; per your instruction the Series Master bands are used — **₹5.62–7.02 Cr** and **₹3.26–6.82 Cr** — shown as a *project band* on every configuration row, in the overview, the FAQ and the `AggregateOffer`, with the source named on the page ("Price source: CPS Series Master, July 2026"). Golf Coast's band is consistent with the developer's rate sheet effective 17 Jul 2026 (₹8,000/sq ft on indicative SBU). No project is now "on request".
- **Greenfield:** fact sheet ₹1.83 Cr onwards vs Adani's published ₹1.73 Cr onwards — the fact sheet figure is shown, the conflict is stated on the page; booking amount "45%" flagged in the sheet itself as a probable error and not shown; RERA promoter entity unstated.
- **The North Park / The West Park:** brochure plot/built-up areas and fact-sheet "salable/usable" areas do not reconcile; both sets are shown, labelled by source.
- **The Storeys Infinity:** RERA number recorded as `RAA16989/170626/311231` with the sheet's own "verify on the portal" note; carpet only as an overall range.
- **Land area** is stated for only 3 projects; **location within the township** for 6 (from key plans / brochure text); **landmark distances** exist only in the Golf Coast brochure (from the township's Zero Circle) and are used on the hub.
- Ikaria, Paarijat, Golf Coast and Infinity brochures are image-only PDFs, so no additional facts could be pulled from them.

### Images extracted

Embedded images ≥ 700 px from every brochure/configuration PDF; pages whose text says "unit plan / floor plan / typical floor / plot area" rendered as floor plans; greyscale drawings on image-only brochures reclassified as plans; decorative panels, logos and near-blank frames dropped by colour-variance filters; de-duplicated; resized ≤ 1600 px, JPEG q82 progressive. **140 photos + 31 floor plans, 36 MB** in `public/uploads/projects/shantigram/`. Galleries are auto-curated — worth a two-minute prune per project before going live.

| Project | Photos | Floor plans |
|---|---|---|
| ambrosia | 10 | 0 |
| amora | 9 | 0 |
| belrosa | 10 | 7 |
| elysium-novus | 8 | 8 |
| embrace | 12 | 7 |
| greenfield | 9 | 3 |
| ikaria | 9 | 1 |
| paarijat | 11 | 0 |
| skyline | 9 | 1 |
| the-north-park | 12 | 0 |
| the-storeys-golf-coast | 10 | 2 |
| the-storeys-infinity | 12 | 0 |
| the-west-park | 10 | 2 |
| township | 9 | 0 |

## 2. Original copy

All descriptive text is generated in `src/lib/shantigram-content.ts` from the JSON — consultant tone, facts only, "on request" where no price exists, a disclaimer under every price block, and each page's "What the documents do not state" paragraph exposes the gaps rather than hiding them. Amenity lists are alphabetised so even list order is ours.

**Verbatim check (how):** every extracted source text (all 74 documents) was normalised to lowercase alphanumerics and joined into one corpus. From each built page, prose (`<p>`, `<dd>`, headings) and label rows (`<li>`, `<td>`, `<th>`) were split into sentences of ≥ 8 words. Each sentence was tested (a) for exact containment in the corpus and (b) for any 8-word run shared with it.

**Result:** 478 prose sentences across the 14 pages — **0 verbatim**, 16 share an 8-word run; every one of those 16 is an enumeration of facts (unit counts "1 tower, 52 units; deluxe: 2 towers, 104 units", the quoted payment terms, the distance list, amenity names read out in a FAQ answer). 14 label rows (amenity names, configuration labels) share runs by nature — they are the facts themselves. No brochure sentence, tagline or marketing line appears on any page.

## 3. Township hub — `/projects/adani-shantigram/`

**/projects/adani-shantigram/**  
H1: Adani Shantigram, Ahmedabad  
Title (49): Adani Shantigram, Ahmedabad: 13 Projects Compared  
Description (145): Adani Shantigram, Ahmedabad: 13 current projects compared by configuration, size, price (as of Jul 2026) and possession, from ₹86 L to ₹18.04 Cr.  
Words: 2321 (body) / 2177 (main) · text/HTML 24.6% · robots: `noindex, nofollow`

Intro / overview:
> Adani Shantigram is an integrated township developed by Adani Realty. It sits at Vaishnodevi Circle on the SG Highway, on the corridor that links Ahmedabad to Gandhinagar. The developer's own overview puts it at 580+ acres; some project brochures round that to roughly 600 acres. It is planned in 3 zones — residential zone, commercial and business zone and urbanscape zone — and holds IGBC Gold-rated certification as a township.
> Within the boundary sit The Belvedere Golf & Country Club (a 100-acre club with a 9-hole course and a 15 m wide, 1.5 km long golf promenade with seating), Waterlily Lake, a 7-acre lake with a musical aqua show and lake promenade, a preschool, Adani International School and Adani University, and a commercial zone that includes Inspire Business Park, Inspire Corporate Capital and Inspire Edge. The township has its own sub post office and PIN code, and 50,000+ trees across its parks and canal-side stretches.
> For buyers the practical picture is this: 13 residential projects are currently selling, 11 of them apartment developments, 1 villa scheme and 1 plotted scheme. 3 are ready to move in (Ikaria, Paarijat and The West Park); the rest are under construction with possession windows from about a year out to December 2031. Published pricing runs from ₹86 L for a one-bedroom home at Ikaria to ₹18.04 Cr for a six-bedroom duplex at Belrosa; 2 projects (The Storeys Golf Coast and The Storeys Infinity) quote on request only.
> City Property Services advises buyers across every project in the township, on resale in the 11 completed clusters as well as on new bookings. We are an independent, RERA-registered consultant (AG/GJ/AHMEDABAD/AHMADABADCITY/AUDA/AA00003/220329R2); the developer of every project here is Adani Realty, in some cases with a named development partner. Figures below are as stated in the developer's July 2026 fact sheets and configuration sheets, and every price should be re-confirmed at the time of booking.

| Project | Type | Configurations | Size range | Price (Jul 2026) | Possession | Status |
|---|---|---|---|---|---|---|
| Ikaria · with Collated | Apartments | 1 BDR · 2 BDR | 580 to 854 sq ft (RERA carpet) | ₹86 L to ₹1.05 Cr | Ready to move in | Ready to move in |
| Elysium Novus | Apartments | 3 BHK · 2 BHK | 717 to 1,104 sq ft (RERA carpet) | ₹1.23 Cr to ₹1.61 Cr | Approximately 2.5 years | Under construction |
| Amora | Apartments | 3 BHK | 1,042 to 1,088 sq ft (RERA carpet) | ₹1.4 Cr to ₹2.35 Cr | Approximately 3.5 years | Under construction |
| Embrace | Apartments | 3 BHK | 1,082 to 2,818 sq ft (RERA carpet) | ₹1.42 Cr to ₹1.7 Cr | Approximately 12 to 15 months | Under construction, nearing completion |
| Greenfield · with Shivalik and Adesh | Apartments | 3 BHK · 4 BHK penthouse | 1,379 to 2,365 sq ft (RERA carpet) | ₹1.83 Cr to ₹3.73 Cr | Approximately 2.5 years | Under construction |
| Skyline · with Shilp | Apartments | 4 BHK, Block B · 4 BHK, Blocks A and C | 1,596 to 1,689 sq ft (RERA carpet) | ₹2.28 Cr to ₹2.43 Cr | Approximately 2 years | Under construction |
| Paarijat · with B Safal | Apartments | 4 BHK · 3 BHK | 1,509 to 1,714 sq ft (RERA carpet) | ₹2.42 Cr | Ready to move in | Ready to move in, few units left |
| Ambrosia | Apartments | 4 BHK Classic · 4 BHK Deluxe | 1,785 to 2,066 sq ft (RERA carpet) | ₹2.45 Cr to ₹2.94 Cr | September 2026 | Under construction |
| Belrosa | Apartments | 4 BHK simplex · 5 BHK simplex · 5 BHK duplex · 6 BHK duplex | 2,942 to 6,911 sq ft (RERA carpet) | ₹5.38 Cr to ₹18.04 Cr | Approximately 4 years | Under construction |
| The North Park | Villas | 4 BHK villa | 2,961 to 3,375 sq ft (plot area) | ₹8.4 Cr to ₹9.3 Cr | Approximately 12 months | Under construction |
| The West Park | Plots | Residential plot | 3,933 to 6,210 sq ft (plot area) | ₹9.25 Cr onwards | Ready to move in | Ready to move in (within 60 days) |
| The Storeys Golf Coast · with UB Heritage | Apartments | South Tower 4 BHK · North Tower 5 BHK | 3,501 to 4,664 sq ft (RERA carpet) | On request | Not published | Under construction |
| The Storeys Infinity | Apartments | 4 BHK apartment · 4 BHK courtyard home · 5 BHK penthouse | 2,422 to 5,019 sq ft (not broken out by configuration) | On request | December 2031 per the RERA declaration | New launch, under construction |

FAQ:
- **Which projects are currently selling in Adani Shantigram?** 13 projects: Ikaria, Elysium Novus, Amora, Embrace, Greenfield, Skyline, Paarijat, Ambrosia, Belrosa, The North Park, The West Park, The Storeys Golf Coast and The Storeys Infinity. 11 are apartment developments; The North Park is villas and The West Park is plots. Each has its own page on this site with configurations, prices and RERA details.
- **What do homes in Adani Shantigram cost?** Published all-inclusive prices as of July 2026 run from ₹86 L (Ikaria, 1 BDR (A)) to ₹18.04 Cr (Belrosa, 6 BHK duplex). By band: Ikaria ₹86 L to ₹1.05 Cr, Elysium Novus ₹1.23 Cr to ₹1.61 Cr, Amora ₹1.4 Cr to ₹2.35 Cr and Embrace ₹1.42 Cr to ₹1.7 Cr at the entry end; Belrosa ₹5.38 Cr to ₹18.04 Cr, The North Park ₹8.4 Cr to ₹9.3 Cr and The West Park ₹9.25 Cr onwards at the top. The Storeys Golf Coast and The Storeys Infinity are quoted on request. All figures move without notice and must be confirmed with the developer.
- **Which Shantigram projects are ready to move in?** Ikaria — ready to move in, Paarijat — ready to move in, few units left and The West Park — ready to move in within 60 days. Embrace is nearing completion with possession estimated at approximately 12 to 15 months from July 2026, and Ambrosia is due in September 2026.
- **Are the projects RERA registered?** Every project on this page carries a Gujarat RERA number in the developer's documents: Ikaria RAA10359, Elysium Novus RAA14729, Amora MAA16481, Embrace RAA12526, Greenfield RAA14879, Skyline RAA14084, Paarijat RAA10759, Ambrosia RAA10833, Belrosa RAA15538, The North Park RAA06343, The West Park RAA11300, The Storeys Golf Coast RAA14971 and The Storeys Infinity RAA16989/170626/311231. The Storeys Infinity’s number is recorded with a note to verify it on the portal. Check any number at gujrera.gujarat.gov.in before paying a token; the certificate states the promoter, the sanctioned plan and the declared possession date.
- **How far is Adani Shantigram from SG Highway, Gandhinagar and the airport?** The township sits at Vaishnodevi Circle on the SG Highway, 1.5 km from the circle itself measured from the township's Zero Circle. Developer-stated distances from Zero Circle: Vaishnodevi Circle 1.5 km, Gandhinagar (GH-0) 13.4 km, Zydus Hospital 10.7 km, Iscon Circle 15 km, Bopal Junction 16.4 km, Airport 17 km and GIFT City 21.3 km.
- **Is Adani Shantigram a good investment?** It depends on the project, the price you pay and your holding period, and no consultant can promise appreciation. What the data supports: this is a single-developer township whose overview lists the golf club, school, university, retail centres and a dedicated power substation as operating, with 11 completed residential clusters already trading on resale, and a wide price ladder from ₹86 L to ₹18.04 Cr. Under-construction entries carry a 1 to 5 year wait and construction-linked payment plans; ready stock (Ikaria, Paarijat and The West Park) removes delivery risk at a higher entry price. We can show you registered resale transactions in the completed clusters so you can judge the numbers yourself.
- **Who developed Adani Shantigram and how large is it?** Adani Realty, the real estate arm of the Adani Group, which states 15+ years of operation, 33+ million sq ft delivered and 144+ million sq ft under development across Ahmedabad, Gurugram, Mumbai and Pune. The township is 580+ acres by the developer's overview (about 600 acres in some brochures) and, by the developer's count, home to 4,000+ families.
- **Which projects have villas or plots rather than apartments?** The North Park (28 ground + 2 levels with private elevator villas, ₹8.4 Cr to ₹9.3 Cr) and The West Park (61 plots on 9+ acres, ₹9.25 Cr onwards). Everything else in the township's current phase is apartments, from 1 BDR senior-living homes at Ikaria to 6 BHK duplexes at Belrosa.
- **What is the cheapest way into Adani Shantigram?** Ikaria, at ₹86 L to ₹1.05 Cr — but note it is senior-friendly 1 and 2 bedroom homes designed for residents over 55, with a service-led operating model. The lowest-priced under-construction family apartments are at Elysium Novus (₹1.23 Cr to ₹1.61 Cr), followed by Amora and Embrace. Resale units in the completed clusters are a further option; ask us for current availability.
- **What schools, healthcare and shopping are inside the township?** Preschool, Adani International School and Adani University for education; Medico House (healthcare hub), Ambulance service and Pharmacies for healthcare; Shoppers’ Plaza, Center Point (about 90,000 sq ft of shopping, dining and entertainment) and Restaurants and cafes for shopping and dining, plus major bank branches and sub post office with its own pin code.

`@graph` — page nodes (the four sitewide nodes — RealEstateAgent `#organization`, Person, CIRIL, WebSite — are as in batch 4 and omitted here):
```json
[
 {
  "@type": "BreadcrumbList",
  "@id": "https://cityprop.co.in/projects/adani-shantigram/#breadcrumb",
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
    "name": "Projects",
    "item": "https://cityprop.co.in/projects/adani-shantigram/"
   },
   {
    "@type": "ListItem",
    "position": 3,
    "name": "Adani Shantigram",
    "item": "https://cityprop.co.in/projects/adani-shantigram/"
   }
  ]
 },
 {
  "@type": "CollectionPage",
  "@id": "https://cityprop.co.in/projects/adani-shantigram/#page",
  "url": "https://cityprop.co.in/projects/adani-shantigram/",
  "name": "Adani Shantigram, Ahmedabad",
  "description": "Adani Shantigram, Ahmedabad: 13 current projects compared by configuration, size, price (as of Jul 2026) and possession, from ₹86 L to ₹18.04 Cr.",
  "isPartOf": {
   "@id": "https://cityprop.co.in/#website"
  },
  "about": {
   "@id": "https://cityprop.co.in/projects/adani-shantigram/#township"
  },
  "mainEntity": {
   "@id": "https://cityprop.co.in/projects/adani-shantigram/#list"
  },
  "provider": {
   "@id": "https://cityprop.co.in/#organization"
  }
 },
 {
  "@type": "Place",
  "@id": "https://cityprop.co.in/projects/adani-shantigram/#township",
  "name": "Adani Shantigram",
  "description": "580+ acres integrated township by Adani Realty at Vaishnodevi Circle, SG Highway, between Ahmedabad and Gandhinagar; IGBC Certified Gold-rated township.",
  "address": {
   "@type": "PostalAddress",
   "streetAddress": "Vaishnodevi Circle, SG Highway",
   "addressLocality": "Ahmedabad",
   "addressRegion": "Gujarat",
   "addressCountry": "IN"
  },
  "geo": {
   "@type": "GeoCoordinates",
   "latitude": 23.16507,
   "longitude": 72.5383
  },
  "containedInPlace": {
   "@type": "City",
   "name": "Ahmedabad"
  },
  "containsPlace": [
   {
    "@id": "https://cityprop.co.in/projects/adani-shantigram/ikaria/#project"
   },
   {
    "@id": "https://cityprop.co.in/projects/adani-shantigram/elysium-novus/#project"
   },
   {
    "@id": "https://cityprop.co.in/projects/adani-shantigram/amora/#project"
   },
   {
    "@id": "https://cityprop.co.in/projects/adani-shantigram/embrace/#project"
   },
   {
    "@id": "https://cityprop.co.in/projects/adani-shantigram/greenfield/#project"
   },
   {
    "@id": "https://cityprop.co.in/projects/adani-shantigram/skyline/#project"
   },
   {
    "@id": "https://cityprop.co.in/projects/adani-shantigram/paarijat/#project"
   },
   {
    "@id": "https://cityprop.co.in/projects/adani-shantigram/ambrosia/#project"
   },
   {
    "@id": "https://cityprop.co.in/projects/adani-shantigram/belrosa/#project"
   },
   {
    "@id": "https://cityprop.co.in/projects/adani-shantigram/the-north-park/#project"
   },
   {
    "@id": "https://cityprop.co.in/projects/adani-shantigram/the-west-park/#project"
   },
   {
    "@id": "https://cityprop.co.in/projects/adani-shantigram/the-storeys-golf-coast/#project"
   },
   {
    "@id": "https://cityprop.co.in/projects/adani-shantigram/the-storeys-infinity/#project"
   }
  ],
  "amenityFeature": [
   {
    "@type": "LocationFeatureSpecification",
    "name": "The Belvedere Golf & Country Club",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Waterlily Lake",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Preschool",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Adani International School",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Adani University",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Shoppers’ Plaza",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Center Point (about 90,000 sq ft of shopping, dining and entertainment)",
    "value": true
   }
  ]
 },
 {
  "@type": "Organization",
  "@id": "https://cityprop.co.in/#adani-realty",
  "name": "Adani Realty",
  "description": "Developer of Adani Shantigram and every project listed on this page. Not affiliated with City Property Services."
 },
 {
  "@type": "ItemList",
  "@id": "https://cityprop.co.in/projects/adani-shantigram/#list",
  "name": "Projects in Adani Shantigram",
  "numberOfItems": 13,
  "itemListOrder": "https://schema.org/ItemListOrderAscending",
  "itemListElement": [
   {
    "@type": "ListItem",
    "position": 1,
    "name": "Ikaria",
    "url": "https://cityprop.co.in/projects/adani-shantigram/ikaria/",
    "item": {
     "@id": "https://cityprop.co.in/projects/adani-shantigram/ikaria/#project"
    }
   },
   {
    "@type": "ListItem",
    "position": 2,
    "name": "Elysium Novus",
    "url": "https://cityprop.co.in/projects/adani-shantigram/elysium-novus/",
    "item": {
     "@id": "https://cityprop.co.in/projects/adani-shantigram/elysium-novus/#project"
    }
   },
   {
    "@type": "ListItem",
    "position": 3,
    "name": "Amora",
    "url": "https://cityprop.co.in/projects/adani-shantigram/amora/",
    "item": {
     "@id": "https://cityprop.co.in/projects/adani-shantigram/amora/#project"
    }
   },
   {
    "@type": "ListItem",
    "position": 4,
    "name": "Embrace",
    "url": "https://cityprop.co.in/projects/adani-shantigram/embrace/",
    "item": {
     "@id": "https://cityprop.co.in/projects/adani-shantigram/embrace/#project"
    }
   },
   {
    "@type": "ListItem",
    "position": 5,
    "name": "Greenfield",
    "url": "https://cityprop.co.in/projects/adani-shantigram/greenfield/",
    "item": {
     "@id": "https://cityprop.co.in/projects/adani-shantigram/greenfield/#project"
    }
   },
   {
    "@type": "ListItem",
    "position": 6,
    "name": "Skyline",
    "url": "https://cityprop.co.in/projects/adani-shantigram/skyline/",
    "item": {
     "@id": "https://cityprop.co.in/projects/adani-shantigram/skyline/#project"
    }
   },
   {
    "@type": "ListItem",
    "position": 7,
    "name": "Paarijat",
    "url": "https://cityprop.co.in/projects/adani-shantigram/paarijat/",
    "item": {
     "@id": "https://cityprop.co.in/projects/adani-shantigram/paarijat/#project"
    }
   },
   {
    "@type": "ListItem",
    "position": 8,
    "name": "Ambrosia",
    "url": "https://cityprop.co.in/projects/adani-shantigram/ambrosia/",
    "item": {
     "@id": "https://cityprop.co.in/projects/adani-shantigram/ambrosia/#project"
    }
   },
   {
    "@type": "ListItem",
    "position": 9,
    "name": "Belrosa",
    "url": "https://cityprop.co.in/projects/adani-shantigram/belrosa/",
    "item": {
     "@id": "https://cityprop.co.in/projects/adani-shantigram/belrosa/#project"
    }
   },
   {
    "@type": "ListItem",
    "position": 10,
    "name": "The North Park",
    "url": "https://cityprop.co.in/projects/adani-shantigram/the-north-park/",
    "item": {
     "@id": "https://cityprop.co.in/projects/adani-shantigram/the-north-park/#project"
    }
   },
   {
    "@type": "ListItem",
    "position": 11,
    "name": "The West Park",
    "url": "https://cityprop.co.in/projects/adani-shantigram/the-west-park/",
    "item": {
     "@id": "https://cityprop.co.in/projects/adani-shantigram/the-west-park/#project"
    }
   },
   {
    "@type": "ListItem",
    "position": 12,
    "name": "The Storeys Golf Coast",
    "url": "https://cityprop.co.in/projects/adani-shantigram/the-storeys-golf-coast/",
    "item": {
     "@id": "https://cityprop.co.in/projects/adani-shantigram/the-storeys-golf-coast/#project"
    }
   },
   {
    "@type": "ListItem",
    "position": 13,
    "name": "The Storeys Infinity",
    "url": "https://cityprop.co.in/projects/adani-shantigram/the-storeys-infinity/",
    "item": {
     "@id": "https://cityprop.co.in/projects/adani-shantigram/the-storeys-infinity/#project"
    }
   }
  ]
 },
 {
  "@type": "FAQPage",
  "@id": "https://cityprop.co.in/projects/adani-shantigram/#faq",
  "mainEntity": [
   {
    "@type": "Question",
    "name": "Which projects are currently selling in Adani Shantigram?",
    "acceptedAnswer": {
     "@type": "Answer",
     "text": "13 projects: Ikaria, Elysium Novus, Amora, Embrace, Greenfield, Skyline, Paarijat, Ambrosia, Belrosa, The North Park, The West Park, The Storeys Golf Coast and The Storeys Infinity. 11 are apartment developments; The North Park is villas and The West Park is plots. Each has its own page on this site with configurations, prices and RERA details."
    }
   },
   {
    "@type": "Question",
    "name": "What do homes in Adani Shantigram cost?",
    "acceptedAnswer": {
     "@type": "Answer",
     "text": "Published all-inclusive prices as of July 2026 run from ₹86 L (Ikaria, 1 BDR (A)) to ₹18.04 Cr (Belrosa, 6 BHK duplex). By band: Ikaria ₹86 L to ₹1.05 Cr, Elysium Novus ₹1.23 Cr to ₹1.61 Cr, Amora ₹1.4 Cr to ₹2.35 Cr and Embrace ₹1.42 Cr to ₹1.7 Cr at the entry end; Belrosa ₹5.38 Cr to ₹18.04 Cr, The North Park ₹8.4 Cr to ₹9.3 Cr and The West Park ₹9.25 Cr onwards at the top. The Storeys Golf Coast and The Storeys Infinity are quoted on request. All figures move without notice and must be confirmed with the developer."
    }
   },
   {
    "@type": "Question",
    "name": "Which Shantigram projects are ready to move in?",
    "acceptedAnswer": {
     "@type": "Answer",
     "text": "Ikaria — ready to move in, Paarijat — ready to move in, few units left and The West Park — ready to move in within 60 days. Embrace is nearing completion with possession estimated at approximately 12 to 15 months from July 2026, and Ambrosia is due in September 2026."
    }
   },
   {
    "@type": "Question",
    "name": "Are the projects RERA registered?",
    "acceptedAnswer": {
     "@type": "Answer",
     "text": "Every project on this page carries a Gujarat RERA number in the developer's documents: Ikaria RAA10359, Elysium Novus RAA14729, Amora MAA16481, Embrace RAA12526, Greenfield RAA14879, Skyline RAA14084, Paarijat RAA10759, Ambrosia RAA10833, Belrosa RAA15538, The North Park RAA06343, The West Park RAA11300, The Storeys Golf Coast RAA14971 and The Storeys Infinity RAA16989/170626/311231. The Storeys Infinity’s number is recorded with a note to verify it on the portal. Check any number at gujrera.gujarat.gov.in before paying a token; the certificate states the promoter, the sanctioned plan and the declared possession date."
    }
   },
   {
    "@type": "Question",
    "name": "How far is Adani Shantigram from SG Highway, Gandhinagar and the airport?",
    "acceptedAnswer": {
     "@type": "Answer",
     "text": "The township sits at Vaishnodevi Circle on the SG Highway, 1.5 km from the circle itself measured from the township's Zero Circle. Developer-stated distances from Zero Circle: Vaishnodevi Circle 1.5 km, Gandhinagar (GH-0) 13.4 km, Zydus Hospital 10.7 km, Iscon Circle 15 km, Bopal Junction 16.4 km, Airport 17 km and GIFT City 21.3 km."
    }
   },
   {
    "@type": "Question",
    "name": "Is Adani Shantigram a good investment?",
    "acceptedAnswer": {
     "@type": "Answer",
     "text": "It depends on the project, the price you pay and your holding period, and no consultant can promise appreciation. What the data supports: this is a single-developer township whose overview lists the golf club, school, university, retail centres and a dedicated power substation as operating, with 11 completed residential clusters already trading on resale, and a wide price ladder from ₹86 L to ₹18.04 Cr. Under-construction entries carry a 1 to 5 year wait and construction-linked payment plans; ready stock (Ikaria, Paarijat and The West Park) removes delivery risk at a higher entry price. We can show you registered resale transactions in the completed clusters so you can judge the numbers yourself."
    }
   },
   {
    "@type": "Question",
    "name": "Who developed Adani Shantigram and how large is it?",
    "acceptedAnswer": {
     "@type": "Answer",
     "text": "Adani Realty, the real estate arm of the Adani Group, which states 15+ years of operation, 33+ million sq ft delivered and 144+ million sq ft under development across Ahmedabad, Gurugram, Mumbai and Pune. The township is 580+ acres by the developer's overview (about 600 acres in some brochures) and, by the developer's count, home to 4,000+ families."
    }
   },
   {
    "@type": "Question",
    "name": "Which projects have villas or plots rather than apartments?",
    "acceptedAnswer": {
     "@type": "Answer",
     "text": "The North Park (28 ground + 2 levels with private elevator villas, ₹8.4 Cr to ₹9.3 Cr) and The West Park (61 plots on 9+ acres, ₹9.25 Cr onwards). Everything else in the township's current phase is apartments, from 1 BDR senior-living homes at Ikaria to 6 BHK duplexes at Belrosa."
    }
   },
   {
    "@type": "Question",
    "name": "What is the cheapest way into Adani Shantigram?",
    "acceptedAnswer": {
     "@type": "Answer",
     "text": "Ikaria, at ₹86 L to ₹1.05 Cr — but note it is senior-friendly 1 and 2 bedroom homes designed for residents over 55, with a service-led operating model. The lowest-priced under-construction family apartments are at Elysium Novus (₹1.23 Cr to ₹1.61 Cr), followed by Amora and Embrace. Resale units in the completed clusters are a further option; ask us for current availability."
    }
   },
   {
    "@type": "Question",
    "name": "What schools, healthcare and shopping are inside the township?",
    "acceptedAnswer": {
     "@type": "Answer",
     "text": "Preschool, Adani International School and Adani University for education; Medico House (healthcare hub), Ambulance service and Pharmacies for healthcare; Shoppers’ Plaza, Center Point (about 90,000 sq ft of shopping, dining and entertainment) and Restaurants and cafes for shopping and dining, plus major bank branches and sub post office with its own pin code."
    }
   }
  ]
 }
]
```

## 4. Project pages

**/projects/adani-shantigram/elysium-novus/**  
H1: Elysium Novus, Adani Shantigram, Ahmedabad  
Title (42): Elysium Novus, Adani Shantigram, Ahmedabad  
Description (147): Elysium Novus at Adani Shantigram, Ahmedabad: 3 BHK · 2 BHK apartments, ₹1.23 Cr to ₹1.61 Cr (as of July 2026), possession approx. 2.5 years, RERA.  
Words: 1283 (body) / 1139 (main) · text/HTML 16.5% · robots: `noindex, nofollow`

Intro / overview:
> Elysium Novus is an apartment project by Adani Realty inside Adani Shantigram, the 580+ acres township at Vaishnodevi Circle on the SG Highway. 3 and 2 BHK homes; the lowest-priced under-construction entry in the township. The scheme comprises 6 towers, 14 floors and 336 homes. Its Gujarat RERA registration is RAA14729, and the developer describes its status as "under construction", with possession stated as approximately 2.5 years as of July 2026.
> Configurations on offer are 3 BHK and 2 BHK. 1 of 2 carry a published all-inclusive price: 3 BHK at ₹1.23 Cr to ₹1.61 Cr for 1,796 to 2,070 sq ft super built-up. RERA carpet areas run from 717 to 1,104 sq ft. These are the developer's quotes as of July 2026; they are not fixed and the current rate must be confirmed before booking.
> The booking amount is ₹5.25 L, and payment terms are stated as “9% + 11% = 20% in 30 + 30 days, then construction-linked plan”. Car parking is 1 per home.
> What the documents do not state: 2 BHK salable area and price not published. We flag these so you can ask the right questions at the sales office.

| Configuration | RERA carpet (sq ft) | Super built-up (sq ft) | Price (as of July 2026) |
|---|---|---|---|
| 3 BHK | 973.93 to 1,103.63 | 1,796 to 2,070 | ₹1.23 Cr to ₹1.61 Cr |
| 2 BHK | 717.42 | — | Not published |

Specifications: Developer: Adani Realty; Project type: Apartments; Gujarat RERA: RAA14729; Status: Under construction; Possession: Approximately 2.5 years (from July 2026); Towers: 6; Floors: 14; Total units: 336; Car parking: 1 per home; Booking amount: ₹5.25 L; Payment terms: 9% + 11% = 20% in 30 + 30 days, then construction-linked plan; Prices as of: July 2026

Amenities: Amphitheatre, Badminton court, Box cricket, Central court lawn, Club house, Drop-off zone, Entrance court, Half basketball court, Kids’ play area, Meditation area, Outdoor fitness, Pet park, Reflexology park, Seating area with pergola, Seating plaza, Senior citizen sit-out, Skating rink, Swimming pool

FAQ:
- **What configurations does Elysium Novus offer?** 3 BHK and 2 BHK, with stated areas from 717 to 1,104 sq ft (RERA carpet). Super built-up areas are 1,796 to 2,070 sq ft for the 3 BHK.
- **How much does a home at Elysium Novus cost?** ₹1.23 Cr to ₹1.61 Cr all-inclusive as of July 2026: 3 BHK ₹1.23 Cr to ₹1.61 Cr. 2 BHK is not priced in the published sheet. Statutory charges such as GST, stamp duty and registration are additional where applicable; ask us for a line-by-line cost sheet.
- **When will Elysium Novus be ready for possession?** The developer states possession as approximately 2.5 years (as of July 2026) and the status as under construction. The RERA certificate carries the legally declared completion date; check it at gujrera.gujarat.gov.in under RAA14729.
- **Is Elysium Novus RERA registered, and who is the promoter?** Yes — the developer's documents give Gujarat RERA number RAA14729. The developer is Adani Realty. City Property Services is an independent consultant and not the promoter of this project.
- **How big is Elysium Novus?** 6 towers, 14 floors and 336 homes. Parking allocation is 1 per home.
- **What amenities does Elysium Novus have?** Amphitheatre, Badminton court, Box cricket, Central court lawn, Club house, Drop-off zone, Entrance court, Half basketball court, Kids’ play area, Meditation area and 8 more listed on this page. Residents also use the township-level facilities — The Belvedere Golf & Country Club, the lake and promenade, schools and retail — which are shared across Adani Shantigram.

`@graph` — page nodes (the four sitewide nodes — RealEstateAgent `#organization`, Person, CIRIL, WebSite — are as in batch 4 and omitted here):
```json
[
 {
  "@type": "BreadcrumbList",
  "@id": "https://cityprop.co.in/projects/adani-shantigram/elysium-novus/#breadcrumb",
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
    "name": "Adani Shantigram",
    "item": "https://cityprop.co.in/projects/adani-shantigram/"
   },
   {
    "@type": "ListItem",
    "position": 3,
    "name": "Elysium Novus",
    "item": "https://cityprop.co.in/projects/adani-shantigram/elysium-novus/"
   }
  ]
 },
 {
  "@type": "WebPage",
  "@id": "https://cityprop.co.in/projects/adani-shantigram/elysium-novus/#page",
  "url": "https://cityprop.co.in/projects/adani-shantigram/elysium-novus/",
  "name": "Elysium Novus, Adani Shantigram, Ahmedabad",
  "description": "Elysium Novus at Adani Shantigram, Ahmedabad: 3 BHK · 2 BHK apartments, ₹1.23 Cr to ₹1.61 Cr (as of July 2026), possession approx. 2.5 years, RERA.",
  "isPartOf": {
   "@id": "https://cityprop.co.in/#website"
  },
  "about": {
   "@id": "https://cityprop.co.in/projects/adani-shantigram/elysium-novus/#project"
  },
  "provider": {
   "@id": "https://cityprop.co.in/#organization"
  }
 },
 {
  "@type": "ApartmentComplex",
  "@id": "https://cityprop.co.in/projects/adani-shantigram/elysium-novus/#project",
  "name": "Elysium Novus, Adani Shantigram",
  "description": "Elysium Novus is an apartment project by Adani Realty inside Adani Shantigram, the 580+ acres township at Vaishnodevi Circle on the SG Highway. 3 and 2 BHK homes; the lowest-priced under-construction entry in the township. The scheme comprises 6 towers, 14 floors and 336 homes. Its Gujarat RERA registration is RAA14729, and the developer describes its status as \"under construction\", with possession stated as approximately 2.5 years as of July 2026.",
  "url": "https://cityprop.co.in/projects/adani-shantigram/elysium-novus/",
  "address": {
   "@type": "PostalAddress",
   "streetAddress": "Adani Shantigram, Vaishnodevi Circle, SG Highway",
   "addressLocality": "Ahmedabad",
   "addressRegion": "Gujarat",
   "addressCountry": "IN"
  },
  "containedInPlace": {
   "@id": "https://cityprop.co.in/projects/adani-shantigram/#township"
  },
  "numberOfAccommodationUnits": 336,
  "image": [
   "https://cityprop.co.in/uploads/projects/shantigram/elysium-novus/photos/photo-01.jpg",
   "https://cityprop.co.in/uploads/projects/shantigram/elysium-novus/photos/photo-02.jpg",
   "https://cityprop.co.in/uploads/projects/shantigram/elysium-novus/photos/photo-03.jpg",
   "https://cityprop.co.in/uploads/projects/shantigram/elysium-novus/photos/photo-04.jpg",
   "https://cityprop.co.in/uploads/projects/shantigram/elysium-novus/photos/photo-05.jpg",
   "https://cityprop.co.in/uploads/projects/shantigram/elysium-novus/photos/photo-06.jpg"
  ],
  "amenityFeature": [
   {
    "@type": "LocationFeatureSpecification",
    "name": "Amphitheatre",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Badminton court",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Box cricket",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Central court lawn",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Club house",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Drop-off zone",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Entrance court",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Half basketball court",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Kids’ play area",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Meditation area",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Outdoor fitness",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Pet park",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Reflexology park",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Seating area with pergola",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Seating plaza",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Senior citizen sit-out",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Skating rink",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Swimming pool",
    "value": true
   }
  ]
 },
 {
  "@type": "Place",
  "@id": "https://cityprop.co.in/projects/adani-shantigram/#township",
  "name": "Adani Shantigram",
  "url": "https://cityprop.co.in/projects/adani-shantigram/",
  "address": {
   "@type": "PostalAddress",
   "addressLocality": "Ahmedabad",
   "addressRegion": "Gujarat",
   "addressCountry": "IN"
  }
 },
 {
  "@type": "Organization",
  "@id": "https://cityprop.co.in/#adani-realty",
  "name": "Adani Realty",
  "description": "Developer of Elysium Novus. Not affiliated with City Property Services."
 },
 {
  "@type": "AggregateOffer",
  "@id": "https://cityprop.co.in/projects/adani-shantigram/elysium-novus/#offers",
  "priceCurrency": "INR",
  "lowPrice": 12300000,
  "highPrice": 16100000,
  "offerCount": 1,
  "itemOffered": {
   "@id": "https://cityprop.co.in/projects/adani-shantigram/elysium-novus/#project"
  },
  "offeredBy": {
   "@id": "https://cityprop.co.in/#adani-realty"
  },
  "validFrom": "2026-07-01",
  "description": "Developer-published all-inclusive prices as of July 2026; subject to change."
 },
 {
  "@type": "FAQPage",
  "@id": "https://cityprop.co.in/projects/adani-shantigram/elysium-novus/#faq",
  "mainEntity": [
   {
    "@type": "Question",
    "name": "What configurations does Elysium Novus offer?",
    "acceptedAnswer": {
     "@type": "Answer",
     "text": "3 BHK and 2 BHK, with stated areas from 717 to 1,104 sq ft (RERA carpet). Super built-up areas are 1,796 to 2,070 sq ft for the 3 BHK."
    }
   },
   {
    "@type": "Question",
    "name": "How much does a home at Elysium Novus cost?",
    "acceptedAnswer": {
     "@type": "Answer",
     "text": "₹1.23 Cr to ₹1.61 Cr all-inclusive as of July 2026: 3 BHK ₹1.23 Cr to ₹1.61 Cr. 2 BHK is not priced in the published sheet. Statutory charges such as GST, stamp duty and registration are additional where applicable; ask us for a line-by-line cost sheet."
    }
   },
   {
    "@type": "Question",
    "name": "When will Elysium Novus be ready for possession?",
    "acceptedAnswer": {
     "@type": "Answer",
     "text": "The developer states possession as approximately 2.5 years (as of July 2026) and the status as under construction. The RERA certificate carries the legally declared completion date; check it at gujrera.gujarat.gov.in under RAA14729."
    }
   },
   {
    "@type": "Question",
    "name": "Is Elysium Novus RERA registered, and who is the promoter?",
    "acceptedAnswer": {
     "@type": "Answer",
     "text": "Yes — the developer's documents give Gujarat RERA number RAA14729. The developer is Adani Realty. City Property Services is an independent consultant and not the promoter of this project."
    }
   },
   {
    "@type": "Question",
    "name": "How big is Elysium Novus?",
    "acceptedAnswer": {
     "@type": "Answer",
     "text": "6 towers, 14 floors and 336 homes. Parking allocation is 1 per home."
    }
   },
   {
    "@type": "Question",
    "name": "What amenities does Elysium Novus have?",
    "acceptedAnswer": {
     "@type": "Answer",
     "text": "Amphitheatre, Badminton court, Box cricket, Central court lawn, Club house, Drop-off zone, Entrance court, Half basketball court, Kids’ play area, Meditation area and 8 more listed on this page. Residents also use the township-level facilities — The Belvedere Golf & Country Club, the lake and promenade, schools and retail — which are shared across Adani Shantigram."
    }
   }
  ]
 }
]
```

---

**/projects/adani-shantigram/the-west-park/**  
H1: The West Park, Adani Shantigram, Ahmedabad  
Title (42): The West Park, Adani Shantigram, Ahmedabad  
Description (153): The West Park at Adani Shantigram, Ahmedabad: 61 residential plots, ₹9.25 Cr onwards (as of July 2026), ready to move, RERA RAA11300. Independent advice.  
Words: 1320 (body) / 1176 (main) · text/HTML 17.4% · robots: `noindex, nofollow`

Intro / overview:
> The West Park is a plotted development by Adani Realty inside Adani Shantigram, the 580+ acres township at Vaishnodevi Circle on the SG Highway. 61 residential plots on 9+ acres where buyers design and build their own villa, with a no-two-homes-alike covenant. The scheme comprises 61 plots on 9+ acres. Its Gujarat RERA registration is RAA11300, and the developer describes its status as "ready to move in (within 60 days)".
> Configurations on offer are Residential plot (Type A). All carry a published all-inclusive price: Residential plot (Type A) at ₹9.25 Cr onwards for a 437 to 690 (approx.) sq yd plot. These are the developer's quotes as of July 2026; they are not fixed and the current rate must be confirmed before booking.
> The booking amount is ₹32 L, and payment terms are stated as “ready to move in, within 60 days”.
> Within the township: Shown on the Golf Coast key plan beside The North Park and the Narmada canal.
> What the documents do not state: Brochure plot range (437–690 sq yd; "starting from 428 sq yd" elsewhere in the same brochure) and fact-sheet salable/usable areas (700+/476+ sq yd) do not reconcile; all are recorded; Only "onwards" pricing is stated; no upper figure. We flag these so you can ask the right questions at the sales office.

| Configuration | Plot (sq yd) | Plot (sq ft) | Unit RERA area (sq ft) | Price (as of July 2026) |
|---|---|---|---|---|
| Residential plot (Type A) | 437 to 690 (approx.) | 3,933 to 6,210 (approx.) | 405 | ₹9.25 Cr onwards — As of July 2026; the earlier July sheet said ₹8.90 Cr onwards |

Specifications: Developer: Adani Realty; Architect: Apurva Amin; Project type: Plots; Gujarat RERA: RAA11300; Status: Ready to move in (within 60 days); Possession: Ready to move in; Total units: 61; Land area: 9+ acres; Booking amount: ₹32 L; Payment terms: Ready to move in, within 60 days; Prices as of: July 2026

Amenities: 18 m wide entry road (master plan), Box cricket, Club house with multipurpose hall, Design and construction concierge on demand, Large plot consolidation option, Multipurpose court, No-two-homes-alike covenant, Party lawn spread over 27,000 sq ft, Secure children’s play zone, Senior citizens’ sit-outs, Sitting plaza, Society office, Ultra low-density, low-rise villas, Walking track, Yoga and meditation area

FAQ:
- **What configurations does The West Park offer?** Residential plot (Type A), with stated areas from 3,933 to 6,210 sq ft (plot area).
- **How much does a home at The West Park cost?** ₹9.25 Cr onwards all-inclusive as of July 2026: Residential plot (Type A) ₹9.25 Cr onwards. Statutory charges such as GST, stamp duty and registration are additional where applicable; ask us for a line-by-line cost sheet.
- **When will The West Park be ready for possession?** The West Park is ready to move in (within 60 days). Possession follows completion of the sale and registration.
- **Is The West Park RERA registered, and who is the promoter?** Yes — the developer's documents give Gujarat RERA number RAA11300. The developer is Adani Realty. City Property Services is an independent consultant and not the promoter of this project.
- **How big is The West Park?** 61 plots on 9+ acres.
- **What amenities does The West Park have?** 18 m wide entry road (master plan), Box cricket, Club house with multipurpose hall, Design and construction concierge on demand, Large plot consolidation option, Multipurpose court, No-two-homes-alike covenant, Party lawn spread over 27,000 sq ft, Secure children’s play zone, Senior citizens’ sit-outs and 5 more listed on this page. Residents also use the township-level facilities — The Belvedere Golf & Country Club, the lake and promenade, schools and retail — which are shared across Adani Shantigram.

`@graph` — page nodes (the four sitewide nodes — RealEstateAgent `#organization`, Person, CIRIL, WebSite — are as in batch 4 and omitted here):
```json
[
 {
  "@type": "BreadcrumbList",
  "@id": "https://cityprop.co.in/projects/adani-shantigram/the-west-park/#breadcrumb",
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
    "name": "Adani Shantigram",
    "item": "https://cityprop.co.in/projects/adani-shantigram/"
   },
   {
    "@type": "ListItem",
    "position": 3,
    "name": "The West Park",
    "item": "https://cityprop.co.in/projects/adani-shantigram/the-west-park/"
   }
  ]
 },
 {
  "@type": "WebPage",
  "@id": "https://cityprop.co.in/projects/adani-shantigram/the-west-park/#page",
  "url": "https://cityprop.co.in/projects/adani-shantigram/the-west-park/",
  "name": "The West Park, Adani Shantigram, Ahmedabad",
  "description": "The West Park at Adani Shantigram, Ahmedabad: 61 residential plots, ₹9.25 Cr onwards (as of July 2026), ready to move, RERA RAA11300. Independent advice.",
  "isPartOf": {
   "@id": "https://cityprop.co.in/#website"
  },
  "about": {
   "@id": "https://cityprop.co.in/projects/adani-shantigram/the-west-park/#project"
  },
  "provider": {
   "@id": "https://cityprop.co.in/#organization"
  }
 },
 {
  "@type": "Residence",
  "@id": "https://cityprop.co.in/projects/adani-shantigram/the-west-park/#project",
  "name": "The West Park, Adani Shantigram",
  "description": "The West Park is a plotted development by Adani Realty inside Adani Shantigram, the 580+ acres township at Vaishnodevi Circle on the SG Highway. 61 residential plots on 9+ acres where buyers design and build their own villa, with a no-two-homes-alike covenant. The scheme comprises 61 plots on 9+ acres. Its Gujarat RERA registration is RAA11300, and the developer describes its status as \"ready to move in (within 60 days)\".",
  "url": "https://cityprop.co.in/projects/adani-shantigram/the-west-park/",
  "address": {
   "@type": "PostalAddress",
   "streetAddress": "Adani Shantigram, Vaishnodevi Circle, SG Highway",
   "addressLocality": "Ahmedabad",
   "addressRegion": "Gujarat",
   "addressCountry": "IN"
  },
  "containedInPlace": {
   "@id": "https://cityprop.co.in/projects/adani-shantigram/#township"
  },
  "additionalProperty": [
   {
    "@type": "PropertyValue",
    "name": "Number of plots",
    "value": 61
   }
  ],
  "image": [
   "https://cityprop.co.in/uploads/projects/shantigram/the-west-park/photos/photo-01.jpg",
   "https://cityprop.co.in/uploads/projects/shantigram/the-west-park/photos/photo-02.jpg",
   "https://cityprop.co.in/uploads/projects/shantigram/the-west-park/photos/photo-03.jpg",
   "https://cityprop.co.in/uploads/projects/shantigram/the-west-park/photos/photo-04.jpg",
   "https://cityprop.co.in/uploads/projects/shantigram/the-west-park/photos/photo-05.jpg",
   "https://cityprop.co.in/uploads/projects/shantigram/the-west-park/photos/photo-06.jpg"
  ],
  "amenityFeature": [
   {
    "@type": "LocationFeatureSpecification",
    "name": "18 m wide entry road (master plan)",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Box cricket",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Club house with multipurpose hall",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Design and construction concierge on demand",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Large plot consolidation option",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Multipurpose court",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "No-two-homes-alike covenant",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Party lawn spread over 27,000 sq ft",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Secure children’s play zone",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Senior citizens’ sit-outs",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Sitting plaza",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Society office",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Ultra low-density, low-rise villas",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Walking track",
    "value": true
   },
   {
    "@type": "LocationFeatureSpecification",
    "name": "Yoga and meditation area",
    "value": true
   }
  ]
 },
 {
  "@type": "Place",
  "@id": "https://cityprop.co.in/projects/adani-shantigram/#township",
  "name": "Adani Shantigram",
  "url": "https://cityprop.co.in/projects/adani-shantigram/",
  "address": {
   "@type": "PostalAddress",
   "addressLocality": "Ahmedabad",
   "addressRegion": "Gujarat",
   "addressCountry": "IN"
  }
 },
 {
  "@type": "Organization",
  "@id": "https://cityprop.co.in/#adani-realty",
  "name": "Adani Realty",
  "description": "Developer of The West Park. Not affiliated with City Property Services."
 },
 {
  "@type": "AggregateOffer",
  "@id": "https://cityprop.co.in/projects/adani-shantigram/the-west-park/#offers",
  "priceCurrency": "INR",
  "lowPrice": 92500000,
  "offerCount": 1,
  "itemOffered": {
   "@id": "https://cityprop.co.in/projects/adani-shantigram/the-west-park/#project"
  },
  "offeredBy": {
   "@id": "https://cityprop.co.in/#adani-realty"
  },
  "validFrom": "2026-07-01",
  "description": "Developer-published all-inclusive prices as of July 2026; subject to change."
 },
 {
  "@type": "FAQPage",
  "@id": "https://cityprop.co.in/projects/adani-shantigram/the-west-park/#faq",
  "mainEntity": [
   {
    "@type": "Question",
    "name": "What configurations does The West Park offer?",
    "acceptedAnswer": {
     "@type": "Answer",
     "text": "Residential plot (Type A), with stated areas from 3,933 to 6,210 sq ft (plot area)."
    }
   },
   {
    "@type": "Question",
    "name": "How much does a home at The West Park cost?",
    "acceptedAnswer": {
     "@type": "Answer",
     "text": "₹9.25 Cr onwards all-inclusive as of July 2026: Residential plot (Type A) ₹9.25 Cr onwards. Statutory charges such as GST, stamp duty and registration are additional where applicable; ask us for a line-by-line cost sheet."
    }
   },
   {
    "@type": "Question",
    "name": "When will The West Park be ready for possession?",
    "acceptedAnswer": {
     "@type": "Answer",
     "text": "The West Park is ready to move in (within 60 days). Possession follows completion of the sale and registration."
    }
   },
   {
    "@type": "Question",
    "name": "Is The West Park RERA registered, and who is the promoter?",
    "acceptedAnswer": {
     "@type": "Answer",
     "text": "Yes — the developer's documents give Gujarat RERA number RAA11300. The developer is Adani Realty. City Property Services is an independent consultant and not the promoter of this project."
    }
   },
   {
    "@type": "Question",
    "name": "How big is The West Park?",
    "acceptedAnswer": {
     "@type": "Answer",
     "text": "61 plots on 9+ acres."
    }
   },
   {
    "@type": "Question",
    "name": "What amenities does The West Park have?",
    "acceptedAnswer": {
     "@type": "Answer",
     "text": "18 m wide entry road (master plan), Box cricket, Club house with multipurpose hall, Design and construction concierge on demand, Large plot consolidation option, Multipurpose court, No-two-homes-alike covenant, Party lawn spread over 27,000 sq ft, Secure children’s play zone, Senior citizens’ sit-outs and 5 more listed on this page. Residents also use the township-level facilities — The Belvedere Golf & Country Club, the lake and promenade, schools and retail — which are shared across Adani Shantigram."
    }
   }
  ]
 }
]
```

### Word counts, all 14 pages

| Page | Words (body) | Words (main) |
|---|---|---|
| /projects/adani-shantigram/ambrosia/ | 1342 | 1198 |
| /projects/adani-shantigram/amora/ | 1265 | 1121 |
| /projects/adani-shantigram/belrosa/ | 1456 | 1312 |
| /projects/adani-shantigram/elysium-novus/ | 1283 | 1139 |
| /projects/adani-shantigram/embrace/ | 1313 | 1169 |
| /projects/adani-shantigram/greenfield/ | 1389 | 1245 |
| /projects/adani-shantigram/ikaria/ | 1284 | 1140 |
| /projects/adani-shantigram/ | 2321 | 2177 |
| /projects/adani-shantigram/paarijat/ | 1169 | 1025 |
| /projects/adani-shantigram/skyline/ | 1292 | 1148 |
| /projects/adani-shantigram/the-north-park/ | 1285 | 1141 |
| /projects/adani-shantigram/the-storeys-golf-coast/ | 1367 | 1223 |
| /projects/adani-shantigram/the-storeys-infinity/ | 1378 | 1234 |
| /projects/adani-shantigram/the-west-park/ | 1320 | 1176 |

None fell short of 600. The thinnest source sets (Paarijat, Ikaria) still clear 1,000 because the configuration table, specifications, siblings block and FAQ are all data-driven; nothing was padded.

## 5. Accuracy guards
- Every price sits beside "as of July 2026" (from the data file) and a disclaimer naming CPS as an independent consultant, not the developer.
- RERA numbers are rendered only from the JSON `rera` field; the Infinity number carries the sheet's own verification note; the hub FAQ tells readers to check any number on gujrera.gujarat.gov.in.
- The enquiry block on every page states: independent RERA-registered consultant (AG/GJ/AHMEDABAD/AHMADABADCITY/AUDA/AA00003/220329R2), not the developer; developer = Adani Realty. In schema, CPS is only the `provider` of the `WebPage`/`CollectionPage`; the `AggregateOffer` is `offeredBy` a separate `Organization` node for Adani Realty whose description says "Not affiliated with City Property Services".

## 6. Schema
- Hub: `CollectionPage` (provider → `#organization`) → `ItemList` (13 `ListItem`s referencing each project's `#project` node) + `Place` `#township` with `containsPlace` → 13 project `@id`s, geo from the locality dataset, `amenityFeature` + `Organization` (Adani Realty) + `FAQPage` + `BreadcrumbList`.
- Project: `WebPage` (provider CPS, about → project) + `ApartmentComplex` (11) or `Residence` (North Park villas, West Park plots) with address, `containedInPlace` → township, `numberOfAccommodationUnits` (ApartmentComplex only — `Residence` doesn't define it, so villas/plots carry the count as `additionalProperty`), `amenityFeature`, images + `AggregateOffer` (`lowPrice`/`highPrice`/INR/`offerCount`, only where prices are published — Golf Coast and Infinity have none) + `FAQPage` + `BreadcrumbList`. All in the single `@graph`. **14/14 pass the schema.org validator.**

## 7 & 8. Draft state and links
Verified on the live deploy: all 14 return `noindex, nofollow`; sitemap contains 0 `/projects/` URLs; 0 pages link to the hub; `llms.txt` has 0 mentions. Wired-but-inert links (all behind `SHANTIGRAM_LIVE`): homepage browse module feature card, `/services/residential/` feature block, `/localities/shantigram/` township card, `llms.txt` section.

**Reconciling with `/localities/shantigram/`:** that page exists (13 CPS listings, "Shantigram, Ahmedabad: Property for Sale and Rent"). The two target different intents and will not compete: the locality page owns *"property in Shantigram"* — CPS's live listings, market summary and resale — while the hub owns *"adani shantigram"* — the township, its 13 projects, prices and RERA. Each links to the other with explicit wording (hub: "Looking for current resale and rental listings… see property in Shantigram"; locality page, once live: "Township guide: all 13 current projects compared… this page covers live listings and the resale market"). The hub's breadcrumb also runs Home › Shantigram › Adani Shantigram. No canonical merge is needed; if the locality page ever starts ranking for "adani shantigram" instead of the hub, the fix is to move the township intro copy off the locality page, not to merge them.

## Verification output
```
[check-trailing-slash] 68875 internal links scanned, 0 without trailing slash
[check-seo-meta] 857 pages (837 indexable): 837 distinct titles, 837 distinct descriptions, 837 with exactly one h1; 0 problem(s)
validate-jsonld: 14/14 Shantigram pages PASS
flag dry-run (SHANTIGRAM_LIVE=true): 851 indexable, 851 distinct titles/descriptions, 0 problems; sitemap 851 URLs; hub linked from /, /localities/shantigram/, /services/residential/; llms.txt +14 lines
live: /projects/adani-shantigram/ 200 noindex · /belrosa/ 200 noindex · /the-west-park/ 200 noindex · sitemap 0 · homepage links 0 · llms 0
```

## Files
New: `src/lib/flags.ts`, `src/lib/projects.ts`, `src/lib/shantigram-content.ts`, `src/components/ProjectEnquiry.astro`, `src/pages/projects/adani-shantigram/index.astro`, `src/pages/projects/adani-shantigram/[project].astro`, `src/content/projects/shantigram/` (14 JSON), `public/uploads/projects/shantigram/` (171 images).  
Modified (gated links + sitemap): `astro.config.mjs`, `src/lib/sitemap-meta.ts`, `src/pages/index.astro`, `src/components/ServicePage.astro`, `src/pages/services/residential.astro`, `src/pages/localities/[slug].astro`, `src/pages/llms.txt.ts`, `.gitignore`.

---

## Addendum (2026-09-20, later): images and facts from adanirealty.com

Per your instruction, galleries now come from the developer's own project pages rather than the brochure PDFs. Each page's `__NEXT_DATA__` payload was parsed for its gallery, highlight, amenity and feature images plus floor plans, unit plans and master layouts; 509 originals (up to 21,000 px wide) were downloaded, de-duplicated, filtered (≥ 1,000 px, landscape-ish) and resized to ≤ 1,600 px JPEG. Covers were hand-picked for a cohesive grid (exterior elevations, matching light): Ambrosia, Amora, Greenfield, Skyline, The North Park use their first render; Belrosa, Elysium Novus, Embrace, Ikaria (actual aerial), Paarijat, Golf Coast, Infinity, The West Park use their second. Each photo carries the site's own label — "Actual Image" or "Artistic Impression" — in its alt text and lightbox caption.

| Project | Photos | Floor/unit plans |
|---|---|---|
| Ambrosia | 14 | 10 |
| Amora | 14 | 10 |
| Belrosa | 14 | 10 |
| Elysium Novus | 14 | 9 |
| Embrace | 14 | 10 |
| Greenfield | 12 | 10 |
| Ikaria | 14 | 3 |
| Paarijat | 14 | 2 |
| Skyline | 8 | 6 |
| The North Park | 14 | 6 |
| The Storeys Golf Coast | 10 | 10 |
| The Storeys Infinity | 12 | 6 |
| The West Park | 14 | 1 |

**Facts from the developer site** (stored per project as `developerSite`, fetched 20 Sep 2026, and rendered next to the July 2026 fact-sheet values — the Series Master remains the price authority):

| Project | Site possession (RERA declared) | Site starting price | Full RERA no. (site) | Project area (site) |
|---|---|---|---|---|
| Ikaria | Ready to move-in | ₹87 L (excl. taxes) | PR/GJ/AHMEDABAD/DASKROI/AUDA/RAA10359/240622 | 222,084 sq ft built-up |
| Elysium Novus | 30 Apr 2029 | ₹1.23 Cr | RAA14729/270125/311228 | 16,108.63 sq m |
| Amora | 30 Mar 2030 | ₹1.45 Cr (sheet: ₹1.40 Cr) | …/MAA16481/190226/301129 | 4,006.39 sq m |
| Embrace | 30 Nov 2027 | ₹1.42 Cr | …/RAA12526/251023 | 9,164 sq m |
| Greenfield | 31 Dec 2029 | ₹1.73 Cr onwards (sheet: ₹1.83 Cr) | RAA14879/250225/311229 | 9,164 sq m |
| Skyline | 30 Sep 2029 | ₹1.95 Cr (sheet: ₹2.28 Cr) | …/RAA14084/020924/300929 | 8,300.24 sq m |
| Paarijat | BU received | ₹2.49 Cr (sheet: ₹2.42 Cr) | …/RAA10759/121022 | 6,202.98 sq m |
| Ambrosia | 30 Jan 2027 (sheet: Sep 2026) | ₹2.49 Cr (sheet: ₹2.45 Cr) | …/RAA10833/201022 | 9,952 sq m |
| The Storeys Golf Coast | 31 Dec 2028 (sheet: not published) | on request | RAA14971/170325/311228 | 4,950.22 sq m |
| The Storeys Infinity | 31 Dec 2031 | ₹3.5 Cr (master: ₹3.26 Cr) | site shows Amora's number — site error, flagged on the page | 11,756 sq yd |
| The North Park | 30 Oct 2027 | on request | …/RAA06343/A1R/EX1/100726/300627 | 16,862.8 sq m |
| The West Park | — | on request | …/RAA11300/020323 | 38,827.5 sq m |
| Belrosa | 30 Sep 2030 | on request | …/RAA15538/180725/310530 | 7,395.30 sq m |

The hub comparison table now shows the RERA-declared date where one is published ("Dec 2028 (RERA declared)"), otherwise the fact-sheet estimate; each project page shows both possession values, the full RERA number, project area, RERA carpet range and the site's starting price with the fetch date, and its overview says "Where these differ from the July 2026 fact sheet, both are shown so you can see what has moved." Deployed to `main` (`09bd870`), still noindex.

---

## Addendum (2026-09-21): listing photos, prices confirmed, "28+ years"

- **Shantigram property listings** (the 13 `adani-*-shantigram` listings on `/localities/shantigram/`, `/buy/`, `/buy/flat-in-shantigram/` etc.): all previous photos removed; each listing now carries the photo set from `~/Downloads/AS Listing Photos/<Project>.docx`, in the document's order with the first image as the card cover (two 200-px thumbnails in the Ambrosia file dropped). Counts: Ambrosia 9, Amora 9, Belrosa 13, Elysium Novus 5, Embrace 15, Greenfield 7, Ikaria 10, Paarijat 9, Skyline 3, North Park 11, Golf Coast 13, Infinity 10, West Park 4 — 118 photos, ≤ 1,600 px. The 13 township *project pages* keep the Adani-site galleries added on 20 Sep.
- **Prices confirmed** as instructed: The Storeys Infinity ₹3.26 Cr to ₹6.82 Cr, The Storeys Golf Coast ₹5.62 Cr to ₹7.02 Cr (already the Series Master values; verified live).
- **Years**: the site had already moved to 28 (derived from `foundedYear: 1998`); copy now reads "28+ years" everywhere (homepage stat and about block, About page, llms.txt/llms-full.txt).
- Deployed to `main` (`5dbac0d`); the 14 township pages remain noindex.
