# Deployed — all three project sets are live on cityprop.co.in

**Date:** 2026-09-24 · **Branch:** `main` · **Deployed and verified**

Everything is on the live site. Earlier today none of it was — the work sat on local branches that had never been pushed, which is why you could not see it.

---

## 1. What is live now

| Set | URLs | Status |
|---|---|---|
| Adani Shantigram | `/projects/adani-shantigram/` + 13 project pages | Live, indexable, in the sitemap |
| The eight from your spreadsheet | `/projects/` + 8 building pages | Live, indexable, in the sitemap |
| The 51 Ambli residential projects | 51 pages under `/projects/` | Live, and the old listing URLs now 301 to them |

The sitemap went from 837 URLs to **860**. Both draft flags (`SHANTIGRAM_LIVE`, `COMMERCIAL_PROJECTS_LIVE`) are now `true`, so the pages are indexable, linked from the homepage and service pages, and listed in `llms.txt`.

`/projects/` was an orphan when I first built it — only its own children linked to it. It is now linked from the homepage browse module and from the corporate and retail service pages.

## 2. The Ambli move, and why the redirects are safe

You asked whether redirecting would drop people on the wrong listing. It does not, and I verified the whole map before shipping rather than assuming:

- **51 listing URLs → 51 project pages**, no collisions in either direction
- **0 mismatches** on project name, price or configuration between each listing and the page it now points to
- **0 photos lost** — every photo was copied across
- After deploying I re-tested **all 51 live**: every one is a single 301 to its own project page. **51 correct, 0 wrong.**

These 51 were never unit listings. Each was already a whole project — "Binori Belmont, 4 & 6 BHK + Penthouse, ₹5.8 to 9.3 Cr" — so there is exactly one project page per listing and nobody lands on a different building.

**Nothing was deleted.** Each listing JSON is still in the repo with `draft: true` and a `retiredTo` pointer. Setting `draft` removes it from the build, from `/buy/`, the locality pages, the map and every count — which is what "projects, not listings" means. Flipping it back restores the listing exactly.

Your instinct is exactly right for the **other 481 listings**, though. Those are individual units — a specific flat on a specific floor — and no single page means the same thing. Redirecting those genuinely would send people somewhere wrong, which is why that map is still waiting for your review.

## 3. A live defect I found and fixed on the way

17 Ambli projects had internal working notes in the possession field, and they were rendering publicly. Binori Belmont's page was showing:

> Possession: Dec 2027 / research Mar 2029

Akshar Ocean Pearl's was showing `Dec 2024 / research Mar 2027 (verify, may be ready)`. Visitors were being told our own figure disagrees with our research, along with internal hedging. The same string was baked into each project's description paragraph, so both were cleaned.

**The rule I applied:** publish the CPS figure only where it is a specific month still in the future. Four qualified — Binori Belmont (Dec 2027), HN Safal The Park (Sep 2027), Saiyamm Apricus (Dec 2026), Shaligram Sky (Jun 2028).

**The other 13 now show no possession date**, because their stated date had already passed or said only "Verify", and asserting a date we cannot stand behind is worse than saying nothing. These need a current date from you:

Akshar Ocean Pearl · ISCON Vogue · JP Vaikunth · Madhav Oeuvre 3 · Maruti Aatman · Oriental Viola · Rajyash Richmond 2 · Ratnaakar · Ratnaakar Eternity · Satyamev Luxor · Sheetal Gharana · The Emberlynn · Westland by Good Value

## 4. What the Ambli pages do and do not have

They carry the name, developer, configurations, price band, possession, description and photos, on the same template as everything else — so they are a superset of the listing they replaced, not a reduction.

What is genuinely missing across all 51, and is stated on the pages rather than papered over:

- **No RERA registration number** for any of them
- **No carpet or super built-up areas** for any of them
- **22 of 51 are price-on-request**
- **2 have no photographs**; the rest average two

The fastest fix is the intake form you already have. The same form that produced the eight commercial pages would fill every one of these gaps, and those records slot into this identical format.

## 5. Verification

- `npm run build` — **866 pages**, 860 indexable, **0 SEO problems**
- `check-trailing-slash` — **69,260 internal links, 0 without a trailing slash**
- **0 pages anywhere in the build still link to a retired listing URL**
- **0 retired slugs remain in the sitemap** (the 34 Ambli listings still there are different, still-live rentals, showrooms and offices)
- JSON-LD valid on every new page
- Live spot checks: `/projects/`, `/projects/adani-shantigram/belrosa/`, `/projects/sankalp-480/`, `/projects/rajyash-royce-one/` all 200

---

## Still open

1. **Photographs for the eight commercial projects.** Their galleries are still the "photos on request" placeholder, because the 55 submitted files sit in private Google Drive folders this machine cannot reach. Download them to `~/Downloads`, one folder per project, and I will wire them in. D&C Primedeck's submission has only one file and needs re-collecting.
2. **Times Marvel's RERA number** — the one submitted is character-for-character Adleap Crest's, so it is withheld. Sankalp 480's also looks truncated.
3. **Possession dates for the 13 Ambli projects** listed in section 3.
4. **The 481 unit listings.** Phase 1 is still unapproved and untouched: the six `REVIEW` rows in `~/Downloads/CPS_listing_inventory.csv`, and the redirect map for those 481, which needs real care for the reasons in section 2.
