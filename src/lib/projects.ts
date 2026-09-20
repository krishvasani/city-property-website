// Adani Shantigram project data: typed access to src/content/projects/shantigram/*.json.
// Every field is optional except the identity ones — pages only render what
// the source documents stated (see the extraction notes in each file's dataGaps).
export interface Configuration {
  label: string;
  carpetSqft?: number | string;
  carpetSqYd?: number | string;
  balconySqft?: number;
  totalSqft?: number;
  totalSqYd?: number;
  superBuiltUpSqft?: number | string;
  plotSqft?: string; plotSqYd?: string; plotSqm?: string;
  builtUpSqft?: string; builtUpSqYd?: string;
  unitReraSqft?: number; unitReraSqYd?: number;
  priceDisplay: string;
  priceMin?: number;
  priceMax?: number;
  priceNote?: string;
  soldOut?: boolean;
}
export interface Project {
  slug: string;
  name: string;
  developer: string;
  partner?: string;
  township: string;
  address: string;
  projectType: 'apartment' | 'villa' | 'plotted' | 'row house';
  positioning: string;
  rera: string;
  reraNote?: string;
  status: string;
  possession: string;
  towers?: number;
  floors?: number;
  totalUnits?: number;
  unitsNote?: string;
  retailUnits?: number;
  landArea?: string;
  towerHeight?: string;
  structure?: string;
  carParking?: string;
  architect?: string;
  configurations: Configuration[];
  carpetRange?: string;
  factSheetAreas?: Record<string, string>;
  priceAsOf: string;
  /** Project-level band from the CPS Series Master (July 2026) — the pricing authority. */
  priceRange: { display: string; min: number; max?: number; source: string; asOf: string };
  priceSource: string;
  priceNote?: string;
  paymentTerms?: string;
  bookingAmount?: string;
  amenities: string[];
  proposedServices?: string[];
  locationInTownship?: string;
  distancesFromZeroCircle?: { to: string; km: number }[];
  photos: string[];
  floorPlans: string[];
  dataGaps: string[];
  sources: string[];
}
export interface Township {
  slug: string; name: string; developer: string; city: string; location: string;
  landArea: string; landAreaNote: string; certification: string; families: string;
  developerCredentials: { years: string; developedMnSqft: string; underDevelopmentMnSqft: string; families: string; awards: string; cities: string[] };
  zones: string[]; golf: { club: string; clubArea: string; holes: number; promenade: string }; lake: string;
  education: string[]; healthcare: string[]; retail: string[]; commercial: string[]; sport: string[]; worship: string[];
  nature: string[]; infrastructure: string[]; transport: string[]; safety: string[];
  distancesFromZeroCircle: { to: string; km: number }[]; distancesSource: string; completedClusters: string;
  photos: string[]; floorPlans: string[]; sources: string[];
}

const files = import.meta.glob<{ default: Project | Township }>('../content/projects/shantigram/*.json', { eager: true });

export const township: Township = Object.entries(files).find(([k]) => k.endsWith('_township.json'))![1].default as Township;

/** The 13 projects, in price-ladder order (lowest entry first, then on-request). */
export const projects: Project[] = Object.entries(files)
  .filter(([k]) => !k.endsWith('_township.json'))
  .map(([, m]) => m.default as Project)
  // Amenities are presented alphabetically, not in the brochure's order.
  .map((p) => ({ ...p, amenities: [...p.amenities].sort((a, b) => a.localeCompare(b)), proposedServices: p.proposedServices ? [...p.proposedServices].sort((a, b) => a.localeCompare(b)) : undefined }))
  .sort((a, b) => (priceFloor(a) ?? 1e12) - (priceFloor(b) ?? 1e12) || a.name.localeCompare(b.name));

export const HUB_PATH = '/projects/adani-shantigram/';
export const projectPath = (p: Project) => `${HUB_PATH}${p.slug}/`;

/** Lowest price in rupees: the Series Master band, falling back to configuration prices. */
export function priceFloor(p: Project): number | undefined {
  if (p.priceRange?.min) return p.priceRange.min;
  const v = p.configurations.map((c) => c.priceMin).filter((n): n is number => !!n);
  return v.length ? Math.min(...v) : undefined;
}
export function priceCeiling(p: Project): number | undefined {
  if (p.priceRange?.min) return p.priceRange.max;
  const v = p.configurations.map((c) => c.priceMax).filter((n): n is number => !!n);
  return v.length ? Math.max(...v) : undefined;
}
export const hasPublishedPrice = (p: Project) => priceFloor(p) !== undefined;
/** True when the developer publishes a price for at least one configuration (vs. band only). */
export const hasConfigPrices = (p: Project) => p.configurations.some((c) => c.priceMin);

export function inrShort(n: number): string {
  if (n >= 1e7) return `₹${+(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${+(n / 1e5).toFixed(0)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}
/** "₹86 L to ₹1.05 Cr" | "₹9.25 Cr onwards" | "On request" */
export function priceBand(p: Project): string {
  if (p.priceRange?.display) return p.priceRange.display.replace(/₹(\d+)\.(\d)0 Cr/g, '₹$1.$2 Cr');
  const lo = priceFloor(p), hi = priceCeiling(p);
  if (lo === undefined) return 'On request';
  if (hi === undefined || hi === lo) return p.configurations.some((c) => /onwards/i.test(c.priceDisplay)) ? `${inrShort(lo)} onwards` : inrShort(lo);
  return `${inrShort(lo)} to ${inrShort(hi)}`;
}
/** "1 & 2 BDR" style summary from configuration labels. */
export function configSummary(p: Project): string {
  const labels = p.configurations.filter((c) => !/retail|larger unit/i.test(c.label)).map((c) => c.label.replace(/\s*\(.*?\)\s*/g, ' ').trim());
  return [...new Set(labels)].join(' · ');
}
const num = (v: number | string | undefined) => (typeof v === 'number' ? v : typeof v === 'string' ? Number(v.replace(/[^\d.]/g, '').split('.').slice(0, 2).join('.')) || undefined : undefined);
/** Smallest and largest stated area, preferring RERA carpet; falls back to plot / total. */
export function sizeRange(p: Project): string | undefined {
  const vals: number[] = [];
  for (const c of p.configurations) {
    if (/retail/i.test(c.label)) continue; // shop units are not homes
    for (const f of [c.carpetSqft, c.totalSqft, c.plotSqft, c.builtUpSqft]) {
      if (f === undefined) continue;
      const s = String(f).match(/[\d,]+(?:\.\d+)?/g);
      if (s) vals.push(...s.map((x) => Number(x.replace(/,/g, ''))));
      break;
    }
  }
  const v = vals.filter((n) => n > 100);
  if (!v.length) return p.carpetRange?.replace(/\s*\(.*\)$/, '');
  const lo = Math.min(...v), hi = Math.max(...v);
  const unit = p.projectType === 'plotted' || p.projectType === 'villa' ? 'sq ft (plot area)' : 'sq ft (RERA carpet)';
  return lo === hi ? `${Math.round(lo).toLocaleString('en-IN')} ${unit}` : `${Math.round(lo).toLocaleString('en-IN')} to ${Math.round(hi).toLocaleString('en-IN')} ${unit}`;
}
export const isReady = (p: Project) => /ready/i.test(p.status);
export const typeLabel = (p: Project) => ({ apartment: 'Apartments', villa: 'Villas', plotted: 'Plots', 'row house': 'Row houses' }[p.projectType]);
export { num };
