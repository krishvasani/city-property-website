// Commercial project data: typed access to src/content/projects/commercial/*.json.
//
// Source: the City Property Services project intake form, which the developer's
// sales team fills in. Every field is optional except the identity ones — pages
// render only what was submitted, so a blank in the form is a blank on the page,
// never a guess. The `internal` block (sales contacts, uploads, private notes)
// is deliberately NOT exported to the page layer.
export interface FloorRow {
  /** "Ground", "5 & 6", "12 to 20", "Basements 1 to 5". */
  floor: string;
  /** "Retail", "Office", "Corporate house" — null when the form left it blank. */
  use: string | null;
  unitsPerFloor: string | null;
  /** Already formatted: "1,186 – 1,586 sq ft". */
  carpet: string | null;
  sbu: string | null;
  ceiling: string | null;
}
/** A per-sq-ft rate. `regular` = construction-linked plan, `dp` = down-payment plan. */
export interface OfficeRate { label: string; regular?: number; dp?: number }
export interface RetailRate { floor: string; regular?: number; dp?: number }

export interface CommercialProject {
  slug: string;
  name: string;
  developer: string;
  address: string;
  localitySlug: string;
  localityName: string;
  city: string;
  geo: { lat: number; lng: number } | null;
  /** Gujarat RERA registration, or null when it could not be published — see reraNote. */
  rera: string | null;
  reraNote: string | null;
  projectType: 'office' | 'retail' | 'mixed-use';
  projectTypeLabel: string;
  status: string;
  /** ISO date, or null when the building is ready. */
  possession: string | null;
  floors: string;
  totalUnits: string | null;
  lifts: number | null;
  basements: number | null;
  landArea: string | null;
  amenities: string[];
  floorMix: FloorRow[];
  pricing: {
    office: OfficeRate[];
    retailByFloor: RetailRate[];
    retailDpNote: string | null;
    extraCharges: string | null;
    floorRise: string | null;
  };
  priceAsOf: string;
  priceSource: string;
  photos: string[];
  photoLabels: string[];
  brochure: string | null;
  dataGaps: string[];
}

const files = import.meta.glob<{ default: CommercialProject }>('../content/projects/commercial/*.json', { eager: true });

/** All commercial projects, ready buildings first, then by possession date, then by name. */
export const commercialProjects: CommercialProject[] = Object.values(files)
  .map((m) => m.default)
  .map((p) => ({ ...p, amenities: [...p.amenities].sort((a, b) => a.localeCompare(b)) }))
  .sort((a, b) => Number(isReady(b)) - Number(isReady(a)) || (a.possession ?? '').localeCompare(b.possession ?? '') || a.name.localeCompare(b.name));

export const PROJECTS_PATH = '/projects/';
export const commercialPath = (p: CommercialProject) => `${PROJECTS_PATH}${p.slug}/`;

export function isReady(p: CommercialProject): boolean {
  return /ready/i.test(p.status);
}

/** "2027-12-31" → "Dec 2027". Ready buildings return "Ready to move in". */
export function possessionLabel(p: CommercialProject): string {
  if (isReady(p) || !p.possession) return 'Ready to move in';
  const d = new Date(p.possession);
  return Number.isNaN(d.getTime()) ? p.possession : d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

/** 8500 → "₹8,500". */
export const rate = (n: number) => `₹${n.toLocaleString('en-IN')}`;

/** The lowest per-sq-ft rate quoted for the building, used to order and to headline. */
export function rateFloor(p: CommercialProject): number | undefined {
  const all = [
    ...p.pricing.office.flatMap((o) => [o.regular, o.dp]),
    ...p.pricing.retailByFloor.flatMap((r) => [r.regular, r.dp]),
  ].filter((n): n is number => typeof n === 'number');
  return all.length ? Math.min(...all) : undefined;
}

/** "Offices from ₹8,500 per sq ft" · "Retail from ₹11,000 per sq ft" · "On request". */
export function rateLine(p: CommercialProject): string {
  const off = p.pricing.office.flatMap((o) => [o.regular, o.dp]).filter((n): n is number => typeof n === 'number');
  const ret = p.pricing.retailByFloor.flatMap((r) => [r.regular, r.dp]).filter((n): n is number => typeof n === 'number');
  const parts: string[] = [];
  if (off.length) parts.push(`Offices from ${rate(Math.min(...off))}`);
  if (ret.length) parts.push(`retail from ${rate(Math.min(...ret))}`);
  return parts.length ? `${parts.join(' · ')} per sq ft` : 'Rates on request';
}

const nums = (s: string | null) => (s ? (s.match(/[\d,]+/g) ?? []).map((x) => Number(x.replace(/,/g, ''))).filter((n) => n > 50) : []);

/** Smallest and largest carpet area across the floor mix: "315 – 13,405 sq ft". */
export function sizeRange(p: CommercialProject): string | undefined {
  const v = p.floorMix.flatMap((f) => nums(f.carpet));
  if (!v.length) return undefined;
  const lo = Math.min(...v), hi = Math.max(...v);
  return lo === hi ? `${lo.toLocaleString('en-IN')} sq ft` : `${lo.toLocaleString('en-IN')} – ${hi.toLocaleString('en-IN')} sq ft`;
}

/** The uses actually present in the floor mix: "Retail and offices". */
export function useSummary(p: CommercialProject): string {
  const retail = p.floorMix.some((f) => f.use && /retail|showroom/i.test(f.use)) || p.pricing.retailByFloor.length > 0;
  const office = p.floorMix.some((f) => f.use && /office|corporate/i.test(f.use)) || p.pricing.office.length > 0;
  if (retail && office) return 'Retail and offices';
  if (retail) return 'Retail';
  if (office) return 'Offices';
  return p.projectTypeLabel;
}

/** Page sections, in order, for the sticky in-page nav. Only sections with content. */
export function sections(p: CommercialProject): { id: string; label: string }[] {
  const s = [{ id: 'overview', label: 'Overview' }];
  if (p.floorMix.length) s.push({ id: 'floors', label: 'Floor plan' });
  if (rateFloor(p) !== undefined || p.pricing.extraCharges) s.push({ id: 'pricing', label: 'Pricing' });
  if (p.amenities.length) s.push({ id: 'amenities', label: 'Amenities' });
  s.push({ id: 'location', label: 'Location' });
  s.push({ id: 'enquire', label: 'Enquire' });
  return s;
}
