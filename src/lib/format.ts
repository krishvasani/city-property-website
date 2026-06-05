// Display helpers shared across components.
import type { CardMeta, Fact, Property } from './types';

/** Beds label respecting singular/plural, matching the bundle ("3 Beds"/"1 Bed"). */
function bedsLabel(beds: number | string): string {
  if (typeof beds === 'number') return `${beds} ${beds === 1 ? 'Bed' : 'Beds'}`;
  return beds; // e.g. "Shed", "Retail"
}

/**
 * The meta row shown on a property card. Uses an explicit override when the
 * listing provides one (offices/industrial/retail), otherwise derives the
 * familiar beds / bath / area pills from structured fields.
 */
export function cardMetaFor(p: Property): CardMeta[] {
  if (p.cardMeta && p.cardMeta.length) return p.cardMeta;
  const meta: CardMeta[] = [];
  if (p.beds !== undefined && p.beds !== '') meta.push({ icon: 'bed', label: bedsLabel(p.beds) });
  if (p.baths !== undefined && p.baths !== '')
    meta.push({ icon: 'bath', label: typeof p.baths === 'number' ? `${p.baths} Bath` : String(p.baths) });
  if (p.area) meta.push({ icon: 'ruler', label: p.area });
  return meta;
}

/** The 8-up facts grid on the detail page; only includes fields that exist. */
export function factsFor(p: Property): Fact[] {
  const facts: Fact[] = [];
  if (p.beds !== undefined) facts.push({ icon: 'bed', value: String(p.beds), key: 'Bedrooms' });
  if (p.baths !== undefined) facts.push({ icon: 'bath', value: String(p.baths), key: 'Bathrooms' });
  if (p.areaSqft || p.area)
    facts.push({ icon: 'ruler', value: p.area?.replace(/\s*sqft$/i, '') ?? String(p.areaSqft), key: 'Sq.ft (BUA)' });
  if (p.floor) facts.push({ icon: 'floor', value: p.floor, key: 'Floor' });
  if (p.builtYear) facts.push({ icon: 'clock', value: p.builtYear, key: 'Built' });
  if (p.facing) facts.push({ icon: 'compass', value: p.facing, key: 'Facing' });
  if (p.parking) facts.push({ icon: 'parking', value: p.parking, key: 'Parking' });
  if (p.furnishing) facts.push({ icon: 'furnishing', value: p.furnishing, key: 'Furnishing' });
  return facts;
}

/** Format rupees as a short Indian figure: "₹1.16 Cr" / "₹95 L" / "₹65,000". */
export function formatINRShort(rupees: number): string {
  if (rupees >= 10_000_000) return `₹${(rupees / 10_000_000).toFixed(2).replace(/\.00$/, '')} Cr`;
  if (rupees >= 100_000) return `₹${Math.round(rupees / 100_000)} L`;
  return `₹${Math.round(rupees).toLocaleString('en-IN')}`;
}

/** Monthly EMI for principal P at annual rate% over years. */
export function emiMonthly(principal: number, annualRatePct: number, years: number): number {
  const r = annualRatePct / 12 / 100;
  const n = years * 12;
  if (r === 0) return principal / n;
  const pow = Math.pow(1 + r, n);
  return (principal * r * pow) / (pow - 1);
}

/** Tag variant for a status pill: navy = sale, soft = rent/lease. */
export function tagVariantFor(p: Property): 'navy' | 'soft' {
  return p.status === 'sale' ? 'navy' : 'soft';
}

/** Whether a property belongs on the Rent page (rent OR lease). */
export function isRental(p: Property): boolean {
  return p.status === 'rent' || p.status === 'lease';
}

/** Maps a property type to its tile icon name. */
export const TYPE_ICON: Record<Property['propertyType'], string> = {
  residential: 'residential',
  commercial: 'commercial',
  land: 'land',
  industrial: 'industrial',
  warehousing: 'warehousing',
  investment: 'investment',
};

// ── Search categories ────────────────────────────────────────────────
// The buckets shown in search/filters. Industrial + Warehousing are merged
// into one category; "Investments" covers prelaunch / prelease projects.
export type Category = 'residential' | 'commercial' | 'land' | 'industrial' | 'investment';

export const CATEGORY_LABEL: Record<Category, string> = {
  residential: 'Residential',
  commercial: 'Commercial',
  land: 'Land & plots',
  industrial: 'Industrial & Warehousing',
  investment: 'Investments',
};

export const CATEGORY_ICON: Record<Category, string> = {
  residential: 'residential',
  commercial: 'commercial',
  land: 'land',
  industrial: 'industrial',
  investment: 'investment',
};

export const CATEGORY_ORDER: Category[] = ['residential', 'commercial', 'land', 'industrial', 'investment'];

/** Maps a granular property type to its search category. */
export function categoryFor(t: Property['propertyType']): Category {
  if (t === 'warehousing' || t === 'industrial') return 'industrial';
  if (t === 'investment') return 'investment';
  return t as Category; // residential | commercial | land
}
