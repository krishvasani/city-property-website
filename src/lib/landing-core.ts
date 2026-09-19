// Locality × property-type landing pages ("Office Space for Rent in Thaltej").
//
// Pure functions over a minimal listing shape so the same logic serves the
// Astro pages (Property objects), the sitemap (raw JSON read from disk) and
// the homepage search routing. No astro:content imports here.
import { getAllLocalities, getLocalityById, type Locality } from '../data/localities';

export type Side = 'buy' | 'rent';

/** Search-phrase slug per propertyType. `null` = no landing page for that type. */
export const TYPE_SLUG: Record<string, string | null> = {
  office: 'office-space',
  commercial: 'office-space',
  shop: 'shop',
  retail: 'shop',
  showroom: 'showroom',
  warehouse: 'warehouse',
  warehousing: 'warehouse',
  industrial: 'industrial-shed',
  'industrial shed': 'industrial-shed',
  apartment: 'flat',
  flat: 'flat',
  penthouse: 'flat',
  residential: 'flat',
  bungalow: 'bungalow',
  villa: 'bungalow',
  house: 'bungalow',
  'row house': 'bungalow',
  plot: 'plot',
  'residential land': 'plot',
  'commercial land': 'plot',
  land: 'land',
  'industrial land': 'land',
  investment: null, // pre-leased assets: not a search phrase people use with a locality
};
/** Display labels per type slug: singular, plural. */
export const TYPE_SLUG_LABEL: Record<string, [string, string]> = {
  'office-space': ['Office Space', 'office spaces'],
  shop: ['Shop', 'shops'],
  showroom: ['Showroom', 'showrooms'],
  warehouse: ['Warehouse', 'warehouses'],
  'industrial-shed': ['Industrial Shed', 'industrial sheds'],
  flat: ['Flat', 'flats'],
  bungalow: ['Bungalow', 'bungalows'],
  plot: ['Plot', 'plots'],
  land: ['Land', 'land parcels'],
};
/** Hero-search category (residential/commercial/…) each type slug belongs to. */
export const TYPE_SLUG_CATEGORY: Record<string, string> = {
  'office-space': 'commercial', shop: 'commercial', showroom: 'commercial',
  warehouse: 'industrial', 'industrial-shed': 'industrial',
  flat: 'residential', bungalow: 'residential',
  plot: 'land', land: 'land',
};

export const MIN_LISTINGS = 3;

export const sideOf = (status: string): Side => (status === 'sale' ? 'buy' : 'rent');
export const sideWord = (side: Side) => (side === 'buy' ? 'Sale' : 'Rent');
export const typeSlugOf = (propertyType: string): string | null | undefined => TYPE_SLUG[(propertyType || '').toLowerCase()];
export const landingPath = (side: Side, typeSlug: string, localitySlug: string) => `/${side}/${typeSlug}-in-${localitySlug}/`;

export interface LandingListing {
  slug: string;
  title: string;
  status: string;
  propertyType: string;
  localitySlug?: string;
  localityName: string;
  priceValue?: number;
  priceDisplay: string;
  pricePer?: string;
  areaSqft?: number;
  area?: string;
  beds?: number | string;
  newAt?: string;
  photos?: { url?: string; alt?: string }[];
}

export interface Combo<T extends LandingListing = LandingListing> {
  key: string;            // `${side}|${typeSlug}|${localitySlug}`
  side: Side;
  typeSlug: string;
  locality: Locality;
  listings: T[];
  path: string;
}

/** Group listings into (side, type, locality) sets. Includes ALL sizes; filter by MIN_LISTINGS for pages. */
export function allCombos<T extends LandingListing>(listings: T[]): Combo<T>[] {
  const map = new Map<string, Combo<T>>();
  for (const p of listings) {
    const typeSlug = typeSlugOf(p.propertyType);
    if (!typeSlug || !p.localitySlug) continue;
    const loc = getLocalityById(p.localitySlug);
    if (!loc) continue; // locality not in the dataset → no context to write about
    const side = sideOf(p.status);
    const key = `${side}|${typeSlug}|${loc.id}`;
    if (!map.has(key)) map.set(key, { key, side, typeSlug, locality: loc, listings: [], path: landingPath(side, typeSlug, loc.slug) });
    map.get(key)!.listings.push(p);
  }
  for (const c of map.values()) c.listings.sort((a, b) => String(b.newAt || '').localeCompare(String(a.newAt || '')) || a.slug.localeCompare(b.slug));
  return [...map.values()].sort((a, b) => a.path.localeCompare(b.path));
}

/** Combos that get a page. */
export const pageCombos = <T extends LandingListing>(listings: T[]) => allCombos(listings).filter((c) => c.listings.length >= MIN_LISTINGS);

/** Histogram of combo sizes for reporting. */
export function comboSizeDistribution(listings: LandingListing[]) {
  const buckets: Record<string, number> = { '1': 0, '2': 0, '3-5': 0, '6-10': 0, '11+': 0 };
  for (const c of allCombos(listings)) {
    const n = c.listings.length;
    buckets[n === 1 ? '1' : n === 2 ? '2' : n <= 5 ? '3-5' : n <= 10 ? '6-10' : '11+']++;
  }
  return buckets;
}

