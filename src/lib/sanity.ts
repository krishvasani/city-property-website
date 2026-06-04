// Sanity client + image URL builder.
// Only instantiated when PUBLIC_SANITY_PROJECT_ID is configured; otherwise the
// data layer (src/lib/data.ts) uses the bundled sample content instead.
import { createClient, type SanityClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';
const apiVersion = import.meta.env.PUBLIC_SANITY_API_VERSION || '2024-01-01';

export const isSanityConfigured = Boolean(projectId);

export const sanityClient: SanityClient | null = isSanityConfigured
  ? createClient({ projectId, dataset, apiVersion, useCdn: true })
  : null;

const builder = sanityClient ? imageUrlBuilder(sanityClient) : null;

/** Build a CDN image URL from a Sanity image ref, or '' if not configured. */
export function urlForImage(source: unknown, width?: number, height?: number): string {
  if (!builder || !source) return '';
  let img = builder.image(source as never).auto('format').fit('crop');
  if (width) img = img.width(width);
  if (height) img = img.height(height);
  return img.url();
}
