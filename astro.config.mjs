// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { buildSitemapMeta, isShallowCheckout } from './src/lib/sitemap-meta';
import { SHANTIGRAM_LIVE } from './src/lib/flags';

// Public site URL — override with SITE_URL in the deploy environment.
const site = process.env.SITE_URL || 'https://cityprop.co.in';

// Pages that carry <meta name="robots" content="noindex"> must never be listed
// in the sitemap. Keep this in sync with `noindex` usages in src/pages.
const NOINDEX = ['/saved/', '/thanks/', '/style-guide/', '/privacy-policy/', '/404/'];

// https://astro.build
export default defineConfig({
  site,
  // Static output (SSG). Listings are built from the content collections at
  // deploy time; the CMS "Go live" hook republishes when content changes.
  // Netlify Forms work with static HTML (the form markup is present at build time).
  output: 'static',
  // Canonical URL form is the trailing-slash directory URL (/buy/, /property/x/).
  // Netlify's Pretty URLs 301 the bare form to this one, so every internal link
  // must already use it — `trailingSlash: 'always'` makes Astro enforce that in
  // dev, and scripts/check-trailing-slash.mjs enforces it on the built HTML.
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // Keep the build output clean; assets already hashed by Astro.
    inlineStylesheets: 'never',
  },
  // Legacy URL redirects live in public/_redirects (real Netlify 301s), not
  // here — Astro's static `redirects` only emit meta-refresh stub pages.
  integrations: [
    sitemap({
      // Draft page groups stay out until their flag is flipped (see src/lib/flags.ts).
      filter: (page) => !NOINDEX.some((p) => page.endsWith(p)) && (SHANTIGRAM_LIVE || !page.includes('/projects/adani-shantigram/')),
      // lastmod + <image:image> per URL (see src/lib/sitemap-meta.ts). The
      // `img` field passes through to the `sitemap` package's SitemapStream.
      // scripts/postbuild.mjs prints a summary of the generated sitemap.
      serialize: (() => {
        const metaFor = buildSitemapMeta(site);
        if (isShallowCheckout) console.warn('[sitemap] shallow git checkout: git-based lastmod dates unavailable, using content dates only');
        return (item) => {
          const { lastmod, img } = metaFor(item.url);
          if (lastmod) item.lastmod = lastmod;
          if (img?.length) /** @type {any} */ (item).img = img;
          return item;
        };
      })(),
    }),
  ],
  vite: {
    // Surface PUBLIC_* env vars to client islands (e.g. the map token).
    define: {},
  },
});
