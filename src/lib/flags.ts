// Feature flags. Plain constants (no import.meta.env) so astro.config.mjs and
// the sitemap can import this file too.

/**
 * Adani Shantigram township hub + 13 project pages (/projects/adani-shantigram/…).
 * `false` = pages build but are noindex, excluded from the sitemap, and nothing
 * links to them. Flip to `true` ONLY after every price, RERA number and
 * possession date on the pages has been verified against the developer.
 */
export const SHANTIGRAM_LIVE = false;

/**
 * Commercial project index + one page per building (/projects/, /projects/{slug}/).
 * `false` = pages build but are noindex, excluded from the sitemap, and nothing
 * links to them. Flip to `true` ONLY once photographs are in place and every
 * rate, RERA number and possession date has been verified with the developer.
 */
export const COMMERCIAL_PROJECTS_LIVE = false;
