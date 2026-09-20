// Copy and JSON-LD for the Adani Shantigram hub and project pages.
// Every sentence is composed here from the extracted facts in
// src/content/projects/shantigram/*.json — nothing is lifted from brochures.
// Tone: property consultant stating facts; no claims the data can't support.
import { site } from './config';
import {
  HUB_PATH, configSummary, hasPublishedPrice, inrShort, isReady, priceBand, priceCeiling, priceFloor,
  projectPath, projects, sizeRange, township, typeLabel, type Configuration, type Project,
} from './projects';
import { getLocalityById } from '../data/localities';

const clean = (s: string) => s.replace(/\s+/g, ' ').replace(/\s+([,.;:])/g, '$1').trim();
const list = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const cutAtWord = (s: string, max: number) => (s.length <= max ? s : s.slice(0, max + 1).replace(/\s+\S*$/, '').replace(/[\s,.;:·(-]+$/, ''));
const DEV_ID = `${site.url}/#adani-realty`;
const TOWNSHIP_ID = `${site.url}${HUB_PATH}#township`;
const ORG_ID = `${site.url}/#organization`;
const hubUrl = `${site.url}${HUB_PATH}`;
const shantigramLoc = getLocalityById('shantigram');

/** Standard consultant disclaimer used under every price. */
export const priceDisclaimer = (asOf: string) =>
  `Prices are the developer's all-inclusive quotes as of ${asOf} and change without notice. City Property Services is an independent RERA-registered consultant, not the developer; confirm the current quote and the RERA certificate before committing.`;

// ─────────────────────────────────────────────────────────────────────────
// Township hub
// ─────────────────────────────────────────────────────────────────────────
export interface HubRow { p: Project; type: string; configs: string; size: string; price: string; possession: string; status: string }
export interface HubContent {
  h1: string; title: string; description: string;
  intro: string[];
  rows: HubRow[];
  amenityGroups: { title: string; items: string[] }[];
  distances: { to: string; km: number }[];
  faq: { q: string; a: string }[];
  breadcrumbs: { name: string; url: string }[];
  graph: Record<string, any>[];
}

export function hubContent(): HubContent {
  const T = township;
  const ready = projects.filter(isReady);
  const priced = projects.filter(hasPublishedPrice);
  const floors = priced.map((p) => priceFloor(p)!);
  const lowest = Math.min(...floors), highest = Math.max(...priced.map((p) => priceCeiling(p) ?? priceFloor(p)!));
  const cheapest = priced.find((p) => priceFloor(p) === lowest)!;
  const dearest = priced.find((p) => (priceCeiling(p) ?? priceFloor(p)) === highest)!;
  const apartments = projects.filter((p) => p.projectType === 'apartment');
  const villas = projects.filter((p) => p.projectType === 'villa');
  const plots = projects.filter((p) => p.projectType === 'plotted');
  const sg = T.distancesFromZeroCircle.find((d) => d.to.startsWith('Vaishnodevi'));

  const h1 = 'Adani Shantigram, Ahmedabad';
  const title = `Adani Shantigram, Ahmedabad: ${projects.length} Projects Compared`;
  const descVariants = [
    `Adani Shantigram township, SG Highway, Ahmedabad: ${projects.length} current projects compared by configuration, size, developer price (Jul 2026) and possession, ${inrShort(lowest)} to ${inrShort(highest)}.`,
    `Adani Shantigram, Ahmedabad: ${projects.length} current projects compared by configuration, size, price (as of Jul 2026) and possession, from ${inrShort(lowest)} to ${inrShort(highest)}.`,
    `Adani Shantigram, Ahmedabad: ${projects.length} projects compared by configuration, size, price and possession, ${inrShort(lowest)} to ${inrShort(highest)}.`,
  ].map(clean);
  const description = descVariants.find((v) => v.length >= 140 && v.length <= 155) ?? descVariants[2];

  const intro = [
    clean(`Adani Shantigram is an integrated township developed by ${T.developer}. It sits at Vaishnodevi Circle on the SG Highway, on the corridor that links Ahmedabad to Gandhinagar. The developer's own overview puts it at ${T.landArea}; some project brochures round that to roughly 600 acres. It is planned in ${T.zones.length} zones — ${list(T.zones.map((z) => z.toLowerCase()))} — and holds ${T.certification.replace('IGBC Certified ', 'IGBC ').replace(' township', '')} certification as a township.`),
    clean(`Within the boundary sit ${T.golf.club} (a ${T.golf.clubArea.replace(' acres', '-acre')} club with a ${T.golf.holes}-hole course and a ${T.golf.promenade}), ${T.lake}, ${list(T.education.map((e) => e.toLowerCase() === 'preschool' ? 'a preschool' : e))}, and a commercial zone that includes ${list(T.commercial.slice(0, 3))}. The township has its own sub post office and PIN code, and ${T.nature[0]} across its parks and canal-side stretches.`),
    clean(`For buyers the practical picture is this: ${projects.length} residential projects are currently selling, ${apartments.length} of them apartment developments, ${villas.length} villa scheme${villas.length === 1 ? '' : 's'} and ${plots.length} plotted scheme${plots.length === 1 ? '' : 's'}. ${ready.length} ${ready.length === 1 ? 'is' : 'are'} ready to move in (${list(ready.map((p) => p.name))}); the rest are under construction with possession windows from about a year out to ${projects.find((p) => p.slug === 'the-storeys-infinity')?.possession.replace(' per the RERA declaration', '') ?? 'several years'}. Published pricing runs from ${inrShort(lowest)} for a one-bedroom home at ${cheapest.name} to ${inrShort(highest)} for a six-bedroom duplex at ${dearest.name}; ${projects.length - priced.length} projects (${list(projects.filter((p) => !hasPublishedPrice(p)).map((p) => p.name))}) quote on request only.`),
    clean(`City Property Services advises buyers across every project in the township, on resale in the ${T.completedClusters.split(' ')[0]} completed clusters as well as on new bookings. We are an independent, RERA-registered consultant (${site.rera}); the developer of every project here is ${T.developer}${projects.some((p) => p.partner) ? ', in some cases with a named development partner' : ''}. Figures below are as stated in the developer's July 2026 fact sheets and configuration sheets, and every price should be re-confirmed at the time of booking.`),
  ];

  const rows: HubRow[] = projects.map((p) => ({
    p,
    type: typeLabel(p),
    configs: configSummary(p),
    size: sizeRange(p) ?? '—',
    price: priceBand(p),
    possession: p.possession.replace(' (from July 2026)', ''),
    status: p.status,
  }));

  const amenityGroups = [
    { title: 'Golf, lake and open space', items: [`${T.golf.club}: ${T.golf.clubArea}, ${T.golf.holes}-hole course`, `Golf promenade: ${T.golf.promenade}`, T.lake, ...T.nature] },
    { title: 'Education and healthcare', items: [...T.education, ...T.healthcare] },
    { title: 'Retail, dining and daily needs', items: T.retail },
    { title: 'Work', items: T.commercial },
    { title: 'Sport and community', items: [...T.sport, ...T.worship] },
    { title: 'Infrastructure and utilities', items: T.infrastructure },
    { title: 'Getting around', items: [...T.transport, ...T.safety] },
  ];

  // ── FAQ (answered from data) ──
  const faq: { q: string; a: string }[] = [
    { q: 'Which projects are currently selling in Adani Shantigram?', a: clean(`${projects.length} projects: ${list(projects.map((p) => p.name))}. ${apartments.length} are apartment developments; ${list(villas.map((p) => p.name))} ${villas.length === 1 ? 'is' : 'are'} villas and ${list(plots.map((p) => p.name))} ${plots.length === 1 ? 'is' : 'are'} plots. Each has its own page on this site with configurations, prices and RERA details.`) },
    { q: 'What do homes in Adani Shantigram cost?', a: clean(`Published all-inclusive prices as of July 2026 run from ${inrShort(lowest)} (${cheapest.name}, ${cheapest.configurations[0].label}) to ${inrShort(highest)} (${dearest.name}, 6 BHK duplex). By band: ${list(priced.slice(0, 4).map((p) => `${p.name} ${priceBand(p)}`))} at the entry end; ${list(priced.slice(-3).map((p) => `${p.name} ${priceBand(p)}`))} at the top. ${list(projects.filter((p) => !hasPublishedPrice(p)).map((p) => p.name))} are quoted on request. All figures move without notice and must be confirmed with the developer.`) },
    { q: 'Which Shantigram projects are ready to move in?', a: clean(`${list(ready.map((p) => `${p.name} — ${p.status.toLowerCase().replace(/[()]/g, '')}`))}. ${projects.find((p) => p.slug === 'embrace')?.name} is nearing completion with possession estimated at ${projects.find((p) => p.slug === 'embrace')?.possession.replace(' (from July 2026)', '').toLowerCase()} from July 2026, and ${projects.find((p) => p.slug === 'ambrosia')?.name} is due in ${projects.find((p) => p.slug === 'ambrosia')?.possession}.`) },
    { q: 'Are the projects RERA registered?', a: clean(`Every project on this page carries a Gujarat RERA number in the developer's documents: ${list(projects.map((p) => `${p.name} ${p.rera}`))}. ${projects.find((p) => p.reraNote?.includes('verify'))?.name ?? ''}${projects.some((p) => p.reraNote?.includes('verify')) ? '’s number is recorded with a note to verify it on the portal. ' : ''}Check any number at gujrera.gujarat.gov.in before paying a token; the certificate states the promoter, the sanctioned plan and the declared possession date.`) },
    { q: 'How far is Adani Shantigram from SG Highway, Gandhinagar and the airport?', a: clean(`The township sits at Vaishnodevi Circle on the SG Highway, ${sg?.km ?? 1.5} km from the circle itself measured from the township's Zero Circle. Developer-stated distances from Zero Circle: ${list(T.distancesFromZeroCircle.map((d) => `${d.to} ${d.km} km`))}.`) },
    { q: 'Is Adani Shantigram a good investment?', a: clean(`It depends on the project, the price you pay and your holding period, and no consultant can promise appreciation. What the data supports: this is a single-developer township whose overview lists the golf club, school, university, retail centres and a dedicated power substation as operating, with 11 completed residential clusters already trading on resale, and a wide price ladder from ${inrShort(lowest)} to ${inrShort(highest)}. Under-construction entries carry a 1 to 5 year wait and construction-linked payment plans; ready stock (${list(ready.map((p) => p.name))}) removes delivery risk at a higher entry price. We can show you registered resale transactions in the completed clusters so you can judge the numbers yourself.`) },
    { q: 'Who developed Adani Shantigram and how large is it?', a: clean(`${T.developer}, the real estate arm of the Adani Group, which states ${T.developerCredentials.years} years of operation, ${T.developerCredentials.developedMnSqft} million sq ft delivered and ${T.developerCredentials.underDevelopmentMnSqft} million sq ft under development across ${list(T.developerCredentials.cities)}. The township is ${T.landArea} by the developer's overview (about 600 acres in some brochures) and, by the developer's count, home to ${T.families.split(' (')[0]}.`) },
    { q: 'Which projects have villas or plots rather than apartments?', a: clean(`${list(villas.map((p) => `${p.name} (${p.totalUnits} ${p.structure?.toLowerCase() ?? ''} villas, ${priceBand(p)})`))} and ${list(plots.map((p) => `${p.name} (${p.totalUnits} plots on ${p.landArea}, ${priceBand(p)})`))}. Everything else in the township's current phase is apartments, from 1 BDR senior-living homes at Ikaria to 6 BHK duplexes at Belrosa.`) },
    { q: 'What is the cheapest way into Adani Shantigram?', a: clean(`${cheapest.name}, at ${priceBand(cheapest)} — but note it is ${cheapest.positioning.charAt(0).toLowerCase()}${cheapest.positioning.slice(1)} The lowest-priced under-construction family apartments are at ${priced[1].name} (${priceBand(priced[1])}), followed by ${priced[2].name} and ${priced[3].name}. Resale units in the completed clusters are a further option; ask us for current availability.`) },
    { q: 'What schools, healthcare and shopping are inside the township?', a: clean(`${list(T.education)} for education; ${list(T.healthcare)} for healthcare; ${list(T.retail.slice(0, 3))} for shopping and dining, plus ${T.retail[3].toLowerCase()} and ${T.retail[4].toLowerCase()}.`) },
  ];

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Projects', url: HUB_PATH },
    { name: 'Adani Shantigram', url: HUB_PATH },
  ];

  const graph: Record<string, any>[] = [
    {
      '@type': 'CollectionPage',
      '@id': `${hubUrl}#page`,
      url: hubUrl,
      name: h1,
      description,
      isPartOf: { '@id': `${site.url}/#website` },
      about: { '@id': TOWNSHIP_ID },
      mainEntity: { '@id': `${hubUrl}#list` },
      provider: { '@id': ORG_ID },
    },
    {
      '@type': 'Place',
      '@id': TOWNSHIP_ID,
      name: T.name,
      description: clean(`${T.landArea} integrated township by ${T.developer} at ${T.location}; ${T.certification}.`),
      address: { '@type': 'PostalAddress', streetAddress: 'Vaishnodevi Circle, SG Highway', addressLocality: 'Ahmedabad', addressRegion: 'Gujarat', addressCountry: 'IN' },
      ...(shantigramLoc?.latitude != null ? { geo: { '@type': 'GeoCoordinates', latitude: shantigramLoc.latitude, longitude: shantigramLoc.longitude } } : {}),
      containedInPlace: { '@type': 'City', name: 'Ahmedabad' },
      containsPlace: projects.map((p) => ({ '@id': `${site.url}${projectPath(p)}#project` })),
      amenityFeature: [T.golf.club, T.lake.split(',')[0], ...T.education, ...T.retail.slice(0, 2)].map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
    },
    {
      '@type': 'Organization',
      '@id': DEV_ID,
      name: T.developer,
      description: 'Developer of Adani Shantigram and every project listed on this page. Not affiliated with City Property Services.',
    },
    {
      '@type': 'ItemList',
      '@id': `${hubUrl}#list`,
      name: `Projects in ${T.name}`,
      numberOfItems: projects.length,
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      itemListElement: projects.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name, url: `${site.url}${projectPath(p)}`, item: { '@id': `${site.url}${projectPath(p)}#project` } })),
    },
    {
      '@type': 'FAQPage',
      '@id': `${hubUrl}#faq`,
      mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ];

  return { h1, title, description, intro, rows, amenityGroups, distances: T.distancesFromZeroCircle, faq, breadcrumbs, graph };
}

