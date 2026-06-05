// Data façade. Pages/components call these and never need to know whether the
// content came from Sanity or the bundled sample fallback.
import type { Locality, Property } from './types';
import { isSanityConfigured, sanityClient, urlForImage } from './sanity';
import {
  properties as sampleProperties,
  localities as sampleLocalities,
} from '../data/sample';

// ── Sanity GROQ projections ──────────────────────────────────────────
const PROPERTY_FIELDS = `
  "id": _id,
  "slug": slug.current,
  title, status, statusLabel, priceDisplay, priceValue, pricePer,
  propertyType,
  "localityName": locality->name,
  "localitySlug": locality->slug.current,
  address, perSqftDisplay,
  beds, baths, area, areaSqft, floor, builtYear, facing, parking, furnishing,
  description, amenities, geo, featured, cardMeta,
  "newAt": coalesce(newAt, _createdAt),
  "photos": photos[]{ "ref": asset, alt, label }
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProperty(doc: any): Property {
  return {
    ...doc,
    statusLabel: doc.statusLabel || (doc.status === 'rent' ? 'For rent' : 'For sale'),
    photos: (doc.photos || []).map((p: any) => ({
      url: urlForImage(p.ref, 1200, 900),
      label: p.label || 'Property photo',
      alt: p.alt || doc.title,
    })),
  } as Property;
}

async function sanity<T>(query: string, params: Record<string, unknown> = {}): Promise<T> {
  return sanityClient!.fetch<T>(query, params);
}

// ── Public API ───────────────────────────────────────────────────────
// Memoize collection fetches so a single build doesn't re-query Sanity for
// every page (getStaticPaths + per-page getSimilar/getFeatured/getAgent).
let _properties: Promise<Property[]> | null = null;
let _localities: Promise<Locality[]> | null = null;

export function getProperties(): Promise<Property[]> {
  if (_properties) return _properties;
  _properties = (async () => {
    if (!isSanityConfigured) return sampleProperties;
    const docs = await sanity<any[]>(
      `*[_type == "property"]|order(coalesce(newAt,_createdAt) desc){${PROPERTY_FIELDS}}`,
    );
    return docs.map(mapProperty);
  })();
  return _properties;
}

export async function getProperty(slug: string): Promise<Property | undefined> {
  const all = await getProperties();
  return all.find((p) => p.slug === slug);
}

export async function getFeatured(limit = 3): Promise<Property[]> {
  const all = await getProperties();
  const featured = all.filter((p) => p.featured);
  return (featured.length ? featured : all).slice(0, limit);
}

/** Similar homes: same locality first, then fill from the rest. */
export async function getSimilar(slug: string, limit = 3): Promise<Property[]> {
  const all = await getProperties();
  const self = all.find((p) => p.slug === slug);
  if (!self) return all.slice(0, limit);
  const sameLoc = all.filter((p) => p.slug !== slug && p.localityName === self.localityName);
  const rest = all.filter((p) => p.slug !== slug && p.localityName !== self.localityName);
  return [...sameLoc, ...rest].slice(0, limit);
}

export function getLocalities(): Promise<Locality[]> {
  if (_localities) return _localities;
  _localities = (async () => {
    if (!isSanityConfigured) return sampleLocalities;
    const docs = await sanity<any[]>(
      `*[_type == "locality"]|order(name asc){
        "id": _id, "slug": slug.current, name, blurb, avgPriceDisplay, mapPos, geo
      }`,
    );
    return docs as Locality[];
  })();
  return _localities;
}
