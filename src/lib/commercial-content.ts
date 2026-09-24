// Page copy, meta and JSON-LD for the commercial project pages
// (/projects/ and /projects/{slug}/). Everything here is composed from the
// facts in src/content/projects/commercial/*.json — nothing is asserted that
// the intake form did not state.
import { site } from './config';
import { localities } from '../data/localities';
import {
  allProjects, commercialProjects, residentialProjects, commercialPath, isReady,
  possessionLabel, rate, rateFloor, rateLine, sizeRange, useSummary, type CommercialProject,
} from './commercial-projects';

const ORG_ID = `${site.url}/#organization`;
const PROJECTS_URL = '/projects/';
const clean = (s: string) => s.replace(/\s+/g, ' ').replace(/\s+([,.;])/g, '$1').trim();
const list = (a: string[]) => (a.length <= 1 ? a[0] ?? '' : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);
const localityOf = (p: CommercialProject) => localities.find((l) => l.id === p.localitySlug);

/** A commercial-appropriate line about the area: roads and landmarks, not "premium apartments". */
function localitySentence(p: CommercialProject, loc: ReturnType<typeof localityOf>): string {
  if (!loc) return '';
  const roads = loc.connectivity?.filter((r) => !/ring road/i.test(r)) ?? [];
  const marks = loc.landmarks ?? [];
  if (roads.length) return `${p.localityName} is served by ${list(roads)}${marks.length ? `, with ${list(marks.slice(0, 2))} close by` : ''}.`;
  if (marks.length) return `${p.localityName} sits close to ${list(marks.slice(0, 2))}.`;
  return '';
}

/** The one line that must sit under every price on the site. */
export function rateDisclaimer(asOf: string): string {
  const d = new Date(asOf).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  return `Rates are per sq ft as quoted by the developer's sales team on ${d} and are indicative. Confirm the current rate, the area basis it applies to and what the package covers with us before you commit.`;
}

export interface ProjectContent {
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  overview: string[];
  /** The headline strip under the h1. */
  facts: { k: string; v: string }[];
  /** The full specification table. */
  specs: { k: string; v: string }[];
  faq: { q: string; a: string }[];
  breadcrumbs: { name: string; url: string }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  graph: Record<string, any>[];
}