// ─────────────────────────────────────────────────────────────────────────
// Project pages
// ─────────────────────────────────────────────────────────────────────────
export interface SpecRow { k: string; v: string }
export interface Sibling { p: Project; line: string }
export interface ProjectContent {
  h1: string; title: string; description: string;
  overview: string[];
  specs: SpecRow[];
  configCols: { key: keyof Configuration; label: string }[];
  siblings: { type: string; items: Sibling[] }[];
  faq: { q: string; a: string }[];
  breadcrumbs: { name: string; url: string }[];
  graph: Record<string, any>[];
}

const fmtArea = (v: number | string | undefined, unit = 'sq ft') => (v === undefined ? '—' : typeof v === 'number' ? `${v.toLocaleString('en-IN')} ${unit}` : `${v} ${unit}`);

function siblingLine(p: Project): string {
  const bits = [typeLabel(p).toLowerCase().replace(/s$/, '') + (p.totalUnits ? `s, ${p.totalUnits} units` : 's'), configSummary(p), priceBand(p), p.status.toLowerCase()];
  return bits.filter(Boolean).join(' · ');
}

export function projectContent(p: Project): ProjectContent {
  const url = `${site.url}${projectPath(p)}`;
  const projId = `${url}#project`;
  const lo = priceFloor(p), hi = priceCeiling(p);
  const band = priceBand(p);
  const cfgs = p.configurations.filter((c) => !/retail/i.test(c.label));
  const priced = cfgs.filter((c) => c.priceMin);
  const ready = isReady(p);
  const size = sizeRange(p);
  const others = projects.filter((x) => x.slug !== p.slug);

  const h1 = `${p.name}, Adani Shantigram, Ahmedabad`;
  const title = h1.length <= 60 ? h1 : `${p.name}, Adani Shantigram`;
  const what = p.projectType === 'plotted' ? `${p.totalUnits ? p.totalUnits + ' ' : ''}residential plots` : p.projectType === 'villa' ? `${p.totalUnits ? p.totalUnits + ' ' : ''}${configSummary(p)}s` : `${configSummary(p)} apartments`;
  let description = clean(`${p.name} at Adani Shantigram, Ahmedabad: ${what}, ${band === 'On request' ? 'pricing on request' : `${band} (as of ${p.priceAsOf})`}, ${ready ? 'ready to move' : `possession ${p.possession.replace(' (from July 2026)', '').replace(/^Approximately/, 'approx.')}`}, RERA ${p.rera}.`);
  if (description.length > 155) description = cutAtWord(description, 154) + '.';
  if (description.length < 140) {
    for (const tail of ['Independent advice from City Property Services.', 'Independent CPS advice, not the developer.', 'Advice from City Property Services, independently.', 'Advice from City Property Services.', 'Independent advice here.', 'Independent advice.', 'Ask CPS today.', 'Via CPS.']) {
      const next = clean(`${description} ${tail}`);
      if (140 <= next.length && next.length <= 155) { description = next; break; }
    }
  }

  // ── overview (facts, our words) ──
  const o: string[] = [];
  const who = `${p.developer}${p.partner ? ` with ${p.partner}` : ''}`;
  const scale = [
    p.towers ? `${p.towers} tower${p.towers === 1 ? '' : 's'}` : '',
    p.floors ? `${p.floors} floors` : '',
    p.totalUnits ? `${p.totalUnits} ${p.projectType === 'plotted' ? 'plots' : p.projectType === 'villa' ? 'villas' : 'homes'}${p.unitsNote ? ` (${p.unitsNote.toLowerCase()})` : ''}` : '',
  ].filter(Boolean);
  const onLand = p.landArea ? ` on ${p.landArea}` : '';
  o.push(clean(`${p.name} is ${p.projectType === 'plotted' ? 'a plotted development' : p.projectType === 'villa' ? 'a villa project' : 'an apartment project'} by ${who} inside Adani Shantigram, the ${township.landArea} township at Vaishnodevi Circle on the SG Highway. ${p.positioning} ${scale.length ? `The scheme comprises ${list(scale)}${onLand}.` : ''} Its Gujarat RERA registration is ${p.rera}${p.reraNote ? ` (${p.reraNote.toLowerCase()})` : ''}, and the developer describes its status as "${p.status.toLowerCase()}"${ready ? '' : `, with possession stated as ${p.possession.replace(' (from July 2026)', '').toLowerCase()} as of July 2026`}.`));
  if (priced.length) {
    o.push(clean(`Configurations on offer are ${list(cfgs.map((c) => c.label))}. ${priced.length === cfgs.length ? 'All' : `${priced.length} of ${cfgs.length}`} carry a published all-inclusive price: ${list(priced.map((c) => `${c.label} at ${c.priceDisplay}${c.superBuiltUpSqft ? ` for ${fmtArea(c.superBuiltUpSqft)} super built-up` : c.plotSqYd ? ` for a ${c.plotSqYd} sq yd plot` : ''}`))}. ${cfgs.some((c) => c.carpetSqft) ? `RERA carpet areas run from ${size?.replace(/\s*\(.*\)$/, '') ?? '—'}.` : ''} ${p.priceAsOf ? `These are the developer's quotes as of ${p.priceAsOf}; they are not fixed and the current rate must be confirmed before booking.` : ''}`));
  } else {
    o.push(clean(`Configurations on offer are ${list(cfgs.map((c) => c.label))}${size ? `, with stated areas from ${size}` : ''}. The developer has not published prices for this project; quotes are on request${p.unpublishedPricing ? ', and we will share the developer’s current rate sheet when you enquire' : ''}. ${p.carpetRange ? `Carpet areas are stated only as an overall range of ${p.carpetRange}.` : ''}`));
  }
  if (p.paymentTerms || p.bookingAmount || p.carParking) {
    o.push(clean(`${p.bookingAmount ? `The booking amount is ${p.bookingAmount}` : ''}${p.bookingAmount && p.paymentTerms ? ', and ' : p.paymentTerms ? 'P' : ''}${p.paymentTerms ? `${p.bookingAmount ? 'p' : ''}ayment terms are stated as “${p.paymentTerms.charAt(0).toLowerCase()}${p.paymentTerms.slice(1)}”` : ''}${p.bookingAmount || p.paymentTerms ? '. ' : ''}${p.carParking ? `Car parking is ${p.carParking}.` : ''}`));
  }
  if (p.locationInTownship) o.push(clean(`Within the township: ${p.locationInTownship}`));
  if (p.dataGaps.length) o.push(clean(`What the documents do not state: ${p.dataGaps.filter((g) => !/image-only|not shown publicly/i.test(g)).map((g) => g.replace(/\.$/, '')).join('; ')}. We flag these so you can ask the right questions at the sales office.`));

  // ── specs ──
  const specs: SpecRow[] = [
    { k: 'Developer', v: who },
    ...(p.architect ? [{ k: 'Architect', v: p.architect }] : []),
    { k: 'Project type', v: typeLabel(p) },
    { k: 'Gujarat RERA', v: `${p.rera}${p.reraNote ? ` — ${p.reraNote}` : ''}` },
    { k: 'Status', v: p.status },
    { k: 'Possession', v: p.possession },
    ...(p.towers ? [{ k: 'Towers', v: String(p.towers) }] : []),
    ...(p.floors ? [{ k: 'Floors', v: String(p.floors) }] : []),
    ...(p.towerHeight ? [{ k: 'Tower height', v: p.towerHeight }] : []),
    ...(p.structure ? [{ k: 'Structure', v: p.structure }] : []),
    ...(p.totalUnits ? [{ k: 'Total units', v: `${p.totalUnits}${p.unitsNote ? ` — ${p.unitsNote}` : ''}` }] : []),
    ...(p.retailUnits ? [{ k: 'Retail units', v: String(p.retailUnits) }] : []),
    ...(p.landArea ? [{ k: 'Land area', v: p.landArea }] : []),
    ...(p.carParking ? [{ k: 'Car parking', v: p.carParking }] : []),
    ...(p.bookingAmount ? [{ k: 'Booking amount', v: p.bookingAmount }] : []),
    ...(p.paymentTerms ? [{ k: 'Payment terms', v: p.paymentTerms }] : []),
    { k: 'Prices as of', v: p.priceAsOf },
  ];

  // configuration table columns depend on what this project states
  const configCols: { key: keyof Configuration; label: string }[] = [];
  const has = (k: keyof Configuration) => cfgs.some((c) => c[k] !== undefined);
  if (has('plotSqYd')) configCols.push({ key: 'plotSqYd', label: 'Plot (sq yd)' });
  if (has('plotSqft')) configCols.push({ key: 'plotSqft', label: 'Plot (sq ft)' });
  if (has('builtUpSqft')) configCols.push({ key: 'builtUpSqft', label: 'Built-up (sq ft)' });
  if (has('unitReraSqft')) configCols.push({ key: 'unitReraSqft', label: 'Unit RERA area (sq ft)' });
  if (has('carpetSqft')) configCols.push({ key: 'carpetSqft', label: 'RERA carpet (sq ft)' });
  if (has('balconySqft')) configCols.push({ key: 'balconySqft', label: 'Balcony (sq ft)' });
  if (has('totalSqft')) configCols.push({ key: 'totalSqft', label: 'Carpet + balcony (sq ft)' });
  if (has('superBuiltUpSqft')) configCols.push({ key: 'superBuiltUpSqft', label: 'Super built-up (sq ft)' });
  configCols.push({ key: 'priceDisplay', label: `Price (as of ${p.priceAsOf})` });

  // ── siblings grouped by type ──
  const groups = ['apartment', 'villa', 'plotted', 'row house'] as const;
  const siblings = groups
    .map((t) => ({ type: ({ apartment: 'Apartment projects', villa: 'Villa projects', plotted: 'Plotted schemes', 'row house': 'Row houses' })[t], items: others.filter((x) => x.projectType === t).map((x) => ({ p: x, line: siblingLine(x) })) }))
    .filter((g) => g.items.length);

  // ── FAQ (shapes differ from the hub) ──
  const faq: { q: string; a: string }[] = [];
  faq.push({ q: `What configurations does ${p.name} offer?`, a: clean(`${list(cfgs.map((c) => c.label))}${size ? `, with stated areas from ${size}` : ''}. ${cfgs.some((c) => c.superBuiltUpSqft) ? `Super built-up areas are ${list(cfgs.filter((c) => c.superBuiltUpSqft).map((c) => `${fmtArea(c.superBuiltUpSqft)} for the ${c.label}`))}.` : ''} ${cfgs.some((c) => c.soldOut) ? `The ${cfgs.filter((c) => c.soldOut).map((c) => c.label).join(' and ')} is sold out per the developer's sheet.` : ''}`) });
  faq.push(priced.length
    ? { q: `How much does a home at ${p.name} cost?`, a: clean(`${band} all-inclusive as of ${p.priceAsOf}: ${list(priced.map((c) => `${c.label} ${c.priceDisplay}`))}. ${cfgs.length > priced.length ? `${list(cfgs.filter((c) => !c.priceMin && !c.soldOut).map((c) => c.label))} ${cfgs.filter((c) => !c.priceMin && !c.soldOut).length === 1 ? 'is' : 'are'} not priced in the published sheet. ` : ''}Statutory charges such as GST, stamp duty and registration are additional where applicable; ask us for a line-by-line cost sheet.`) }
    : { q: `How much does a home at ${p.name} cost?`, a: clean(`The developer quotes ${p.name} on request rather than publishing a price list. We will obtain the current rate sheet for the configuration you want and set out the all-inclusive figure, statutory charges and payment schedule before you visit.`) });
  faq.push({ q: `When will ${p.name} be ready for possession?`, a: clean(ready ? `${p.name} is ${p.status.toLowerCase()}. ${p.possession.includes('60 days') ? 'The developer states handover within 60 days of purchase.' : 'Possession follows completion of the sale and registration.'}` : `The developer states possession as ${p.possession.replace(' (from July 2026)', '').toLowerCase()} (as of July 2026) and the status as ${p.status.toLowerCase()}. The RERA certificate carries the legally declared completion date; check it at gujrera.gujarat.gov.in under ${p.rera}.`) });
  faq.push({ q: `Is ${p.name} RERA registered, and who is the promoter?`, a: clean(`Yes — the developer's documents give Gujarat RERA number ${p.rera}${p.reraNote ? ` (${p.reraNote.toLowerCase()})` : ''}. The developer is ${who}. ${p.dataGaps.some((g) => /promoter/i.test(g)) ? 'The documents do not say which entity is the registered promoter; confirm this on the RERA certificate, because it determines who you contract with. ' : ''}City Property Services is an independent consultant and not the promoter of this project.`) });
  if (p.towers || p.totalUnits || p.floors) faq.push({ q: `How big is ${p.name}?`, a: clean(`${scale.length ? `${list(scale.map((s) => s.charAt(0).toUpperCase() + s.slice(1)))}${onLand}.` : ''} ${p.landArea && !scale.length ? `The land parcel is ${p.landArea}.` : ''} ${p.towerHeight ? `The tower rises ${p.towerHeight}.` : ''} ${p.carParking ? `Parking allocation is ${p.carParking}.` : ''}`) });
  faq.push({ q: `What amenities does ${p.name} have?`, a: clean(`${p.amenities.length > 10 ? `${p.amenities.slice(0, 10).join(', ')} and ${p.amenities.length - 10} more listed on this page` : list(p.amenities)}. Residents also use the township-level facilities — ${township.golf.club}, the lake and promenade, schools and retail — which are shared across Adani Shantigram.`) });
  if (p.proposedServices?.length) faq.push({ q: `What services are proposed at ${p.name}?`, a: clean(`The developer lists ${list(p.proposedServices.map((s) => s.toLowerCase()))} as proposed services. "Proposed" means they are planned rather than guaranteed; ask for the operating agreement and charges before relying on them.`) });

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Adani Shantigram', url: HUB_PATH },
    { name: p.name, url: projectPath(p) },
  ];

  // ── graph ──
  const placeType = p.projectType === 'apartment' ? 'ApartmentComplex' : 'Residence';
  const place: Record<string, any> = {
    '@type': placeType,
    '@id': projId,
    name: `${p.name}, Adani Shantigram`,
    description: o[0],
    url,
    address: { '@type': 'PostalAddress', streetAddress: 'Adani Shantigram, Vaishnodevi Circle, SG Highway', addressLocality: 'Ahmedabad', addressRegion: 'Gujarat', addressCountry: 'IN' },
    containedInPlace: { '@id': TOWNSHIP_ID },
    // numberOfAccommodationUnits is defined for ApartmentComplex only; villa and
    // plotted schemes (Residence) carry the count as a PropertyValue instead.
    ...(p.totalUnits ? (placeType === 'ApartmentComplex'
      ? { numberOfAccommodationUnits: p.totalUnits }
      : { additionalProperty: [{ '@type': 'PropertyValue', name: p.projectType === 'plotted' ? 'Number of plots' : 'Number of villas', value: p.totalUnits }] }) : {}),
    ...(p.photos.length ? { image: p.photos.slice(0, 6).map((u) => `${site.url}${u}`) } : {}),
    amenityFeature: p.amenities.map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
  };
  const graph: Record<string, any>[] = [
    { '@type': 'WebPage', '@id': `${url}#page`, url, name: h1, description, isPartOf: { '@id': `${site.url}/#website` }, about: { '@id': projId }, provider: { '@id': ORG_ID } },
    place,
    { '@type': 'Place', '@id': TOWNSHIP_ID, name: township.name, url: hubUrl, address: { '@type': 'PostalAddress', addressLocality: 'Ahmedabad', addressRegion: 'Gujarat', addressCountry: 'IN' } },
    { '@type': 'Organization', '@id': DEV_ID, name: p.developer, description: `Developer of ${p.name}. Not affiliated with City Property Services.` },
  ];
  if (lo !== undefined) {
    graph.push({
      '@type': 'AggregateOffer',
      '@id': `${url}#offers`,
      priceCurrency: 'INR',
      lowPrice: lo,
      ...(hi !== undefined && hi !== lo ? { highPrice: hi } : {}),
      offerCount: priced.length,
      itemOffered: { '@id': projId },
      offeredBy: { '@id': DEV_ID },
      validFrom: '2026-07-01',
      description: `Developer-published all-inclusive prices as of ${p.priceAsOf}; subject to change.`,
    });
  }
  graph.push({ '@type': 'FAQPage', '@id': `${url}#faq`, mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });

  return { h1, title, description, overview: o, specs, configCols, siblings, faq, breadcrumbs, graph };
}
