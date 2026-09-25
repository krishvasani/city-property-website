// One flat list of every project on the site, for the /buy/ explorer.
//
// Three sources, three shapes: the Adani Shantigram projects, the eight
// commercial buildings, and the Ambli residential projects. This normalises
// them into the single card shape the explorer filters and renders.
import { projects as shantigram, projectPath as shantigramPath, priceBand, configSummary, possessionLabel as shPossession, typeLabel as shTypeLabel } from './projects';
import { commercialProjects, residentialProjects, commercialPath, possessionLabel, rate, rateFloor, rateLine, useSummary, isReady } from './commercial-projects';
import type { Property } from './types';

export interface ProjectCard {
  slug: string;
  name: string;
  url: string;
  /** Top-level filter. */
  category: 'residential' | 'commercial';
  /** "Apartments", "Offices", "Retail and offices", "4 & 5 BHK". */
  typeLabel: string;
  developer: string | null;
  localityName: string;
  localitySlug: string;
  /** "₹5.8 to 9.3 Cr" or "Offices from ₹8,500 per sq ft" — the long form, for tables. */
  priceLine: string;
  /** The headline figure for a card: "₹5.8 to 9.3 Cr" or "₹8,500". */
  priceDisplay: string;
  /** The unit under it, when the figure is a rate: "per sq ft onwards". */
  pricePer?: string;
  /** Rupees, for sorting and the budget filter. Commercial rates are per sq ft, so they have none. */
  priceValue: number | null;
  possession: string;
  ready: boolean;
  photo: string | null;
  geo: { lat: number; lng: number } | null;
  /** Lowercased haystack for the search box. */
  search: string;
}

const card = (c: Omit<ProjectCard, 'search'>): ProjectCard => ({
  ...c,
  search: [c.name, c.developer, c.localityName, c.typeLabel].filter(Boolean).join(' ').toLowerCase(),
});

/** Every project, residential first, ready ones ahead of under-construction. */
export const allProjectCards: ProjectCard[] = [
  ...shantigram.map((p) =>
    card({
      slug: p.slug,
      name: p.name,
      url: shantigramPath(p),
      category: 'residential',
      typeLabel: configSummary(p) || shTypeLabel(p),
      developer: p.developer,
      localityName: 'Shantigram',
      localitySlug: 'shantigram',
      priceLine: priceBand(p),
      priceDisplay: priceBand(p),
      priceValue: p.priceRange?.min ?? null,
      possession: shPossession(p),
      ready: /ready/i.test(p.status),
      photo: p.photos[0] ?? null,
      geo: (p as unknown as { geo?: { lat: number; lng: number } }).geo ?? null,
    }),
  ),
  ...residentialProjects.map((p) =>
    card({
      slug: p.slug,
      name: p.name,
      url: commercialPath(p),
      category: 'residential',
      typeLabel: p.configurations ?? 'Homes',
      developer: p.developer,
      localityName: p.localityName,
      localitySlug: p.localitySlug,
      priceLine: rateLine(p),
      priceDisplay: rateLine(p),
      priceValue: p.priceValue ?? null,
      possession: possessionLabel(p),
      ready: isReady(p),
      photo: p.photos[0] ?? null,
      geo: p.geo,
    }),
  ),
  ...commercialProjects.map((p) =>
    card({
      slug: p.slug,
      name: p.name,
      url: commercialPath(p),
      category: 'commercial',
      typeLabel: useSummary(p),
      developer: p.developer,
      localityName: p.localityName,
      localitySlug: p.localitySlug,
      priceLine: rateLine(p),
      priceDisplay: rateFloor(p) !== undefined ? rate(rateFloor(p)!) : 'Rates on request',
      pricePer: rateFloor(p) !== undefined ? 'per sq ft onwards' : undefined,
      priceValue: null, // quoted per sq ft, not comparable with a total price
      possession: possessionLabel(p),
      ready: isReady(p),
      photo: p.photos[0] ?? null,
      geo: p.geo,
    }),
  ),
].sort((a, b) => Number(b.ready) - Number(a.ready) || a.name.localeCompare(b.name));

/** Localities that actually have a project, for the filter dropdown. */
export const projectLocalities = [...new Map(allProjectCards.map((c) => [c.localitySlug, c.localityName])).entries()]
  .map(([slug, name]) => ({ slug, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const projectCounts = {
  all: allProjectCards.length,
  residential: allProjectCards.filter((c) => c.category === 'residential').length,
  commercial: allProjectCards.filter((c) => c.category === 'commercial').length,
  ready: allProjectCards.filter((c) => c.ready).length,
};

// --- rendering projects with the listing card -------------------------------
// The /buy/ and /saved/ grids use the same PropertyCard as the warehouse
// listings, so the cards match in size, structure and hover by construction
// rather than by a parallel stylesheet. This adapts a project to the shape that
// card reads. `cardMeta` overrides the bed/bath/area row it would otherwise build.
/** A project as the listing card expects it. Pair with `href: card.url`. */
export function asCardProperty(c: ProjectCard): Property {
  const residential = c.category === 'residential';
  // Every project is for sale — the map's Buy/Rent control and the explorers key
  // off `status`, so an under-construction project must not read as a rental.
  // The tag text carries the build stage instead.
  return {
    slug: c.slug,
    title: c.name,
    status: 'sale',
    statusLabel: c.ready ? 'Ready to move in' : 'Under construction',
    propertyType: residential ? 'apartment' : 'office',
    // First number in "4 & 6 BHK + Penthouse" / "1 BDR · 2 BDR", so the map's
    // bedroom filter applies to residential projects.
    beds: residential ? Number((c.typeLabel.match(/\d+/) ?? [])[0]) || undefined : undefined,
    priceDisplay: c.priceDisplay,
    pricePer: c.pricePer,
    priceValue: c.priceValue ?? undefined,
    localityName: c.localityName,
    localitySlug: c.localitySlug,
    city: 'Ahmedabad',
    address: c.localityName,
    geo: c.geo ?? undefined,
    photos: c.photo ? [{ url: c.photo, alt: `${c.name}, ${c.localityName}` }] : [],
    cardMeta: [
      { icon: residential ? 'residential' : 'commercial', label: c.typeLabel },
      { icon: 'clock', label: c.possession },
    ],
  } as unknown as Property;
}
