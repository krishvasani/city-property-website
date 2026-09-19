// Content for /localities/{slug}/ pages: H1, title, description, data-driven
// intro, market summary table, FAQ and JSON-LD nodes. Same rules as the
// landing pages — everything comes from the listings or the locality dataset.
import type { Property } from './types';
import type { Locality } from '../data/localities';
import { getLocalityById } from '../data/localities';
import { site } from './config';
import { buildingName } from './seo';
import {
  comboStats, sideOf, sideWord, typeSlugOf, TYPE_SLUG_LABEL,
  type Combo, type ComboStats, type Side,
} from './landing-core';
import type { PropertyCombo } from './landing';

const clean = (s: string) => s.replace(/\s+/g, ' ').replace(/\s+([,.;])/g, '$1').trim();
const cutAtWord = (s: string, max: number) => (s.length <= max ? s : s.slice(0, max + 1).replace(/\s+\S*$/, '').replace(/[\s,.;:·(-]+$/, ''));
const list = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const firstSentences = (text: string, n: number) => (text.match(/[^.!?]+[.!?]+(?=\s|$)/g) ?? [text]).slice(0, n).join(' ').trim();
const cap = (s: string) => s.replace(/^./, (c) => c.toUpperCase());
function uniqueBuildings(listings: Property[]): string[] {
  const seen = new Set<string>();
  return listings.map(buildingName).filter((b): b is string => {
    if (!b) return false;
    const k = b.toLowerCase().replace(/\s+/g, ' ').trim();
    if (seen.has(k)) return false;
    seen.add(k); return true;
  });
}

export interface MarketRow {
  typeSlug: string;
  side: Side;
  label: string;          // "Office spaces for rent"
  stats: ComboStats;
  landing?: PropertyCombo;
}
export interface NearbyCard { loc: Locality; count: number; hasPage: boolean; blurb: string }
export interface LocalityContent {
  h1: string;
  /** Dataset facts shown as a definition list. */
  facts: { k: string; v: string }[];
  nearbyCards: NearbyCard[];
  title: string;
  description: string;
  intro: string[];
  rows: MarketRow[];
  landings: PropertyCombo[];
  faq: { q: string; a: string }[];
  nearby: Locality[];
  breadcrumbs: { name: string; url: string }[];
  graph: Record<string, any>[];
  hasSale: boolean;
  hasRent: boolean;
}

export function localityContent(loc: Locality, listings: Property[], combos: PropertyCombo[], allListings: Property[] = listings, pageIds: Set<string> = new Set()): LocalityContent {
  const url = `${site.url}/localities/${loc.slug}/`;
  const n = listings.length;
  const sale = listings.filter((p) => sideOf(p.status) === 'buy');
  const rent = listings.filter((p) => sideOf(p.status) === 'rent');
  const hasSale = sale.length > 0, hasRent = rent.length > 0;
  const landings = combos.filter((c) => c.locality.id === loc.id).sort((a, b) => b.listings.length - a.listings.length);

  // ── market rows: one per (type, side) present ──
  const rowMap = new Map<string, MarketRow>();
  for (const p of listings) {
    const t = typeSlugOf(p.propertyType);
    if (!t) continue;
    const side = sideOf(p.status);
    const key = `${t}|${side}`;
    if (!rowMap.has(key)) {
      rowMap.set(key, { typeSlug: t, side, label: `${cap(TYPE_SLUG_LABEL[t][1])} for ${sideWord(side).toLowerCase()}`, stats: undefined as any, landing: landings.find((c) => c.typeSlug === t && c.side === side) });
    }
  }
  const rows: MarketRow[] = [...rowMap.values()].map((r) => {
    const L = listings.filter((p) => typeSlugOf(p.propertyType) === r.typeSlug && sideOf(p.status) === r.side);
    const combo: Combo<Property> = { key: '', side: r.side, typeSlug: r.typeSlug, locality: loc, listings: L, path: '' };
    return { ...r, stats: comboStats(combo, buildingName) };
  }).sort((a, b) => b.stats.count - a.stats.count);

  // ── H1 / title ──
  const sides = hasSale && hasRent ? 'Property for Sale and Rent' : hasSale ? 'Property for Sale' : hasRent ? 'Property for Rent' : 'Property Guide';
  const h1 = `${loc.name}, ${loc.city}: ${sides}`;
  const title = h1.length <= 60 ? h1 : `${loc.name}: ${sides}`;

  // ── description 140–155 ──
  const typeBits = rows.slice(0, 3).map((r) => `${r.stats.count} ${r.label.toLowerCase()}`);
  let description = n
    ? clean(`${n} ${n === 1 ? 'property' : 'properties'} in ${loc.name}, ${loc.city}: ${list(typeBits)}.`)
    : clean(`${loc.name}, ${loc.city}: ${firstSentences(loc.description, 1)}`);
  const extras = [
    rows[0]?.stats.priceRange ? `${cap(rows[0].label)} from ${rows[0].stats.priceRange}.` : '',
    loc.popularFor?.length ? `Known for ${list(loc.popularFor.slice(0, 3))}.` : '',
    'Local advice from City Property Services.',
    firstSentences(loc.description, 1),
    loc.connectivity?.length ? `Reached via ${list(loc.connectivity.slice(0, 2))}.` : '',
  ].filter(Boolean);
  for (const e of extras) {
    if (description.length >= 140) break;
    if (description.includes(e.replace(/\.$/, ''))) continue;
    const next = clean(`${description} ${e}`);
    if (next.length <= 155) description = next;
  }
  if (description.length < 140) {
    for (const e of ['Buy, rent and invest with City Property Services.', 'Talk to a local advisor about price, timing and options.', firstSentences(loc.description, 2)]) {
      if (description.length >= 140 || description.includes(e.replace(/\.$/, ''))) continue;
      const next = clean(`${description} ${e}`);
      description = next.length <= 155 ? next : cutAtWord(next, 154).replace(/[.]?$/, '') + '.';
    }
  }
  if (description.length > 155) description = cutAtWord(description, 154).replace(/[.]?$/, '') + '.';

  // ── intro ──
  const intro: string[] = [];
  if (n) {
    const split = [hasSale && `${sale.length} for sale`, hasRent && `${rent.length} for rent or lease`].filter(Boolean) as string[];
    const typeSummary = rows.map((r) => `${r.stats.count} ${r.label.toLowerCase()}`);
    intro.push(clean(`City Property Services currently lists ${n} ${n === 1 ? 'property' : 'properties'} in ${loc.name}, ${loc.city} — ${list(split)}. By type: ${list(typeSummary)}.`));
    const priced = rows.filter((r) => r.stats.priceRange).slice(0, 4).map((r) => `${r.label.toLowerCase()} from ${r.stats.priceRange}${r.stats.sizeRange ? ` (${r.stats.sizeRange})` : ''}`);
    if (priced.length) intro.push(clean(`Asking prices: ${list(priced)}.`));
    const buildings = uniqueBuildings(listings);
    if (buildings.length) intro.push(clean(`Buildings and projects with current availability include ${buildings.length > 8 ? `${buildings.slice(0, 8).join(', ')} and ${buildings.length - 8} more` : list(buildings)}.`));
  }
  const nearby = loc.nearbyAreas.map((id) => getLocalityById(id)).filter((x): x is Locality => !!x).slice(0, 8);
  const character = [
    loc.description,
    loc.popularFor?.length ? `${loc.name} is known for ${list(loc.popularFor)}.` : '',
    loc.landmarks?.length ? `Landmarks include ${list(loc.landmarks.slice(0, 5))}.` : '',
  ].filter(Boolean).join(' ');
  intro.push(clean(character));
  const access = [
    loc.connectivity?.length ? `${loc.name} is reached via ${list(loc.connectivity.slice(0, 4))}.` : '',
    nearby.length ? `Nearby areas: ${list(nearby.map((x) => x.name))}.` : '',
  ].filter(Boolean).join(' ');
  if (access) intro.push(clean(access));

  // ── FAQ (question shapes differ from the landing pages) ──
  const faq: { q: string; a: string }[] = [];
  if (n) {
    faq.push({
      q: `What types of property are available in ${loc.name}?`,
      a: clean(`Right now City Property Services lists ${list(rows.map((r) => `${r.stats.count} ${r.label.toLowerCase()}`))} in ${loc.name}${landings.length ? `. Each type has its own page: ${list(landings.map((c) => `${TYPE_SLUG_LABEL[c.typeSlug][0]} for ${sideWord(c.side)} in ${loc.name}`))}` : ''}.`),
    });
    const top = rows.find((r) => r.stats.priceRange);
    if (top) {
      const single = TYPE_SLUG_LABEL[top.typeSlug][0].toLowerCase();
      faq.push({
        q: `What does ${/^[aeiou]/.test(single) ? 'an' : 'a'} ${single} cost ${top.side === 'buy' ? 'to buy' : 'to rent'} in ${loc.name}?`,
        a: clean(`Across ${top.stats.priced} priced listing${top.stats.priced === 1 ? '' : 's'}, ${top.label.toLowerCase()} in ${loc.name} run from ${top.stats.priceRange}${top.stats.typicalUnitPrice ? `, with a typical rate of ${top.stats.typicalUnitPrice}` : ''}${top.stats.sizeRange ? `. Sizes range from ${top.stats.sizeRange}` : ''}.`),
      });
    }
    faq.push({
      q: `Is ${loc.name} better for buying or renting?`,
      a: clean(
        hasSale && hasRent
          ? `Both markets are active: ${sale.length} of the current listings are for sale and ${rent.length} for rent or lease. ${sale.length > rent.length ? 'Supply currently leans towards sale' : rent.length > sale.length ? 'Supply currently leans towards rental' : 'Supply is evenly split'}${rows[0] ? `, led by ${rows[0].label.toLowerCase()}` : ''}. Talk to us about which suits your timeline and budget.`
          : hasSale
            ? `Current supply in ${loc.name} is for sale only (${sale.length} listing${sale.length === 1 ? '' : 's'}). Rental options come up from time to time; ask us to watch for one.`
            : `Current supply in ${loc.name} is for rent or lease only (${rent.length} listing${rent.length === 1 ? '' : 's'}). Sale options come up from time to time; ask us to watch for one.`,
      ),
    });
  }
  if (nearby.length || loc.connectivity?.length || loc.landmarks?.length) {
    faq.push({
      q: `What is near ${loc.name}?`,
      a: clean(`${nearby.length ? `Neighbouring areas are ${list(nearby.map((x) => x.name))}.` : ''} ${loc.connectivity?.length ? `The area connects via ${list(loc.connectivity.slice(0, 4))}.` : ''} ${loc.landmarks?.length ? `Landmarks include ${list(loc.landmarks.slice(0, 5))}.` : ''}`),
    });
  }
  if (loc.popularFor?.length) {
    faq.push({ q: `What is ${loc.name} known for?`, a: clean(`${loc.name} is known for ${list(loc.popularFor)}. ${firstSentences(loc.description, 2)}`) });
  }
  if (!n) {
    faq.push({ q: `Can City Property Services help me find property in ${loc.name}?`, a: `Yes. Not every option is listed online; tell us what you need in ${loc.name} and we will share off-market and upcoming options, or watch the area for you.` });
  }
  const buildings = uniqueBuildings(listings);
  if (buildings.length && faq.length < 6) {
    faq.push({ q: `Which buildings in ${loc.name} have availability right now?`, a: clean(`Current listings are in ${buildings.length > 8 ? `${buildings.slice(0, 8).join(', ')} and ${buildings.length - 8} other buildings` : list(buildings)}. Availability changes, so contact us for the latest.`) });
  }

  // ── breadcrumbs + graph ──
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Localities', url: '/localities/' },
    { name: loc.name, url: `/localities/${loc.slug}/` },
  ];
  const placeId = `${url}#place`;
  const graph: Record<string, any>[] = [
    {
      '@type': 'CollectionPage',
      '@id': `${url}#page`,
      url,
      name: h1,
      description,
      isPartOf: { '@id': `${site.url}/#website` },
      about: { '@id': placeId },
      ...(n ? { mainEntity: { '@id': `${url}#list` } } : {}),
    },
    {
      '@type': 'Place',
      '@id': placeId,
      name: `${loc.name}, ${loc.city}`,
      url,
      description: firstSentences(loc.description, 2),
      address: {
        '@type': 'PostalAddress',
        addressLocality: loc.name,
        addressRegion: 'Gujarat',
        addressCountry: 'IN',
        ...(loc.pincode ? { postalCode: loc.pincode } : {}),
      },
      ...(loc.latitude != null ? { geo: { '@type': 'GeoCoordinates', latitude: loc.latitude, longitude: loc.longitude } } : {}),
      containedInPlace: { '@type': 'City', name: loc.city },
    },
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ];
  if (n) {
    graph.splice(1, 0, {
      '@type': 'ItemList',
      '@id': `${url}#list`,
      name: `Property in ${loc.name}`,
      numberOfItems: n,
      itemListOrder: 'https://schema.org/ItemListUnordered',
      itemListElement: listings.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${site.url}/property/${p.slug}/`,
        item: { '@id': `${site.url}/property/${p.slug}/#listing` },
      })),
    });
  }

  // ── dataset facts + nearby cards (all real fields) ──
  const relLabels: [keyof typeof loc.propertyRelevance, string][] = [
    ['buy', 'buying'], ['rent', 'renting'], ['lease', 'leasing'], ['commercial', 'commercial space'],
    ['industrial', 'industrial property'], ['warehousing', 'warehousing'], ['plots', 'plots and land'],
  ];
  const relevant = relLabels.filter(([k]) => (loc.propertyRelevance as any)[k]).map(([, v]) => v);
  const facts: { k: string; v: string }[] = [
    { k: 'City', v: `${loc.city}${loc.district && loc.district !== loc.city ? `, ${loc.district} district` : ''}` },
    { k: 'Region', v: `${loc.region}${loc.zone ? ` (${loc.zone} zone)` : ''}` },
    ...(loc.microMarket ? [{ k: 'Micro-market', v: loc.microMarket }] : []),
    ...(loc.pincode ? [{ k: 'PIN code', v: loc.pincode }] : []),
    ...(loc.propertyTypes?.length ? [{ k: 'Typical property', v: list(loc.propertyTypes.map(String)) }] : []),
    ...(relevant.length ? [{ k: 'We advise on', v: list(relevant) }] : []),
    ...(loc.landmarks?.length ? [{ k: 'Landmarks', v: list(loc.landmarks) }] : []),
    ...(loc.connectivity?.length ? [{ k: 'Access', v: list(loc.connectivity) }] : []),
    { k: 'Live listings', v: n ? `${n} (${[hasSale && `${sale.length} for sale`, hasRent && `${rent.length} for rent`].filter(Boolean).join(', ')})` : 'None listed online right now — ask us for off-market options' },
  ];
  const nearbyCards: NearbyCard[] = nearby.map((nb) => ({
    loc: nb,
    count: allListings.filter((p) => p.localitySlug === nb.id).length,
    hasPage: pageIds.has(nb.id),
    blurb: firstSentences(nb.description, 1),
  }));

  return { h1, title, description, intro, rows, landings, faq, nearby, nearbyCards, facts, breadcrumbs, graph, hasSale, hasRent };
}
