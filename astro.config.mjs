// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Public site URL — override with SITE_URL in the deploy environment.
const site = process.env.SITE_URL || 'https://cityprop.co.in';

// https://astro.build
export default defineConfig({
  site,
  // Static output (SSG). Listings are built from Sanity at deploy time; a
  // Sanity -> Netlify build hook republishes when content changes. Netlify
  // Forms work with static HTML (the form markup is present at build time).
  output: 'static',
  // Old routes → new structure (keeps bookmarks/links alive).
  redirects: {
    '/listings': '/buy',
    '/list-property': '/sell',
    '/contact': '/consult',
  },
  // The privacy policy page exists only to satisfy the mandatory privacy policy
  // link in Meta and LinkedIn lead ad forms. Keep it out of the sitemap so it is
  // not surfaced to search engines or ordinary visitors. It stays crawlable in
  // robots.txt so the ad platforms can still fetch and review it.
  integrations: [sitemap({ filter: (page) => !page.includes('/privacy-policy') })],
  // Keep the build output clean; assets already hashed by Astro.
  build: { inlineStylesheets: 'never' },
  vite: {
    // Surface PUBLIC_* env vars to client islands (e.g. the map token).
    define: {},
  },
});
