# City Property Services — Website

A lead-generating marketing + listings site for **City Property Services**,
Ahmedabad. Built with **Astro** (static), content from **Sanity**, leads via
**Netlify Forms + WhatsApp**, maps via **Mapbox**. The visual design is the
high-fidelity system from the original design handoff, ported 1:1.

> **It runs out of the box with bundled sample data.** Sanity, Mapbox, WhatsApp
> and the lead email are all optional to start and switch on via env vars.

## Quick start
```bash
npm install
cp .env.example .env      # fill in values when you have them (all optional to start)
npm run dev               # http://localhost:4321
npm run build && npm run preview
```
Node **20.19+ or 22** is required (Astro 4).

## Pages
| Route | Source | Notes |
|---|---|---|
| `/` | `src/pages/index.astro` | Homepage: hero search, categories, featured, neighbourhoods, CTA, agents |
| `/listings` | `src/pages/listings.astro` | Filter (type/status/locality/budget), sort, paginate, map rail |
| `/property/<slug>` | `src/pages/property/[slug].astro` | One page per property; gallery, facts, amenities, map, contact, EMI |
| `/contact`, `/list-property` | — | Lead forms (contact + free valuation) |
| `/saved` | `src/pages/saved.astro` | Shortlist (localStorage) |
| `/thanks`, `/404` | — | Form success + not-found |
| `/style-guide` | `src/pages/style-guide.astro` | Internal design-system reference (not in nav) |

## How data flows
`src/lib/data.ts` is the single source. If `PUBLIC_SANITY_PROJECT_ID` is set it
reads from Sanity (GROQ); otherwise it returns the bundled sample content in
`src/data/sample.ts`. Components/pages never know the difference.

### Turning on Sanity (listings CMS)
1. Create a free project at https://sanity.io/manage (note the **Project ID**).
2. Put it in `.env`:
   ```
   PUBLIC_SANITY_PROJECT_ID=xxxxxxxx
   PUBLIC_SANITY_DATASET=production
   SANITY_STUDIO_PROJECT_ID=xxxxxxxx   # same id, for the Studio
   ```
3. Run the Studio and add content (Property / Advisor / Locality):
   ```bash
   npm run sanity:dev        # opens the editing studio locally
   npm run sanity:deploy     # optional: host the studio at <name>.sanity.studio
   ```
   Schemas: `sanity/schemas/{property,agent,locality}.ts`. Photos uploaded here
   replace the striped `.ph` placeholders automatically (served via Sanity's CDN).
4. Rebuild to pull the latest content. For auto-publishing, add a **Sanity
   webhook → Netlify build hook** (see Deploy).

### Turning on the real map
Set `PUBLIC_MAPBOX_TOKEN=pk.…` (Mapbox free tier). The stylised CSS map upgrades
to a real interactive map with navy price pins and list↔map sync. Without a
token, the styled placeholder map is shown. (To use Google Maps instead, swap
the loader in `src/components/Map.astro`.)

### Lead delivery
- **Email:** forms (`viewing`, `valuation`, `contact`) use Netlify Forms — no
  backend. After the first Netlify deploy, go to **Site → Forms → Notifications**
  and add an email to the owner's inbox. Submissions also appear in the Netlify
  dashboard. Locally, the form simulates success so you can demo the flow.
- **WhatsApp / Call:** set `PUBLIC_WHATSAPP` (digits only) and `PUBLIC_PHONE`.
  Every property's WhatsApp button is prefilled with the property + price.

## Deploy (Netlify — recommended)
1. Push this folder to a Git repo, connect it on Netlify.
2. Build command `npm run build`, publish dir `dist` (already in `netlify.toml`).
3. Add env vars in **Site settings → Environment** (`PUBLIC_*`, `SITE_URL`).
4. **Forms:** add an email notification (above).
5. **Auto-publish from Sanity:** create a Netlify **build hook**, then a Sanity
   **webhook** pointing at it, so new/edited listings trigger a rebuild.

Vercel works for the static site too, but **Netlify Forms won't run there** —
see `vercel.json` for the swap needed.

## Project layout
```
src/
  layouts/Base.astro          # head/SEO, nav, footer, shared scripts
  components/                 # Nav, Footer, PropertyCard, SearchBar, Map, LeadForm, …
  pages/                      # routes (above)
  lib/                        # data.ts (façade), sanity.ts, config.ts, format.ts, icons.ts, types.ts
  data/sample.ts              # bundled fallback content
  scripts/                    # site.js, motion.js, transitions.js (ported verbatim), favorites.ts
  styles/system.css           # design tokens — source of truth (verbatim from bundle)
sanity/                       # Studio schemas
public/logo/                  # logos + hero photo
```

## Notes
- All motion respects `prefers-reduced-motion`.
- Prices use ₹ and Indian grouping (Lakh/Crore) — preserved in formatting.
- The EMI figure on property pages is indicative and recomputes live in the
  mini-calculator; wire to a real lender API if needed.
