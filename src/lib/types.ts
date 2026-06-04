// Shared domain types for City Property Services.
// These shapes are produced both by the Sanity data layer (src/lib/data.ts)
// and the bundled sample fallback (src/data/sample.ts), so pages/components
// never need to know which source they came from.

export type PropertyType =
  | 'residential'
  | 'commercial'
  | 'land'
  | 'industrial'
  | 'warehousing';

export type Status = 'sale' | 'rent';

export interface Photo {
  /** Resolved image URL (Sanity CDN or /public path). Empty => render .ph placeholder. */
  url?: string;
  /** Placeholder/caption label, e.g. "Living room · main photo". */
  label: string;
  /** Alt text for accessibility. */
  alt?: string;
}

/** A single fact pill in the property-card meta row (beds / bath / area …). */
export interface CardMeta {
  icon: string; // Icon name (see src/lib/icons.ts)
  label: string;
}

/** A fact in the property-detail facts grid. */
export interface Fact {
  icon: string;
  value: string;
  key: string;
}

export interface Agent {
  id: string;
  slug: string;
  name: string;
  role: string; // e.g. "Senior Advisor"
  exp?: string; // e.g. "12 yrs"
  region?: string;
  phone?: string; // human-readable, for tel:
  whatsapp?: string; // digits only, for wa.me
  email?: string;
  avatar?: Photo;
}

export interface Locality {
  id: string;
  slug: string;
  name: string;
  blurb: string; // e.g. "Commercial hub · Avg ₹7,200/sqft"
  avgPriceDisplay?: string;
  /** Position on the stylised map (percent) and/or real geo. */
  mapPos?: { left: string; top: string };
  geo?: { lat: number; lng: number };
}

export interface Property {
  id: string;
  slug: string;
  title: string; // e.g. "3 BHK Apartment · Iscon Platinum"
  status: Status;
  statusLabel: string; // "For sale" | "For rent" | …
  priceDisplay: string; // "₹ 1.45 Cr"
  priceValue?: number; // numeric for sorting (in ₹)
  pricePer?: string; // " /month"
  propertyType: PropertyType;
  localityName: string;
  localitySlug?: string;
  address?: string; // "Prahlad Nagar, Ahmedabad"
  perSqftDisplay?: string; // "₹7,435/sqft"
  // Structured facts (detail page)
  beds?: number | string;
  baths?: number | string;
  area?: string; // display, e.g. "1,950 sqft"
  areaSqft?: number; // numeric for sorting
  floor?: string;
  builtYear?: string;
  facing?: string;
  parking?: string;
  furnishing?: string;
  description?: string[]; // paragraphs
  amenities?: string[];
  photos?: Photo[];
  geo?: { lat: number; lng: number };
  agentId?: string;
  featured?: boolean;
  /** Optional override for the card meta row; otherwise derived from fields. */
  cardMeta?: CardMeta[];
  newAt?: string; // ISO date for "Newest first" sort
}
