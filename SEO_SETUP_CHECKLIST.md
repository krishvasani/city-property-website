# SEO Setup Checklist — City Property Services (cityprop.co.in)

The code/technical SEO is done (titles, meta, canonical, robots, sitemap,
structured data, locality pages, redirects). The items below are **manual steps
in Google/3rd‑party dashboards** that only the owner can do.

## 1. Google Search Console (do first)
1. Go to https://search.google.com/search-console and add a property.
2. Add **Domain property `cityprop.co.in`** (covers http/https + www). Verify via
   a **DNS TXT record** in GoDaddy DNS (GSC gives you the exact `google-site-verification=…` TXT value).
3. (Optional) Also add the old **`city-property-ahmedabad.netlify.app`** as a URL‑prefix
   property so you can use the Change of Address tool and watch the old domain drop off.
4. **Submit the sitemap:** in GSC → Sitemaps → enter `https://cityprop.co.in/sitemap-index.xml`.
5. If you had the netlify.app verified before, use **Settings → Change of Address**
   to tell Google you moved to cityprop.co.in (a 301 redirect is already in place).
6. **URL Inspection → Request indexing** for the key pages:
   `/`, `/buy`, `/rent`, `/sell`, `/consult`, `/about-us`, `/services`, `/blog`,
   and 2–3 top locality pages (`/localities/bodakdev`, `/localities/satellite`, `/localities/sg-highway`).
7. Watch **Pages** (indexing) and **Core Web Vitals** reports over the next 1–2 weeks.

## 2. Google Business Profile (biggest local‑SEO lever)
1. Claim/verify the City Property Services profile at https://business.google.com.
2. Set the **website link to `https://cityprop.co.in`**.
3. Make **Name, Address, Phone (NAP) identical** to the website footer:
   - City Property Services
   - 703 & 704 Zion Prime, Near Copper Stone, Thaltej Shilaj Road, Ahmedabad, Gujarat 380052
   - +91 98249 00778
   - coordinator@cityprop.co.in
4. Add categories (Real Estate Agency / Commercial Real Estate Agency),
   service areas (Ahmedabad, Gandhinagar, GIFT City), photos, and post updates regularly.

## 3. Google Analytics 4 — ✅ INSTALLED (`G-5MZTJ0FL9T`)
Live on every page; it only runs on `cityprop.co.in` (not localhost/previews) so the data stays clean.
- **Verify it works:** GA4 → Reports → **Realtime**, then open cityprop.co.in in another tab — you should appear as an active user within ~30 seconds.
- **Tracked automatically:** page views (every page, incl. each property/locality).
- **Custom events:** `phone_click`, `whatsapp_click`, and `generate_lead` (fires on form submit, with the form name).
- **Mark leads as conversions:** GA4 → Admin → **Events** (or Key events) → toggle `generate_lead`, `phone_click`, `whatsapp_click` as **Key events**. Then you can see conversion rate by traffic source.
- Note: standard reports take ~24–48h to populate (Realtime is instant). Some visitors with ad‑blockers won't be counted — normal for GA.

## 4. NAP consistency (update everywhere to the new domain + address)
Make these match the footer exactly:
- [ ] Instagram bio/website → `https://cityprop.co.in`
- [ ] LinkedIn company page → website + address
- [ ] Google Business Profile (above)
- [ ] Any directories (Justdial, 99acres/MagicBricks agent profile, IndiaMART, Sulekha)
- [ ] Email signatures and brochures

## 5. Bing (optional, quick win)
Add `cityprop.co.in` to Bing Webmaster Tools and import from Search Console.

---

## What's already done in code (no action needed)
- Canonical domain `https://cityprop.co.in` on every page (canonical, OG, Twitter, sitemap, schema).
- 301 redirect: old `*.netlify.app` → `cityprop.co.in`; http→https and www→apex handled by Netlify.
- `robots.txt` allows crawling, blocks `/cps-admin/`, points to the sitemap.
- Auto‑generated `sitemap-index.xml` (172 URLs: home, buy, rent, sell, map, guide, blog,
  consult, about, all services, all blog posts, all property pages, all locality pages).
- Structured data: RealEstateAgent + WebSite sitewide; Product (with price Offer) on property
  pages; BlogPosting on blog posts; Service on service pages; Place + BreadcrumbList on locality
  pages; BreadcrumbList on all nested pages.
- Unique, keyword‑aligned titles + meta descriptions per page (incl. dynamic property/locality pages).
- 75 locality landing pages under `/localities/<slug>` + a `/localities` hub.
- Admin, thanks, saved, style‑guide pages set to `noindex`.
- Helpful 404 linking to Buy, Rent, Sell, Consult, Blog.

## Content TODOs (ongoing — for organic growth)
Write these blog posts (each answers a real buyer/seller question; link to the
relevant service + locality pages and a Consult CTA):
- Bopal vs South Bopal vs Shela — which to buy in
- SG Highway office market guide
- Warehouse leasing around Changodar and Sanand
- What sellers should check before pricing a property in Ahmedabad
- Preleased property basics for Ahmedabad investors
- GIFT City investment basics
- Retail frontage and footfall checklist
- Land buying checklist near Ahmedabad
