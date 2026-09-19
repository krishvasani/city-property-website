// Content for the locality × type landing pages: title, description, intro,
// summary, FAQ and JSON-LD nodes — all derived from listing data and the
// locality dataset. Nothing here is invented copy.
import type { Property } from './types';
import { site } from './config';
import { buildingName } from './seo';
import {
  comboStats, nearestSiblings, otherTypesHere, pageCombos, sideWord,
  TYPE_SLUG_LABEL, type Combo, type ComboStats,
} from './landing-core';

export type PropertyCombo = Combo<Property>;

const clean = (s: string) => s.replace(/\s+/g, ' ').replace(/\s+([,.])/g, '$1').trim();
const cutAtWord = (s: string, max: number) => (s.length <= max ? s : s.slice(0, max + 1).replace(/\s+\S*$/, '').replace(/[\s,.;:·(-]+$/, ''));
const list = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const firstSentences = (text: string, n: number) =>
  (text.match(/[^.!?]+[.!?]+(?=\s|$)/g) ?? [text]).slice(0, n).join(' ').trim();
const article = (w: string) => (/^[aeiou]/i.test(w) ? 'an' : 'a');

export interface LandingContent {
  h1: string;
  title: string;
  description: string;
  intro: string[];
  stats: ComboStats;
  faq: { q: string; a: string }[];
  siblingsSameType: PropertyCombo[];
  otherTypesHere: PropertyCombo[];
  breadcrumbs: { name: string; url: string }[];
  graph: Record<string, any>[];
}

export function landingContent(combo: PropertyCombo, combos: PropertyCombo[]): LandingContent {
  const [single, plural] = TYPE_SLUG_LABEL[combo.typeSlug];
  const loc = combo.locality;
  const verb = combo.side === 'buy' ? 'buy' : 'rent';
  const forWord = `for ${sideWord(combo.side)}`;            // "for Sale" | "for Rent"
  const forLower = forWord.toLowerCase();
  const stats = comboStats(combo, buildingName);
  const url = `${site.url}${combo.path}`;
  const n = stats.count;

  // ── H1 / title ──
  const h1 = `${single} ${forWord} in ${loc.name}, Ahmedabad`;
  const title = h1.length <= 60 ? h1 : `${single} ${forWord} in ${loc.name}`;

  // ── description: 140–155 chars, built from clauses in priority order ──
  const descParts = [
    `${n} ${plural} ${forLower} in ${loc.name}, Ahmedabad`,
    stats.priceRange ? `${stats.priced === n ? 'from' : `${stats.priced} priced from`} ${stats.priceRange}` : '',
    stats.sizeRange ? `sizes ${stats.sizeRange}` : '',
  ].filter(Boolean);
  let description = clean(descParts.join(', ')) + '.';
  const extras = [
    stats.buildings.length ? `Availability in ${list(stats.buildings.slice(0, 3))}.` : '',
    'Verified listings from City Property Services.',
    `Compare, shortlist and book a viewing.`,
    firstSentences(loc.description, 1),
  ].filter(Boolean);
  for (const e of extras) {
    if (description.length >= 140) break;
    const next = clean(`${description} ${e}`);
    if (next.length <= 155) description = next;
  }
  if (description.length > 155) description = cutAtWord(description, 154).replace(/[.]?$/, '') + '.';
  if (description.length < 140) {
    // Rare: very short locality name + no ranges. Pad with the locality's own copy.
    const pad = clean(`${description} ${firstSentences(loc.description, 2)}`);
    description = pad.length <= 155 ? pad : cutAtWord(pad, 154).replace(/[.]?$/, '') + '.';
  }

  // ── intro (data first, then real locality context) ──
  const priceSentence = stats.priceRange
    ? stats.priced === n
      ? ` Asking prices run from ${stats.priceRange}.`
      : ` ${stats.priced} of them carry an asking price, from ${stats.priceRange}; the rest are quoted on request.`
    : ' Prices are quoted on request for these listings.';
  const sizeSentence = stats.sizeRange ? ` Sizes range from ${stats.sizeRange}.` : '';
  const bldg = stats.buildings.length ? ` Buildings with current availability include ${stats.buildings.length > 5 ? `${stats.buildings.slice(0, 5).join(', ')} and ${stats.buildings.length - 5} more` : list(stats.buildings)}.` : '';
  const p1 = clean(`City Property Services currently lists ${n} ${n === 1 ? single.toLowerCase() : plural} ${forLower} in ${loc.name}, Ahmedabad.${priceSentence}${sizeSentence}${bldg}`);
  const context = [firstSentences(loc.description, 2), loc.connectivity?.length ? `The area is reached via ${list(loc.connectivity.slice(0, 3))}.` : ''].filter(Boolean).join(' ');
  const intro = [p1, clean(context)].filter(Boolean);

  // ── FAQ (only questions the data can answer) ──
  const faq: { q: string; a: string }[] = [];
  if (stats.priceRange) {
    faq.push({
      q: `How much does ${article(single)} ${single.toLowerCase()} cost to ${verb} in ${loc.name}?`,
      a: clean(`Current asking prices for ${plural} ${forLower} in ${loc.name} run from ${stats.priceRange} across ${stats.priced} priced listing${stats.priced === 1 ? '' : 's'}${stats.typicalUnitPrice ? `; the typical rate is ${stats.typicalUnitPrice}` : ''}.${stats.priced < n ? ` ${n - stats.priced} further listing${n - stats.priced === 1 ? ' is' : 's are'} priced on request.` : ''}`),
    });
  }
  if (stats.sizeRange) {
    faq.push({
      q: `What sizes of ${plural} are available ${forLower} in ${loc.name}?`,
      a: clean(`The ${n} listing${n === 1 ? '' : 's'} on this page range from ${stats.sizeRange}${stats.sizeMinSqft && stats.sizeMaxSqft && stats.sizeMinSqft !== stats.sizeMaxSqft ? `, so there are options for both compact and larger requirements` : ''}.`),
    });
  }
  if (stats.buildings.length) {
    faq.push({
      q: `Which buildings in ${loc.name} have ${plural} ${forLower}?`,
      a: clean(`Listings on this page are in ${stats.buildings.length > 8 ? `${stats.buildings.slice(0, 8).join(', ')} and ${stats.buildings.length - 8} other buildings` : list(stats.buildings)}. Availability changes, so contact us for the latest.`),
    });
  }
  faq.push({
    q: `How many ${plural} are listed ${forLower} in ${loc.name} right now?`,
    a: clean(`${n} ${n === 1 ? 'listing is' : 'listings are'} live${stats.withPhotos ? `, ${stats.withPhotos} with photos` : ''}${stats.newest ? `; the most recent was added on ${new Date(stats.newest).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}. Every listing is handled directly by City Property Services.`),
  });
  if (loc.connectivity?.length) {
    faq.push({ q: `How well connected is ${loc.name}?`, a: clean(`${loc.name} is reached via ${list(loc.connectivity.slice(0, 4))}. ${firstSentences(loc.description, 1)}`) });
  }
  const opposite = combos.find((c) => c.locality.id === loc.id && c.typeSlug === combo.typeSlug && c.side !== combo.side);
  if (opposite) {
    const ow = opposite.side === 'buy' ? 'buy' : 'rent';
    faq.push({ q: `Can I also ${ow} ${plural} in ${loc.name}?`, a: `Yes. City Property Services lists ${opposite.listings.length} ${plural} for ${sideWord(opposite.side).toLowerCase()} in ${loc.name}; see ${single} for ${sideWord(opposite.side)} in ${loc.name} at ${site.url}${opposite.path}.` });
  }

  // ── links ──
  const siblingsSameType = nearestSiblings(combo, combos, 6);
  const others = otherTypesHere(combo, combos);
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: combo.side === 'buy' ? 'Buy' : 'Rent', url: `/${combo.side}/` },
    { name: loc.name, url: `/localities/${loc.slug}/` },
    { name: h1, url: combo.path },
  ];

  // ── JSON-LD nodes (Base.astro folds them into the page @graph) ──
  const graph: Record<string, any>[] = [
    {
      '@type': 'CollectionPage',
      '@id': `${url}#page`,
      url,
      name: h1,
      description,
      isPartOf: { '@id': `${site.url}/#website` },
      about: { '@id': `${site.url}/localities/${loc.slug}/#place` },
      mainEntity: { '@id': `${url}#list` },
      ...(stats.newest ? { dateModified: stats.newest } : {}),
    },
    {
      '@type': 'ItemList',
      '@id': `${url}#list`,
      name: h1,
      numberOfItems: n,
      itemListOrder: 'https://schema.org/ItemListUnordered',
      itemListElement: combo.listings.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${site.url}/property/${p.slug}/`,
        item: { '@id': `${site.url}/property/${p.slug}/#listing` },
      })),
    },
    {
      '@type': 'Place',
      '@id': `${site.url}/localities/${loc.slug}/#place`,
      name: `${loc.name}, ${loc.city}`,
      url: `${site.url}/localities/${loc.slug}/`,
      address: { '@type': 'PostalAddress', addressLocality: loc.name, addressRegion: 'Gujarat', addressCountry: 'IN' },
      ...(loc.latitude != null ? { geo: { '@type': 'GeoCoordinates', latitude: loc.latitude, longitude: loc.longitude } } : {}),
    },
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];

  return { h1, title, description, intro, stats, faq, siblingsSameType, otherTypesHere: others, breadcrumbs, graph };
}

// Memoised per input array (getProperties() returns the same cached array).
const comboCache = new WeakMap<Property[], PropertyCombo[]>();
export function landingCombos(all: Property[]): PropertyCombo[] {
  if (!comboCache.has(all)) comboCache.set(all, pageCombos(all));
  return comboCache.get(all)!;
}
export const comboLabel = (c: PropertyCombo) => `${TYPE_SLUG_LABEL[c.typeSlug][0]} for ${sideWord(c.side)} in ${c.locality.name}`;
