# Eight commercial projects — built, one format, ready for photos

**Date:** 2026-09-24 · **Branch:** `projects/commercial` · **Commit:** `bb1180f` · **Not deployed**

Source: `CPS - sheets.xlsx`, the intake form your team and the developers' sales people filled in today. Eight buildings, all in west Ahmedabad.

Everything on the form is published **except the Extra Notes column**, and NA values are dropped rather than printed — as you asked. Three fields I held back on purpose; see section 5.

---

## 1. What got built

| URL | What it is |
|---|---|
| `/projects/` | The index — a comparison table of all eight, a card grid, a by-area list, and an explainer on how commercial pricing works here |
| `/projects/{slug}/` | One page per building. Eight pages, identical in shape |

Every project page runs the same six sections behind a **sticky in-page nav** that highlights where you are as you scroll:

**Overview · Floor plan · Pricing · Amenities · Location · Enquire**

A section with no data is dropped rather than shown empty, so the pages stay the same shape without padding.

| Project | Developer | Area | Use | Floors | Carpet area | Possession |
|---|---|---|---|---|---|---|
| Z2 | Zade Group | Thaltej | Offices | G+32 | 640 – 5,478 sq ft | **Ready** |
| Adleap Crest | Adleap Developers | Vaishnodevi Circle | Retail and offices | G+12 | 446 – 7,600 sq ft | Dec 2027 |
| D&C Primedeck | D&C Group | Bodakdev | Retail and offices | G+18 | 400 – 7,150 sq ft | Dec 2027 |
| Times Marvel | Times Square Arcade Group | Thaltej | Offices | G+35 | 950 – 2,300 sq ft | Dec 2027 |
| Zion Connect | Zion Group | Thaltej | Retail and offices | G+12 | 450 – 3,040 sq ft | Dec 2028 |
| Sakar Two | Bakeri & Sanidhya Group | Ambli | Retail and offices | G+11 | 675 – 2,680 sq ft | Apr 2030 |
| Z Northface | Zade Group | Thaltej | Retail and offices | G+12 | 315 – 1,939 sq ft | Dec 2030 |
| Sankalp 480 | Sankalp Realty | Sindhu Bhavan Road | Offices | G+23 | 955 – 13,405 sq ft | Mar 2032 |

## 2. How each page reads

**Overview** — a fact strip (use, floors, carpet area, possession), the headline rate, then four short paragraphs: what the building is, how the stack is arranged, construction status and RERA, and the CPS role.

**Floor by floor** — the table your form collected: floor, use, units on that floor, carpet area, super built-up area, ceiling height. Because Ahmedabad quotes rates against super built-up and RERA measures carpet, the page says so above the table and shows both columns side by side.

**Rates and charges** — separate office and retail tables, with a **regular plan** and a **down-payment plan** column shown only where the developer quotes both. Underneath, package charges and floor rise as their own rows, then the date the rates were given and the line telling the reader to confirm before committing.

**Amenities** — the tick-list from the form, alphabetised.

**Location** — the address, a Google Maps link from the coordinates you supplied, and a link into the existing area page.

Then other projects, an FAQ built from the building's own facts, and the enquiry form. The enquiry block now names the actual developer in its disclaimer instead of Adani Realty.

## 3. The two accuracy calls I made

**Times Marvel's RERA number is not published.** The number submitted for it is character-for-character the number submitted for Adleap Crest — `PR/GJ/AHMEDABAD/DASKROI/…/CAA15461/050725/311231`. One of the two is wrong and I cannot tell which from here, so the Times Marvel page says the number is awaiting confirmation rather than printing one that may belong to a different building. **Get me the correct number and it goes straight on.**

**Sankalp 480's number looks truncated.** `PR/GJ/AHMEDABAD/AHMADABAD CITY/AUDA/CAA00037/31081` ends differently from every other registration in the set, which all finish with a six-digit date. It is published as submitted, but worth checking.

## 4. Gaps in the submissions

These are recorded against each project in the data, not shown on the pages:

- **D&C Primedeck** — retail rates are quoted for floors 3 and 4, but the floor-by-floor answer has no rows for those levels. What is on 3 and 4?
- **Sakar Two** — the floor mix covers only the ground and first floors of a G+11 building holding 110 units. The rest of the stack is missing, and the first-floor retail size range stops mid-sentence ("1,850 TO ").
- **Z2** — the floor answer gives one row for floors 1 to 32 plus the basements. Workable, but thinner than the others.
- **Rate basis** — the form asked for a rate "per sq ft" without saying carpet or super built-up. The quoted rates split into two clusters, roughly ₹3,900–4,250 and ₹8,500–10,500, which is about the ratio between the two bases. I have published each rate exactly as given with a note to confirm the basis, but **it would be worth adding a carpet-or-super-built-up question to the form** so this is never ambiguous.

## 5. Three fields I did not publish

The form collects the **submitter's email**, and the **developer's sales person name and phone number** — Ajaybhai, Nikita, Mehul Patel, Kuntal Patel, Ronak Bhai, Pankaj Jain, Gunjan Patel, Shalini, with direct mobile numbers.

Publishing those would let any visitor call the builder's sales desk directly and cut you out of the deal. I have kept them in the data file, in an `internal` block the page templates cannot read, so you still have them. **If you actually want them on the public pages, say so and it is a one-line change** — but I would not.

## 6. Photographs — what I need from you

Between them the eight submissions point at **55 files** in Google Drive (images and brochures). Those folders are private and this machine has no Drive access, so nothing could be fetched. The galleries currently fall back to the existing "Photos available on request" panel, which is why the pages are drafts.

The quickest fix is the one that worked for Shantigram: **download the Drive folders into `~/Downloads`, one folder per project**, and tell me. I will pick the covers, order the galleries, wire in the brochures and flip the pages live.

Per-project file counts: Times Marvel 10 · Z2 9 · Sakar Two 8 · Z Northface 7 · Sankalp 480 7 · Zion Connect 7 · Adleap Crest 6 · **D&C Primedeck 1** (that one looks like it needs re-collecting — the form asked for a minimum of five).

## 7. Verification

- `npm run build` — **866 pages**, 837 indexable, 0 problems from the SEO guard
- `check-trailing-slash` — **69,610 internal links, 0 without a trailing slash**
- `validate-jsonld` — **10 / 10** new pages valid against schema.org
- Sitemap — unchanged at **837 URLs**; the nine new pages are noindex and excluded until the flag flips

The pages are live-ready the moment photos land: flip `COMMERCIAL_PROJECTS_LIVE` in `src/lib/flags.ts` to `true`, exactly as with Shantigram.

---

## What I need from you

1. **The photos** — download the Drive folders locally (section 6), and re-collect D&C Primedeck's, which has one file.
2. **Times Marvel's correct RERA number**, and a check on Sankalp 480's.
3. **Confirm you want the developers' sales contacts kept off the public pages** (section 5). I have assumed yes.
4. The two open items from yesterday are still open: the six `REVIEW` rows in `~/Downloads/CPS_listing_inventory.csv`, and whether the 51 Ambli-and-similar project listings should get `/projects/` pages of their own. **These eight now set the template** — if you can get the same intake form filled in for the Ambli projects, they slot straight into this same format.