// ── stats for the intro, table and FAQ ──────────────────────────────────
export const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
/** ₹ amount in the site's own style: "₹1.59 Cr", "₹85 L", "₹2,25,000". */
export function inrShort(n: number): string {
  if (n >= 1e7) return `₹${+(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${+(n / 1e5).toFixed(2)} L`;
  return inr(n);
}
export const isPerSqft = (p: LandingListing) => /\/\s*sq\.?\s*ft/i.test(p.priceDisplay);
export const perSqftRate = (p: LandingListing) => {
  const m = p.priceDisplay.match(/₹\s*([\d,.]+)\s*\/\s*sq\.?\s*ft/i);
  return m ? Number(m[1].replace(/,/g, '')) : undefined;
};
export const onRequest = (p: LandingListing) => !p.priceValue || /price on request/i.test(p.priceDisplay);
const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : undefined; };

export interface ComboStats {
  count: number;
  priced: number;
  /** "₹35 / sq.ft to ₹75 / sq.ft per month", "₹1.03 Cr to ₹8.19 Cr", … in the listings' own style */
  priceRange?: string;
  priceMin?: number; priceMax?: number;
  /** "928 sq.ft to 25,000 sq.ft" | "3 BHK to 5 BHK" */
  sizeRange?: string;
  sizeMinSqft?: number; sizeMaxSqft?: number;
  /** "₹58 per sq.ft per month (median)" | "₹9,850 per sq.ft (median)" */
  typicalUnitPrice?: string;
  withPhotos: number;
  buildings: string[];
  newest?: string;
}
export function comboStats(c: Combo, buildingName: (p: LandingListing) => string | undefined): ComboStats {
  const L = c.listings;
  const priced = L.filter((p) => !onRequest(p));
  const perSqft = priced.filter(isPerSqft).map(perSqftRate).filter((n): n is number => !!n);
  const totals = priced.filter((p) => !isPerSqft(p)).map((p) => p.priceValue!);
  let priceRange: string | undefined, priceMin: number | undefined, priceMax: number | undefined;
  if (c.side === 'rent' && perSqft.length >= totals.length && perSqft.length) {
    priceMin = Math.min(...perSqft); priceMax = Math.max(...perSqft);
    priceRange = priceMin === priceMax ? `₹${priceMin} / sq.ft per month` : `₹${priceMin} to ₹${priceMax} / sq.ft per month`;
  } else if (totals.length) {
    priceMin = Math.min(...totals); priceMax = Math.max(...totals);
    const per = c.side === 'rent' ? ' per month' : '';
    priceRange = priceMin === priceMax ? `${inrShort(priceMin)}${per}` : `${inrShort(priceMin)} to ${inrShort(priceMax)}${per}`;
  }
  const sq = L.map((p) => p.areaSqft).filter((n): n is number => !!n);
  const beds = L.map((p) => (typeof p.beds === 'number' ? p.beds : Number(p.beds))).filter((n) => n > 0);
  let sizeRange: string | undefined;
  if (sq.length) {
    const lo = Math.min(...sq), hi = Math.max(...sq);
    sizeRange = lo === hi ? `${lo.toLocaleString('en-IN')} sq.ft` : `${lo.toLocaleString('en-IN')} to ${hi.toLocaleString('en-IN')} sq.ft`;
  } else if (beds.length) {
    const lo = Math.min(...beds), hi = Math.max(...beds);
    sizeRange = lo === hi ? `${lo} BHK` : `${lo} to ${hi} BHK`;
  }
  let typicalUnitPrice: string | undefined;
  if (perSqft.length) typicalUnitPrice = `₹${median(perSqft)} per sq.ft per month (median of ${perSqft.length})`;
  else {
    const rates = priced.filter((p) => p.areaSqft && p.priceValue).map((p) => p.priceValue! / p.areaSqft!);
    if (rates.length) typicalUnitPrice = `${inr(median(rates)!)} per sq.ft${c.side === 'rent' ? ' per month' : ''} (median of ${rates.length})`;
  }
  const buildings = [...new Set(L.map(buildingName).filter((b): b is string => !!b))];
  return {
    count: L.length, priced: priced.length, priceRange, priceMin, priceMax, sizeRange,
    sizeMinSqft: sq.length ? Math.min(...sq) : undefined, sizeMaxSqft: sq.length ? Math.max(...sq) : undefined,
    typicalUnitPrice, withPhotos: L.filter((p) => p.photos?.some((x) => x.url)).length, buildings,
    newest: L.map((p) => p.newAt).filter(Boolean).sort().pop(),
  };
}

// ── neighbours ──────────────────────────────────────────────────────────
const dist = (a: Locality, b: Locality) =>
  a.latitude != null && b.latitude != null
    ? Math.hypot((a.latitude - b.latitude) * 111, (a.longitude - b.longitude) * 102)
    : Infinity;

/** Same type+side in the nearest localities that have a page (by centroid distance, then nearbyAreas order). */
export function nearestSiblings<T extends LandingListing>(combo: Combo<T>, combos: Combo<T>[], limit = 6): Combo<T>[] {
  const same = combos.filter((c) => c.side === combo.side && c.typeSlug === combo.typeSlug && c.locality.id !== combo.locality.id);
  const near = new Set(combo.locality.nearbyAreas);
  return same
    .map((c) => ({ c, d: dist(combo.locality, c.locality), n: near.has(c.locality.id) ? 0 : 1 }))
    .sort((a, b) => a.n - b.n || a.d - b.d || a.c.locality.name.localeCompare(b.c.locality.name))
    .slice(0, limit)
    .map((x) => x.c);
}
/** Other types (either side) with a page in the same locality. */
export const otherTypesHere = <T extends LandingListing>(combo: Combo<T>, combos: Combo<T>[]) =>
  combos.filter((c) => c.locality.id === combo.locality.id && c.key !== combo.key);

export const localityIds = () => getAllLocalities().map((l) => l.id);
