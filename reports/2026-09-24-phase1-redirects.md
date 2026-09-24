# Phase 1 — the redirect map, for your review

**Date:** 2026-09-24 · **Deliverable:** `~/Downloads/CPS_redirects.csv` (571 rows) · **Nothing removed yet**

Your brief says: *"`redirects.csv` with old URL, new URL, status code. **STOP** for my review"* — so here it is. Nothing has been deleted or deployed. On your go-ahead the removal and the redirects ship in one deploy, as the brief requires.

---

## 1. What goes, what stays

| | Count |
|---|---|
| Listings on the site now | **549** |
| **Remove** — offices, showrooms, flats, bungalows, plots, prelease, investment | **481** |
| **Shantigram listings → their project pages** | **13** |
| **Keep** — warehouse listings | **55** |

The 481 matches the Phase 0 audit exactly. Warehouses stay because your brief's keep column is "warehouse listings" and "industrial listings"; your instruction said commercial and residential, and warehouses are neither. **If you want the warehouses gone too, say so** — that is a one-line change, and it would leave the site with no listings at all.

**Removal set by type:** office 284 · apartment 76 · showroom 64 · bungalow 31 · plot 16 · investment 8 · penthouse 1 · commercial 1.

## 2. The map

| Rows | From | To | Code |
|---|---|---|---|
| 481 | each removed listing | that locality's guide page | 301 |
| 13 | each Shantigram listing | its own project page | 301 |
| 77 | locality+type pages that are now empty | that locality's guide page | 301 |
| **571** | | **63 distinct destinations** | |

Checks run against the map:

- **0 redirect chains** — no destination is itself redirected, so every old URL reaches its final home in one hop
- **0 rows needing 410** — every removed listing's locality has a guide page, all 109 of which stay live
- **0 missing destinations**

Of the 91 locality+type landing pages, **14 survive** — all warehouse pages, from Aslali through Vavdi. The other 77 lose their listings and redirect.

## 3. A duplicate I created today, and this fixes

When I flipped the Shantigram pages live this afternoon, I made the 13 project pages indexable **without retiring the 13 Shantigram listings**. Both sets have been live and indexable since. That is duplicate content and it is my error — the 13 rows in this map close it, the same way the Ambli move did.

## 4. What the site looks like afterwards — read this before approving

This is the part worth pausing on.

| | Now | After |
|---|---|---|
| **`/buy/` explorer** | 224 cards | **0 cards** |
| `/rent/` explorer | 325 cards | 55, all warehouses |
| Map pins | 549 | 55 |
| Homepage featured strip | 3 listings | **0 — all three are in the remove set** |
| Localities holding listings | 71 | 21 |
| Locality guide pages | 109 | 109 (all stay, as the brief requires) |

**`/buy/` becomes an empty page in your main navigation.** Everything for sale is now a project, and projects live at `/projects/`, not in the listing explorer. The same is true of the corporate, retail, investment and land service pages, which each show a live count and price range that becomes zero.

That is not a reason not to do this — it is the intended shape of the new site. But it needs a decision in the same deploy, and there are three sensible answers:

1. **Point `/buy/` at `/projects/`** — a 301, and the nav item keeps working. Simplest.
2. **Rebuild `/buy/` as the projects explorer** — the 72 project pages become the cards. More work, better result.
3. **Drop `/buy/` from the nav** and let `/projects/` take its place.

My recommendation is **2**, with **1** shipping immediately as the stopgap so nothing is broken in the meantime.

The three featured listings also need replacing — pick any three from the 72 projects and I will wire them in.

## 5. Nothing is deleted

Same method as the Ambli move, which is already proven in production: each listing keeps its JSON in git with `draft: true` and a `retiredTo` pointer. That removes it from the build, the explorers, the locality pages, the map and every count, while the data stays recoverable by flipping one field. This satisfies the brief's "archive removed listing data instead of deleting it".

## 6. Still to build, on your go-ahead

Per the brief's Phase 1 deliverables, these ship with the removal:

- Redirects implemented in the same deploy as the removal — never one without the other
- Every internal link to a removed page cleared (verified in the build, as I did for Ambli: 0 dangling links)
- Sitemap regenerated with live URLs only
- Saved properties: a friendly note where a saved item is gone, instead of an error
- A test script that requests all 571 old URLs and confirms the status code, the destination and zero chains

---

## STOP — what I need from you

1. **Approve the map** — `~/Downloads/CPS_redirects.csv`, or correct any row.
2. **Warehouses: keep or remove?** I have kept them, per your brief.
3. **What happens to `/buy/`** — options in section 4. I suggest rebuilding it as the projects explorer, with a 301 shipping straight away.
4. **Three new featured picks** for the homepage.
5. The six `REVIEW` rows from Phase 0 are still open — the two Aaryan The One showrooms in particular, which read as a project but are typed as showrooms and are currently in the remove set.
