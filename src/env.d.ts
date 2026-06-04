/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly SITE_URL?: string;
  readonly PUBLIC_WHATSAPP?: string;
  readonly PUBLIC_PHONE?: string;
  readonly PUBLIC_LEAD_EMAIL?: string;
  readonly PUBLIC_SANITY_PROJECT_ID?: string;
  readonly PUBLIC_SANITY_DATASET?: string;
  readonly PUBLIC_SANITY_API_VERSION?: string;
  readonly PUBLIC_MAPBOX_TOKEN?: string;
  readonly PUBLIC_MAPBOX_STYLE?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
