// Data façade. Pages/components call these; content now lives in editable
// Astro Content Collections (src/content/properties, edited via Decap CMS at
// /cps-admin). Localities stay in the bundled dataset.
import { getCollection } from 'astro:content';
import type { Locality, Photo, Property, Status } from './types';
import { localities as sampleLocalities } from '../data/sample';
import { getAllLocalities, getLocalityById } from '../data/localities';

const defaultStatusLabel = (s: Status) =>
  s === 'rent' ? 'For rent' : s === 'lease' ? 'For lease' : 'For sale';

// Map a locality NAME (what editors type in the CMS) to its dataset id/slug,
// so filters, the map and locality links work even when the slug field is blank.
const nameToLocalityId = new Map(getAllLocalities().map((l) => [l.name.toLowerCase(), l.id]));
const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
function resolveLocalitySlug(name?: string, given?: string): string | undefined {
  if (given && given.trim()) return given.trim();
  if (!name) return undefined;
  return nameToLocalityId.get(name.toLowerCase()) || slugify(name);
}

// CMS number fields can arrive as strings; coerce pure-numeric ones to numbers
// so sorting and the beds filter keep working.
const num = (v: unknown) =>
  typeof v === 'string' && /^\d+$/.test(v.trim()) ? Number(v) : (v as number | string | undefined);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProperty(d: any): Property {
  const photos: Photo[] = (d.photos || []).map((p: any) => ({
    url: p.url || undefined,
    alt: p.alt || d.title,
    label: p.label || 'Property photo',
  }));
  if (d.mainImage && !photos.some((p) => p.url)) {
    photos.unshift({ url: d.mainImage, alt: d.title, label: 'Property photo' });
  }
  // Resolve the locality slug + fall back to the locality's coordinates so the
  // listing always filters and shows on the map, even with only a name entered.
  const localitySlug = resolveLocalitySlug(d.localityName, d.localitySlug);
  const loc = localitySlug ? getLocalityById(localitySlug) : undefined;
  const geo =
    d.geo ||
    (loc && loc.latitude != null ? { lat: loc.latitude, lng: (loc as any).longitude } : undefined);
  return {
    id: d.slug,
    slug: d.slug,
    title: d.title,
    status: d.status,
    statusLabel: d.statusLabel || defaultStatusLabel(d.status),
    priceDisplay: d.priceOnRequest ? 'Price on request' : d.priceDisplay,
    priceValue: d.priceValue,
    pricePer: d.pricePer,
    propertyType: d.propertyType,
    localityName: d.localityName,
    localitySlug,
    address: d.address,
    perSqftDisplay: d.perSqftDisplay,
    beds: num(d.beds),
    baths: num(d.baths),
    area: d.area,
    areaSqft: d.areaSqft,
    floor: d.floor,
    builtYear: d.builtYear,
    facing: d.facing,
    parking: d.parking,
    furnishing: d.furnishing,
    description: d.description,
    amenities: d.amenities,
    photos,
    geo,
    featured: !!d.featured,
    cardMeta: d.cardMeta,
    newAt: d.newAt,
    // extended (shown in "Additional details" when present)
    carpetArea: d.carpetArea,
    builtUpArea: d.builtUpArea,
    plotSize: d.plotSize,
    totalFloors: d.totalFloors,
    age: d.age,
    possession: d.possession,
    rera: d.rera,
    roadWidth: d.roadWidth,
    ceilingHeight: d.ceilingHeight,
    powerLoad: d.powerLoad,
    loadingAccess: d.loadingAccess,
    warehouseType: d.warehouseType,
    plotZoning: d.plotZoning,
    naStatus: d.naStatus,
    frontage: d.frontage,
    dockAccess: d.dockAccess,
    suitableFor: d.suitableFor,
  };
}

let _properties: Promise<Property[]> | null = null;

export function getProperties(): Promise<Property[]> {
  if (_properties) return _properties;
  _properties = (async () => {
    // Drafts never appear on the public site.
    const entries = await getCollection('properties', ({ data }) => !data.draft);
    return entries
      .map((e) => toProperty({ ...e.data, slug: e.data.slug || e.id }))
      .sort((a, b) => String(b.newAt || '').localeCompare(String(a.newAt || '')));
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
  return Promise.resolve(sampleLocalities);
}
