# Adani Shantigram — listings folded into the project pages

**Date:** 2026-09-24 · **Branch:** `projects/shantigram-consolidation` · **Commit:** `b1adaea` · **Not deployed**

Your instruction — *"add the adani shantigram listings to the project listings. We will only be putting up projects on it"* — answers question 4(a) from the Phase 0 audit. `/projects/adani-shantigram/…` is now the canonical home for these 13 projects, and the old `/property/adani-*-shantigram/` URLs will 301 to them in Phase 1.

**Nothing has been removed or deployed.** The 13 listings are still live exactly as they were. The project pages are still `noindex` behind `SHANTIGRAM_LIVE = false`. Both of those change only when you approve the Phase 1 redirects.

---

## 1. What the listings had that the project pages did not

I diffed all 13 pairs field by field before merging anything.

| The listings held | The project pages held |
|---|---|
| Your curated photo set (118 photos from `AS Listing Photos`), in your approved order, with the main-building covers you asked for | 13 full galleries pulled from adanirealty.com, plus floor plans |
| Map coordinates (`geo`) | Configurations, carpet-area ranges, RERA numbers, possession dates, project area, price bands with an as-of date, developer facts, amenities, FAQ, JSON-LD |
| "New" date stamp | — |

So the merge only had to move three things across: **photos, coordinates, and the URL to redirect from**. Everything else the project pages already did better.

## 2. Photos — your curated set comes first

The two photo sets overlap heavily because both ultimately come from Adani. I ran a perceptual hash (average-hash, Hamming distance ≤ 10) over every image in both sets:

- **108 of your 118 curated photos were already in the project galleries.** Same images, different files.
- **10 were genuinely new.**

Rather than dedupe toward the Adani copies, I put **your curated file first in every gallery**, in your order. That preserves the covers you picked — the main-building shots — and your sequencing. The non-duplicate Adani images are appended after them. Files were physically copied into `public/uploads/projects/shantigram/<slug>/photos/`, so the galleries keep working after the listings come out.

| Project | From your set | Added from Adani | Gallery | Real site photos | Redirects from |
|---|---:|---:|---:|---:|---|
| Ambrosia | 9 | 5 | **14** | 4 | `/property/adani-ambrosia-shantigram/` |
| Amora | 9 | 5 | **14** | 4 | `/property/adani-amora-shantigram/` |
| Belrosa | 13 | 2 | **15** | 0 | `/property/adani-belrosa-shantigram/` |
| Elysium Novus | 5 | 9 | **14** | 7 | `/property/adani-elysium-novus-shantigram/` |
| Embrace | 15 | 5 | **20** | 0 | `/property/adani-embrace-shantigram/` |
| Greenfield | 7 | 5 | **12** | 0 | `/property/adani-greenfield-shantigram/` |
| Ikaria | 10 | 4 | **14** | 11 | `/property/adani-ikaria-shantigram/` |
| Paarijat | 9 | 5 | **14** | 4 | `/property/adani-paarijat-shantigram/` |
| Skyline | 3 | 5 | **8** | 0 | `/property/adani-skyline-shantigram/` |
| The North Park | 11 | 3 | **14** | 3 | `/property/adani-north-park-shantigram/` |
| The Storeys Golf Coast | 13 | 0 | **13** | 0 | `/property/adani-storeys-golf-coast-shantigram/` |
| The Storeys Infinity | 10 | 1 | **11** | 0 | `/property/adani-storeys-infinity-shantigram/` |
| The West Park | 4 | 10 | **14** | 10 | `/property/adani-west-park-shantigram/` |
| **Total** | **118** | **59** | **177** | **43** | |

## 3. Photo captions — the accuracy guard still holds

Your batch 5 rule was that nothing may imply CPS is the developer, and that renders must not read as photographs. Each gallery image carries a caption derived from how Adani themselves labelled it: *actual photo*, *developer render*, or the developer's own wording.

Rebuilding those labels after the merge took two attempts. The reliable source turned out to be the original download manifest kept from the adanirealty.com fetch, which records every file's original URL, label and dimensions before anything was renamed. Labels are now rebuilt from that.

The result passes the obvious sanity check — **all 43 "actual photo" captions sit on projects that are built or partly delivered**, and every project still under construction has zero:

- Ikaria 11 · The West Park 10 · Elysium Novus 7 · Ambrosia 4 · Amora 4 · Paarijat 4 · The North Park 3
- Belrosa, Embrace, Golf Coast, Skyline, Greenfield, Infinity — **0**

I also rendered a labelled contact sheet of The West Park's gallery to check by eye: photos 1–4 are villa renders captioned *Artistic Impression*; photos 5–8 are genuine site photography — the entrance signage wall and drone views of the plotted development — captioned *Actual Image*. Correct.

## 4. The redirect map is now built into the data

Every project record gained a `sourceListing` block:

```json
"sourceListing": {
  "url": "https://cityprop.co.in/property/adani-belrosa-shantigram/",
  "slug": "adani-belrosa-shantigram",
  "note": "Legacy listing URL for this project; to be 301-redirected to this project page in Phase 1."
}
```

That means Phase 1's `redirects.csv` reads these 13 rows straight out of the content rather than being hand-typed, so the map cannot drift from the pages. All 13 also gained `geo` (so the map page keeps its pins after the listings go) and an `imageSource` field crediting both the developer site and your curated set.

## 5. Verification

- `npm run build` — **857 pages**, 837 indexable, 837 distinct titles, 837 distinct descriptions, 837 with exactly one `h1`, **0 problems**
- `check-trailing-slash` — **68,937 internal links, 0 without a trailing slash**
- `validate-jsonld` — **14 / 14** Shantigram graphs valid against schema.org
- Visual check — hub cards show the main-building covers; Belrosa's gallery leads with your curated tower shot and reports "View all 15 photos"

---

## What I need from you

**1. The 51 non-Shantigram projects.** Your keep-set has 64 project listings: 13 Shantigram and **51 others, mostly Ambli**. Shantigram now has real project pages. The other 51 do not — they are ordinary listings tagged "New project", with no configurations, no RERA numbers, no floor plans and no possession dates. There are three ways to go:

  - **a.** Leave them as `/property/` listings for now, and build project pages only as you supply the source material. Shantigram is the template; the rest follow when data arrives.
  - **b.** Build `/projects/` pages for all 51 from what exists today. They would be thin next to Shantigram, and thin project pages are worse than good listings.
  - **c.** Pick the handful that matter commercially and send me brochures or fact sheets for those, as you did for Shantigram.

  My recommendation is **(a) now, (c) next** — it keeps the quality bar where Shantigram set it.

**2. Phase 0 is still open.** The six `REVIEW` rows in `~/Downloads/CPS_listing_inventory.csv` need your call: the two Aaryan The One showrooms in Satellite (project or removal?), The West Park plot (flagged for visibility only), and three replacement picks for the homepage featured strip, since all three current ones are in the remove set.

Once I have those, I build `redirects.csv` and stop again for your review before anything is deleted.
