// Data façade. Pages/components call these and never need to know whether the
// content came from Sanity or the bundled sample fallback.
import type { Agent, Locality, Property } from './types';
import { isSanityConfigured, sanityClient, urlForImage } from './sanity';
import {
  properties as sampleProperties,
  agents as sampleAgents,
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
  "agentId": agent->slug.current,
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
export async function getProperties(): Promise<Property[]> {
  if (!isSanityConfigured) return sampleProperties;
  const docs = await sanity<any[]>(
    `*[_type == "property"]|order(coalesce(newAt,_createdAt) desc){${PROPERTY_FIELDS}}`,
  );
  return docs.map(mapProperty);
}

export async function getProperty(slug: string): Promise<Property | undefined> {
  if (!isSanityConfigured) return sampleProperties.find((p) => p.slug === slug);
  const doc = await sanity<any>(
    `*[_type == "property" && slug.current == $slug][0]{${PROPERTY_FIELDS}}`,
    { slug },
  );
  return doc ? mapProperty(doc) : undefined;
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

export async function getAgents(): Promise<Agent[]> {
  if (!isSanityConfigured) return sampleAgents;
  const docs = await sanity<any[]>(
    `*[_type == "agent"]|order(name asc){
      "id": _id, "slug": slug.current, name, role, region, phone, whatsapp, email,
      "avatar": { "url": image.asset->url, "alt": name }
    }`,
  );
  return docs as Agent[];
}

export async function getAgent(id?: string): Promise<Agent | undefined> {
  if (!id) return undefined;
  const all = await getAgents();
  return all.find((a) => a.id === id || a.slug === id);
}

export async function getLocalities(): Promise<Locality[]> {
  if (!isSanityConfigured) return sampleLocalities;
  const docs = await sanity<any[]>(
    `*[_type == "locality"]|order(name asc){
      "id": _id, "slug": slug.current, name, blurb, avgPriceDisplay, mapPos, geo
    }`,
  );
  return docs as Locality[];
}