export function projectContent(p: CommercialProject): ProjectContent {
  const url = `${site.url}${commercialPath(p)}`;
  const loc = localityOf(p);
  const size = sizeRange(p);
  const uses = useSummary(p);
  const poss = possessionLabel(p);
  const ready = isReady(p);
  const h1 = `${p.name}, ${p.localityName}`;
  const resi = p.category === 'residential';
  // "G+12 and G+1 for retail" reads badly mid-sentence; the table carries the detail.
  const floorsShort = (p.floors || '').split(/\s+and\s+/i)[0];

  // Must not collide with the source listing's title, which is
  // "<name>, Ambli: <configurations> Flats" — hence "Homes", and the em-dash form first.
  const titles = resi ? [
    `${p.name} — ${p.configurations} in ${p.localityName}, Ahmedabad`,
    `${p.name}, ${p.localityName}: ${p.configurations} Homes`,
    `${p.name}, ${p.localityName}, Ahmedabad`,
  ] : [
    `${p.name}, ${p.localityName}: ${uses} in Ahmedabad`,
    `${p.name} — ${uses} for Sale in ${p.localityName}, Ahmedabad`,
    `${p.name}, ${p.localityName}, Ahmedabad`,
  ];
  const title = titles.find((t) => t.length <= 60) ?? titles[2];

  const descs = resi ? [
    clean(`${p.name} is ${/ready/i.test(p.status) ? 'a ready-to-move' : 'an under-construction'} residential project${p.developer ? ` by ${p.developer}` : ''} in ${p.localityName}, Ahmedabad, offering ${p.configurations} homes. ${rateLine(p)}. Possession ${possessionLabel(p).toLowerCase()}.`),
    clean(`${p.name}, ${p.localityName}: ${p.configurations} homes${p.developer ? ` by ${p.developer}` : ''}. ${rateLine(p)}. ${possessionLabel(p)}.`),
    clean(`${p.name}, ${p.localityName}, Ahmedabad — ${p.configurations} homes, ${rateLine(p).toLowerCase()}.`),
  ] : [
    clean(`${p.name} by ${p.developer}: ${p.floors} ${uses.toLowerCase()} at ${p.localityName}, Ahmedabad. ${size ? `Carpet ${size}. ` : ''}${rateLine(p)}. ${ready ? 'Ready to move in.' : `Possession ${poss}.`}`),
    clean(`${p.name}, ${p.localityName}: ${uses.toLowerCase()} by ${p.developer}, ${p.floors}${size ? `, carpet ${size}` : ''}. ${rateLine(p)}. ${ready ? 'Ready to move in.' : `Possession ${poss}.`}`),
    clean(`${p.name} by ${p.developer} at ${p.localityName}, Ahmedabad — ${p.floors} ${uses.toLowerCase()}, ${rateLine(p).toLowerCase()}, ${ready ? 'ready to move in' : `possession ${poss}`}.`),
  ];
  // Where the rate line is long (two uses, five-digit retail rates) every variant
  // above blows the 160-char meta limit, so drop the rates and keep the facts.
  descs.push(clean(`${p.name}, ${p.localityName}: ${uses.toLowerCase()} by ${p.developer}. ${floorsShort}${size ? `, carpet ${size}` : ''}. ${ready ? 'Ready to move in.' : `Possession ${poss}.`}`));
  const fits = descs.filter((d) => d.length <= 158);
  const description = fits.length
    ? fits.reduce((a, b) => (b.length > a.length ? b : a))
    : descs.reduce((a, b) => (b.length < a.length ? b : a)).slice(0, 157).replace(/[\s,;·—-]+\S*$/, '') + '…';

  // --- overview prose ----------------------------------------------------
  // "SHOWROOM - 9, CORPORATE HOUSE - 2, OFFICES - 99" → "9 showrooms, 2 corporate
  // houses and 99 offices". A bare number stays a plain unit count.
  const unitLine = (() => {
    if (!p.totalUnits) return '';
    if (/^\d+$/.test(p.totalUnits.trim())) return `It holds ${p.totalUnits} units in all.`;
    const parts = p.totalUnits.split(/[;,]/).map((s) => s.trim()).filter(Boolean)
      .map((s) => {
        const m = s.match(/^(.*?)\s*[-–]?\s*(\d+)$/);
        if (!m) return s.toLowerCase();
        const n = Number(m[2]);
        const noun = m[1].toLowerCase().trim().replace(/s$/, '');
        return `${n} ${n === 1 ? noun : noun.endsWith('house') ? `${noun}s` : `${noun}s`}`;
      });
    return parts.length ? `It is planned as ${list(parts)}.` : '';
  })();

  // One clause per distinct use, with the floors it spans — not one clause per row.
  const stack = (() => {
    const used = p.floorMix.filter((f) => f.use && !/basement|transfer|service/i.test(f.use));
    const order: string[] = [];
    const spans = new Map<string, string[]>();
    for (const f of used) {
      const key = f.use!.replace(/\s*\(continued\)\s*/i, '').trim().toLowerCase();
      if (!spans.has(key)) { spans.set(key, []); order.push(key); }
      spans.get(key)!.push(f.floor);
    }
    if (!order.length) return '';
    // "Ground" / "5 & 6" / "12 to 20" / "28th to 32nd" → the bare endpoints.
    const bare = (s: string) => s.replace(/(\d+)(?:st|nd|rd|th)/gi, '$1').replace(/\s*\(.*?\)\s*/g, '').trim();
    const ends = (s: string) => bare(s).split(/\s*(?:to|&|and)\s*/i).filter(Boolean);
    const phrase = (floors: string[]) => {
      const first = ends(floors[0])[0];
      const last = ends(floors[floors.length - 1]).pop()!;
      if (first === last) return first.toLowerCase() === 'ground' ? 'the ground floor' : `floor ${first}`;
      return first.toLowerCase() === 'ground' ? `the ground floor to floor ${last}` : `floors ${first} to ${last}`;
    };
    return `${list(order.map((k) => `${k} on ${phrase(spans.get(k)!)}`)).replace(/^./, (ch) => ch.toUpperCase())}.`;
  })();

  const overview = resi ? [
    ...(p.description ?? []).map(clean),
    clean(`${localitySentence(p, loc)} ${p.photos.length ? '' : ''}`),
    clean(`City Property Services advises buyers on ${p.name}. We are an independent property consultant registered with Gujarat RERA (${site.rera})${p.developer ? `; the developer is ${p.developer} and we are not affiliated with them` : ''}. No RERA registration number is on file for this project yet — ask us for the certificate before you book, and verify it yourself on the Gujarat RERA portal.`),
  ].filter((x) => x.length > 30) : [
    clean(`${p.name} is a ${floorsShort} ${uses.toLowerCase()} development by ${p.developer} on ${p.address.replace(/^Near /, 'a site near ')}. ${p.landArea ? `It sits on ${p.landArea}. ` : ''}${unitLine} ${p.basements ? `There ${p.basements === 1 ? 'is one basement level' : `are ${p.basements} basement levels`} of parking${p.lifts ? ` and ${p.lifts} lifts serve the building` : ''}.` : p.lifts ? `${p.lifts} lifts serve the building.` : ''}`),
    clean(`${stack} ${size ? `Carpet areas across the building run ${size}; the super built-up figures in the floor table are the ones rates are usually quoted against, so check which basis a quote uses.` : ''}`),
    clean(`${ready ? `The building is ready to move in${p.rera ? `, registered with Gujarat RERA as ${p.rera}` : ''}.` : `Construction is under way with possession indicated for ${poss}${p.rera ? `, under Gujarat RERA registration ${p.rera}` : ''}.`} ${localitySentence(p, loc)}`),
    clean(`City Property Services advises buyers and tenants on ${p.name}. We are an independent property consultant registered with Gujarat RERA (${site.rera}); the developer is ${p.developer} and we are not affiliated with them. We confirm every rate, the area basis and the RERA certificate with the developer before you commit.`),
  ].filter((s) => s.length > 40);

  // --- fact strip and spec table ----------------------------------------
  const facts = resi ? [
    { k: 'Configurations', v: p.configurations ?? '—' },
    { k: 'Price', v: rateLine(p) },
    ...(p.developer ? [{ k: 'Developer', v: p.developer }] : []),
    { k: ready ? 'Status' : 'Possession', v: ready ? 'Ready to move in' : poss },
  ] : [
    { k: 'Use', v: uses },
    ...(p.floors ? [{ k: 'Floors', v: p.floors }] : []),
    ...(size ? [{ k: 'Carpet area', v: size }] : []),
    { k: ready ? 'Status' : 'Possession', v: ready ? 'Ready to move in' : poss },
  ];

  const specs: { k: string; v: string }[] = [
    ...(p.developer ? [{ k: 'Developer', v: p.developer }] : []),
    { k: 'Address', v: `${p.address}` },
    ...(resi ? [{ k: 'Configurations', v: p.configurations ?? '—' }, { k: 'Price', v: rateLine(p) }]
             : [{ k: 'Use', v: `${uses} (${p.projectTypeLabel.toLowerCase()})` }]),
    { k: 'Status', v: p.status },
    ...(ready ? [] : [{ k: 'Possession', v: poss }]),
    ...(p.floors ? [{ k: 'Floors', v: p.floors }] : []),
    ...(p.totalUnits ? [{ k: 'Total units', v: p.totalUnits }] : []),
    ...(p.landArea ? [{ k: 'Land area', v: p.landArea }] : []),
    ...(p.basements ? [{ k: 'Basement levels', v: String(p.basements) }] : []),
    ...(p.lifts ? [{ k: 'Lifts', v: String(p.lifts) }] : []),
    ...(size ? [{ k: 'Carpet area range', v: size }] : []),
    ...(p.rera ? [{ k: 'Gujarat RERA', v: p.rera }] : []),
  ];

  // --- FAQ ---------------------------------------------------------------
  const faq: { q: string; a: string }[] = [
    {
      q: resi ? `What do homes cost at ${p.name}?` : `What is the price at ${p.name}?`,
      a: clean(`${rateLine(p)}${p.pricing.extraCharges ? `, plus ${p.pricing.extraCharges.charAt(0).toLowerCase()}${p.pricing.extraCharges.slice(1)}` : ''}${p.pricing.floorRise ? `. Floor rise is ${p.pricing.floorRise.charAt(0).toLowerCase()}${p.pricing.floorRise.slice(1)}` : ''}. ${rateDisclaimer(p.priceAsOf)}`),
    },
    {
      q: `When is possession at ${p.name}?`,
      a: ready
        ? clean(`${p.name} is ready to move in. ${p.rera ? `It is registered with Gujarat RERA as ${p.rera}. ` : ''}Call us to arrange a site visit.`)
        : clean(`The developer indicates possession around ${poss}. ${p.rera ? `The Gujarat RERA registration for the project is ${p.rera}; the declared completion date on the RERA portal is the one that governs.` : 'Ask us for the declared completion date on the RERA portal, which is the one that governs.'}`),
    },
    ...(size
      ? [{
          q: `What unit sizes are available at ${p.name}?`,
          a: clean(`Carpet areas run ${size} across the building. ${p.floorMix.filter((f) => f.unitsPerFloor).length ? `The floor table above gives the mix floor by floor, including how many units sit on each level and the super built-up area against each carpet figure.` : ''} Units can often be combined — ask us what is unsold on the floor you want.`),
        }]
      : []),
    {
      q: `Is ${p.name} RERA registered?`,
      a: p.rera
        ? clean(`Yes. The Gujarat RERA registration is ${p.rera}. Always verify it yourself on the Gujarat RERA portal before booking; we will give you the certificate.`)
        : clean(`${p.reraNote ?? 'The registration number for this project has not been confirmed to us yet.'} Ask us for the certificate before you book, and verify it on the Gujarat RERA portal.`),
    },
    {
      q: `Can City Property Services show me ${p.name}?`,
      a: clean(`Yes. We arrange site visits, confirm current availability and rates${p.developer ? ` with ${p.developer}` : ' with the developer'}, and handle the paperwork. We are an independent consultant registered with Gujarat RERA (${site.rera}) — we are not the developer.`),
    },
  ];

  // --- JSON-LD -----------------------------------------------------------
  const placeId = `${url}#project`;
  const DEV_ID = `${url}#developer`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const place: Record<string, any> = {
    '@type': 'Place',
    '@id': placeId,
    name: p.name,
    url,
    description: clean(resi ? `${p.configurations} residential project${p.developer ? ` by ${p.developer}` : ''} at ${p.localityName}, Ahmedabad.` : `${p.floors} ${uses.toLowerCase()} development by ${p.developer} at ${p.localityName}, Ahmedabad.`),
    address: { '@type': 'PostalAddress', streetAddress: p.address, addressLocality: 'Ahmedabad', addressRegion: 'Gujarat', addressCountry: 'IN' },
    ...(p.geo ? { geo: { '@type': 'GeoCoordinates', latitude: p.geo.lat, longitude: p.geo.lng } } : {}),
    containedInPlace: { '@type': 'City', name: 'Ahmedabad' },
    ...(p.photos.length ? { photo: p.photos.map((u) => `${site.url}${u}`) } : {}),
    amenityFeature: p.amenities.map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
    additionalProperty: [
      ...(p.floors ? [{ '@type': 'PropertyValue', name: 'Floors', value: p.floors }] : []),
      ...(p.configurations ? [{ '@type': 'PropertyValue', name: 'Configurations', value: p.configurations }] : []),
      ...(p.totalUnits ? [{ '@type': 'PropertyValue', name: 'Total units', value: p.totalUnits }] : []),
      ...(p.landArea ? [{ '@type': 'PropertyValue', name: 'Land area', value: p.landArea }] : []),
      ...(p.basements ? [{ '@type': 'PropertyValue', name: 'Basement levels', value: String(p.basements) }] : []),
      ...(p.rera ? [{ '@type': 'PropertyValue', name: 'Gujarat RERA registration', value: p.rera }] : []),
    ],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graph: Record<string, any>[] = [
    place,
    { '@type': 'WebPage', '@id': `${url}#page`, url, name: h1, description, isPartOf: { '@id': `${site.url}/#website` }, about: { '@id': placeId }, provider: { '@id': ORG_ID } },
    ...(p.developer ? [{ '@type': 'Organization', '@id': DEV_ID, name: p.developer, description: `Developer of ${p.name}. Not affiliated with City Property Services.` }] : []),
    { '@type': 'FAQPage', '@id': `${url}#faq`, mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ];

  return {
    title, description, h1,
    eyebrow: `${p.developer ? `${p.developer} · ` : ''}${p.localityName}, Ahmedabad${p.rera ? ` · Gujarat RERA ${p.rera}` : ''}`,
    overview, facts, specs, faq,
    breadcrumbs: [
      { name: 'Home', url: `${site.url}/` },
      { name: 'Projects', url: `${site.url}${PROJECTS_URL}` },
      { name: p.name, url },
    ],
    graph,
  };
}

export interface IndexContent {
  title: string;
  description: string;
  h1: string;
  intro: string[];
  faq: { q: string; a: string }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  graph: Record<string, any>[];
}

/** Copy and schema for the /projects/ index. */
export function indexContent(): IndexContent {
  const url = `${site.url}${PROJECTS_URL}`;
  const all = commercialProjects;
  const ready = all.filter(isReady);
  const areas = [...new Set(all.map((p) => p.localityName))].sort();
  const rated = all.map(rateFloor).filter((n): n is number => typeof n === 'number');
  const lo = Math.min(...rated);

  const h1 = 'New commercial projects in Ahmedabad';
  const title = 'New Commercial Projects in Ahmedabad';
  const description = clean(`${all.length} new office and retail projects in west Ahmedabad — ${list(areas.slice(0, 4))} — compared on floor plan, carpet area, rate per sq ft, RERA and possession. Rates from ${rate(lo)} per sq ft.`).slice(0, 158);

  const intro = [
    clean(`City Property Services tracks new commercial buildings across west Ahmedabad. These are the ${all.length} projects we are currently advising on: ${list(areas)}. Each page gives the same thing — the floor-by-floor plan with carpet and super built-up areas, the rate card including package and floor-rise charges, the amenity list, the RERA registration and the possession date.`),
    clean(`${ready.length ? `${ready.length === 1 ? 'One' : ready.length} of the ${all.length} ${ready.length === 1 ? 'is' : 'are'} ready to move in — ${list(ready.map((p) => p.name))} — and the rest are under construction.` : 'All of these are under construction.'} Rates come from each developer's sales team and are dated on the page. They move, and what a package covers differs from building to building, so treat them as a starting point and let us confirm before you commit.`),
    clean(`We are an independent property consultant registered with Gujarat RERA (${site.rera}). We are not the developer of any project listed here. We advise on the floor and the unit rather than the building, negotiate on your behalf, and handle the paperwork.`),
  ];

  const faq = [
    {
      q: 'What is the difference between carpet area and super built-up area?',
      a: 'Carpet area is the usable floor area inside your walls — the figure RERA requires. Super built-up area adds your share of lobbies, staircases, lifts and common services. In these buildings the super built-up figure is typically 1.8 to 2.2 times the carpet area, and most Ahmedabad developers quote their per-sq-ft rate against super built-up, not carpet. Always ask which basis a quote uses before you compare two buildings.',
    },
    {
      q: 'What is a down-payment rate?',
      a: 'Developers here usually quote two rates. The regular or construction-linked rate is paid in instalments tied to construction milestones. The down-payment rate is lower and is paid up front, or close to it, within a short window. Which one applies changes the total materially, so the tables on each project page show both wherever the developer quotes both.',
    },
    {
      q: 'What are package and floor-rise charges?',
      a: 'The package charge is a per-sq-ft amount on top of the basic rate covering items like maintenance deposits, AUDA and electricity connection charges and common-area fit-out — what it includes varies by builder. Floor rise is a per-sq-ft premium for higher floors. Parking, legal fees, GST and stamp duty are usually extra again. Each project page lists what the developer told us.',
    },
    {
      q: 'Do you charge buyers a fee?',
      a: 'We are paid by the developer on a completed transaction in most cases. Where that is not so we will tell you before you see anything. Either way our advice on which floor and which building suits your requirement is not tied to a single project — we work across all of them.',
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graph: Record<string, any>[] = [
    { '@type': 'CollectionPage', '@id': `${url}#page`, url, name: h1, description, isPartOf: { '@id': `${site.url}/#website` }, provider: { '@id': ORG_ID }, about: { '@id': `${url}#list` } },
    {
      '@type': 'ItemList',
      '@id': `${url}#list`,
      name: 'New commercial projects in Ahmedabad',
      numberOfItems: all.length,
      itemListOrder: 'https://schema.org/ItemListUnordered',
      itemListElement: all.map((p, i) => ({
        '@type': 'ListItem', position: i + 1, name: p.name,
        url: `${site.url}${commercialPath(p)}`,
        item: { '@id': `${site.url}${commercialPath(p)}#project` },
      })),
    },
    { '@type': 'FAQPage', '@id': `${url}#faq`, mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ];

  return { title, description, h1, intro, faq, graph };
}
