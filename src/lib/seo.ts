// Property-page SEO: H1, <title>, meta description and the JSON-LD graph.
//
// Titles and descriptions are resolved for ALL listings at once so that
// uniqueness is guaranteed site-wide (scripts/check-seo-meta.mjs fails the
// build otherwise). Stored `seoTitle` / `seoDescription` from the CMS are
// preferred when they are unique and short enough; everything else is
// generated deterministically from the listing fields.
import type { Property } from './types';
import { getLocalityById, type Locality } from '../data/localities';
import { site } from './config';

// ── labels ──────────────────────────────────────────────────────────────
export const TYPE_LABELS: Record<string, string> = {
  apartment: 'Flat', residential: 'Home', villa: 'Villa', bungalow: 'Bungalow', 'row house': 'Row House',
  penthouse: 'Penthouse', office: 'Office Space', commercial: 'Commercial Space', shop: 'Shop',
  showroom: 'Showroom', retail: 'Retail Space', warehouse: 'Warehouse', warehousing: 'Warehouse',
  'industrial shed': 'Industrial Shed', industrial: 'Industrial Space', 'industrial land': 'Industrial Land',
  land: 'Land', plot: 'Plot', 'residential land': 'Residential Plot', 'commercial land': 'Commercial Plot',
  investment: 'Investment Property',
};
export const typeLabel = (p: Property) => TYPE_LABELS[p.propertyType] ?? 'Property';
export const listingWord = (p: Property) =>
  p.status === 'sale' ? 'for Sale' : p.status === 'lease' ? 'for Lease' : 'for Rent';
export const isPriceOnRequest = (p: Property) =>
  !p.priceValue || /price on request/i.test(p.priceDisplay);

/**
 * Building / project name. Titles are authored as
 * "{descriptor} · {Building}, {Locality}" — the tail minus the locality is the
 * building. Warehouse-belt listings ("Warehouse - Aslali (13,200 sq.ft)") and
 * tails that are just the locality have none.
 */
export function buildingName(p: Property): string | undefined {
  const parts = p.title.split(' · ');
  if (parts.length < 2) return undefined;
  let tail = parts.slice(1).join(' · ').trim();
  for (const suffix of [`, ${p.localityName}, Ahmedabad`, `, ${p.localityName}`, ', Ahmedabad']) {
    if (tail.toLowerCase().endsWith(suffix.toLowerCase())) tail = tail.slice(0, -suffix.length).trim();
  }
  if (!tail || tail.toLowerCase() === p.localityName.toLowerCase()) return undefined;
  return tail;
}

/** "2,972 sq.ft" | "4 BHK" | "" */
export function sizeLabel(p: Property): string {
  if (p.area) return p.area.replace(/\s*\(?\s*(super built[- ]?up|built[- ]?up|carpet)\s*\)?\s*$/i, '').trim();
  if (typeof p.beds === 'number' && p.beds > 0) return `${p.beds} BHK`;
  if (typeof p.beds === 'string' && p.beds.trim()) return `${p.beds.trim()} BHK`;
  return '';
}

const clean = (s: string) => s.replace(/\s+/g, ' ').replace(/\s+([,.])/g, '$1').trim();
/** Cut at a word boundary so we never end mid-word. */
function cutAtWord(s: string, max: number): string {
  if (s.length <= max) return s;
  let cut = s.slice(0, max + 1).replace(/\s+\S*$/, '');
  // Never leave an unbalanced "(" fragment behind.
  if ((cut.match(/\(/g) ?? []).length > (cut.match(/\)/g) ?? []).length) cut = cut.slice(0, cut.lastIndexOf('('));
  return cut.replace(/[\s,.;:·(-]+$/, '');
}

// ── H1 ──────────────────────────────────────────────────────────────────
export function propertyH1(p: Property): string {
  const b = buildingName(p);
  const core = clean(`${sizeLabel(p)} ${typeLabel(p)} ${listingWord(p)}`);
  // Segments in priority order; trailing ones are dropped only when > 90 chars.
  const segments = b
    ? [`${b} · ${core}`, ` in ${p.localityName}`, ', Ahmedabad']
    : [`${core} in ${p.localityName}`, ', Ahmedabad'];
  let out = segments.join('');
  while (out.length > 90 && segments.length > 1) { segments.pop(); out = segments.join(''); }
  return out;
}

// ── <title> ─────────────────────────────────────────────────────────────
const TITLE_MAX = 60;
export function generatedTitle(p: Property, max = TITLE_MAX): string {
  const b = buildingName(p);
  const size = sizeLabel(p);
  const core = clean(`${size} ${typeLabel(p)} ${listingWord(p)}`);
  const coreNoSize = clean(`${typeLabel(p)} ${listingWord(p)}`);
  if (!b) {
    const variants = [
      `${core} in ${p.localityName}, Ahmedabad`,
      `${core} in ${p.localityName}`,
      `${coreNoSize} in ${p.localityName}`,
    ];
    return variants.find((v) => v.length <= max) ?? cutAtWord(variants[2], max);
  }
  // Drop from the right: "Ahmedabad", then the area, then truncate the building.
  const v1 = `${b}, ${p.localityName}, Ahmedabad · ${core}`;
  if (v1.length <= max) return v1;
  const v2 = `${b}, ${p.localityName} · ${core}`;
  if (v2.length <= max) return v2;
  const v3 = `${b}, ${p.localityName} · ${coreNoSize}`;
  if (v3.length <= max) return v3;
  const room = max - `, ${p.localityName} · ${coreNoSize}`.length;
  return `${cutAtWord(b, Math.max(room, 8))}, ${p.localityName} · ${coreNoSize}`;
}

// ── meta description ────────────────────────────────────────────────────
const DESC_MAX = 155;
const CTA = 'Contact City Property Services to arrange a viewing.';
function firstSentence(p: Property): string | undefined {
  const para = (p.description ?? []).find((d) => d && d.trim());
  if (para) {
    const s = para.trim().match(/^.*?[.!?](?=\s|$)/)?.[0] ?? para.trim();
    return s.replace(/[.!?]+$/, '');
  }
  const am = (p.amenities ?? []).filter(Boolean).slice(0, 2);
  return am.length ? am.join(', ') : undefined;
}
export function generatedDescription(p: Property): string {
  const b = buildingName(p);
  const lead = b ? `${b} in ${p.localityName}, Ahmedabad.` : `${p.localityName}, Ahmedabad.`;
  const what = clean(`${sizeLabel(p)} ${typeLabel(p)} ${listingWord(p).toLowerCase()}`);
  const priceClause = isPriceOnRequest(p) ? '' : ` at ${p.priceDisplay}${p.pricePer ? ' ' + p.pricePer.replace(/\s*\(.*\)$/, '') : ''}`;
  const offer = `${what}${priceClause}.`;
  const detail = firstSentence(p);
  // Build the longest variant that fits, in preference order.
  const variants = [
    detail && `${lead} ${offer} ${detail}. ${CTA}`,
    `${lead} ${offer} ${CTA}`,
    `${lead} ${offer} Contact City Property Services.`,
    `${lead} ${offer}`,
  ].filter(Boolean) as string[];
  const pick = variants.map(clean).find((v) => v.length <= DESC_MAX);
  return pick ?? cutAtWord(clean(variants[variants.length - 1]), DESC_MAX);
}

// ── site-wide resolution with uniqueness ────────────────────────────────
export interface PropertySeo {
  h1: string;
  title: string;
  description: string;
  titleSource: 'stored' | 'generated' | 'generated+disambiguated';
  descriptionSource: 'stored' | 'stored+extended' | 'generated' | 'generated+disambiguated';
}

// Stored (CMS) values are used only inside these bands; see resolvePropertySeo.
const STORED_TITLE_MIN = 45, STORED_TITLE_MAX = 60;
const STORED_DESC_MIN = 110, DESC_TARGET_MIN = 140;

/**
 * A unique-but-short stored description is extended with generated clauses
 * (price → area → CTA) until it lands in the 140–155 band. Returns undefined
 * when no combination of clauses reaches the band.
 */
function extendDescription(p: Property, stored: string): string | undefined {
  let out = stored.replace(/\s+$/, '');
  if (!/[.!?]$/.test(out)) out += '.';
  const priceClause = !isPriceOnRequest(p)
    ? `Priced at ${p.priceDisplay}${p.pricePer ? ' ' + p.pricePer.replace(/\s*\(.*\)$/, '') : ''}.`
    : undefined;
  const size = sizeLabel(p);
  const areaClause = size && !out.includes(size) ? `${size} ${typeLabel(p).toLowerCase()} ${listingWord(p).toLowerCase()} in ${p.localityName}.` : undefined;
  for (const clause of [priceClause, areaClause, CTA]) {
    if (!clause || out.length >= DESC_TARGET_MIN) continue;
    if (out.includes(clause)) continue;
    const next = clean(`${out} ${clause}`);
    if (next.length <= DESC_MAX) out = next;
  }
  return out.length >= DESC_TARGET_MIN && out.length <= DESC_MAX ? out : undefined;
}

const BRAND_SUFFIX = /\s*\|\s*City Property Services\s*$/i;
const floorTag = (p: Property) => (p.floor ? p.floor.replace(/\bfloor\b/i, '').trim().replace(/^gf$/i, 'Ground') + ' floor' : undefined);

/**
 * Resolve H1/title/description for every listing at once. Stored values win
 * only when unique among all stored values AND not colliding with anything
 * else; generated values that still collide get a disambiguator (floor, then
 * price, then a numeric suffix).
 */
export function resolvePropertySeo(all: Property[]): Map<string, PropertySeo> {
  const count = (xs: (string | undefined)[]) => {
    const m = new Map<string, number>();
    for (const x of xs) if (x) m.set(x, (m.get(x) ?? 0) + 1);
    return m;
  };
  const storedTitle = (p: Property) => (p.seoTitle ?? '').replace(BRAND_SUFFIX, '').trim() || undefined;
  const storedDesc = (p: Property) => (p.seoDescription ?? '').trim() || undefined;
  const stCount = count(all.map(storedTitle));
  const sdCount = count(all.map(storedDesc));

  const assign = (
    field: 'title' | 'description',
    stored: (p: Property) => string | undefined,
    storedCount: Map<string, number>,
    storedOk: (v: string) => boolean,
    gen: (p: Property) => string,
    max: number,
  ) => {
    const out = new Map<string, { value: string; source: PropertySeo['descriptionSource'] }>();
    // pass 1: stored where eligible (unique + inside the length band), else
    // generated. Unique-but-short descriptions are extended into the band.
    for (const p of all) {
      const s = stored(p);
      if (s && storedCount.get(s) === 1) {
        if (storedOk(s)) { out.set(p.slug, { value: s, source: 'stored' }); continue; }
        if (field === 'description' && s.length < STORED_DESC_MIN) {
          const ext = extendDescription(p, s);
          if (ext) { out.set(p.slug, { value: ext, source: 'stored+extended' }); continue; }
        }
      }
      out.set(p.slug, { value: gen(p), source: 'generated' });
    }
    // pass 2..n: resolve collisions
    for (let round = 0; round < 4; round++) {
      const used = count([...out.values()].map((v) => v.value));
      let collisions = 0;
      for (const p of all) {
        const cur = out.get(p.slug)!;
        if (used.get(cur.value)! <= 1) continue;
        collisions++;
        if (cur.source === 'stored' || cur.source === 'stored+extended') { out.set(p.slug, { value: gen(p), source: 'generated' }); continue; }
        // Disambiguate with the most human-meaningful tag not already in the
        // text: floor → price → area → slug number. The base is regenerated
        // with a tighter length budget so segments are dropped, not words cut.
        const base0 = gen(p);
        const tags = [
          floorTag(p),
          !isPriceOnRequest(p) ? p.priceDisplay : undefined,
          sizeLabel(p) || undefined,
          p.slug.match(/\d+/)?.[0],
        ].filter((t): t is string => Boolean(t) && !base0.includes(t!));
        const tag = tags[Math.min(round, tags.length - 1)] ?? p.slug.match(/\d+/)?.[0] ?? String(round + 2);
        const base = field === 'title' ? generatedTitle(p, max - tag.length - 3) : base0;
        let v = field === 'title' ? `${base} · ${tag}` : `${base.replace(/\.$/, '')} · ${tag}.`;
        if (v.length > max) v = `${cutAtWord(base, max - tag.length - 3)} · ${tag}`;
        out.set(p.slug, { value: v, source: 'generated+disambiguated' });
      }
      if (!collisions) break;
    }
    // last resort: numeric suffix
    const used = count([...out.values()].map((v) => v.value));
    const seen = new Map<string, number>();
    for (const p of all) {
      const cur = out.get(p.slug)!;
      if (used.get(cur.value)! <= 1) continue;
      const n = (seen.get(cur.value) ?? 0) + 1; seen.set(cur.value, n);
      if (n > 1) out.set(p.slug, { value: `${cutAtWord(cur.value, max - 4)} (${n})`, source: 'generated+disambiguated' });
    }
    return out;
  };

  const titles = assign('title', storedTitle, stCount, (v) => v.length >= STORED_TITLE_MIN && v.length <= STORED_TITLE_MAX, generatedTitle, 65);
  const descs = assign('description', storedDesc, sdCount, (v) => v.length >= STORED_DESC_MIN && v.length <= DESC_MAX, generatedDescription, 160);

  const res = new Map<string, PropertySeo>();
  for (const p of all) {
    res.set(p.slug, {
      h1: propertyH1(p),
      title: titles.get(p.slug)!.value,
      description: descs.get(p.slug)!.value,
      titleSource: titles.get(p.slug)!.source as PropertySeo['titleSource'],
      descriptionSource: descs.get(p.slug)!.source,
    });
  }
  return res;
}

// ── JSON-LD graph ───────────────────────────────────────────────────────
export const ORG_ID = `${site.url}/#organization`;

const ADDITIONAL_TYPE: Record<string, string> = {
  office: 'https://www.wikidata.org/entity/Q182060',          // office
  commercial: 'https://www.wikidata.org/entity/Q182060',
  showroom: 'https://www.wikidata.org/entity/Q2094773',       // showroom
  shop: 'https://www.wikidata.org/entity/Q213441',            // shop
  retail: 'https://www.wikidata.org/entity/Q213441',
  investment: 'https://www.wikidata.org/entity/Q2094773',     // pre-leased showrooms
  warehouse: 'https://www.wikidata.org/entity/Q181623',       // warehouse
  warehousing: 'https://www.wikidata.org/entity/Q181623',
  industrial: 'https://www.wikidata.org/entity/Q1662011',     // industrial building
  'industrial shed': 'https://www.wikidata.org/entity/Q1662011',
};
function accommodationType(p: Property): { type: string; additionalType?: string } {
  const t = (p.propertyType || '').toLowerCase();
  if (['apartment', 'flat', 'penthouse', 'residential'].includes(t)) return { type: 'Apartment' };
  if (['bungalow', 'villa', 'house', 'row house'].includes(t)) return { type: 'SingleFamilyResidence' };
  if (['plot', 'land', 'residential land', 'commercial land', 'industrial land'].includes(t)) return { type: 'Place' };
  return { type: 'Accommodation', additionalType: ADDITIONAL_TYPE[t] };
}
const isResidential = (p: Property) => ['Apartment', 'SingleFamilyResidence'].includes(accommodationType(p).type);

function floorSize(p: Property) {
  const a = p.area ?? '';
  if (/sq\.?\s*yd/i.test(a)) {
    const n = Number(a.replace(/[^\d.]/g, ''));
    return n ? { '@type': 'QuantitativeValue', value: n, unitCode: 'YDK', unitText: 'sq yd' } : undefined;
  }
  if (p.areaSqft) return { '@type': 'QuantitativeValue', value: p.areaSqft, unitCode: 'FTK', unitText: 'sq ft' };
  return undefined;
}
function floorLevel(p: Property): string | undefined {
  if (!p.floor) return undefined;
  const f = p.floor.trim();
  if (/^(gf|ground)/i.test(f)) return 'Ground';
  const n = f.match(/\d+/)?.[0];
  return n ?? f;
}

/** Parse "₹5.1 to 6.8 Cr" / "₹95 L to 1.2 Cr" into rupees; undefined if not a range. */
function priceRange(display: string): { min: number; max: number } | undefined {
  const m = display.match(/₹?\s*([\d.,]+)\s*(cr|l|lakh)?\s*to\s*([\d.,]+)\s*(cr|l|lakh)?/i);
  if (!m) return undefined;
  const mult = (u?: string) => (/cr/i.test(u ?? '') ? 1e7 : /l/i.test(u ?? '') ? 1e5 : 1);
  const hiUnit = m[4] ?? m[2];
  const loUnit = m[2] ?? m[4];
  const min = Number(m[1].replace(/,/g, '')) * mult(loUnit);
  const max = Number(m[3].replace(/,/g, '')) * mult(hiUnit);
  return min && max ? { min, max } : undefined;
}
/** "₹65 / sq.ft" → 65 */
const perSqftRate = (display: string) => {
  const m = display.match(/₹\s*([\d,.]+)\s*\/\s*sq\.?\s*ft/i);
  return m ? Number(m[1].replace(/,/g, '')) : undefined;
};

export interface GraphOptions { url: string; seo: PropertySeo; breadcrumbs: { name: string; url: string }[] }

/**
 * Page-specific nodes for a property page. Sitewide Organization / WebSite
 * nodes are added by Base.astro; the listing references them by @id.
 */
export function propertyGraph(p: Property, { url, seo, breadcrumbs }: GraphOptions): Record<string, any>[] {
  const abs = (u: string) => new URL(u, site.url).href;
  const loc: Locality | undefined = p.localitySlug ? getLocalityById(p.localitySlug) : undefined;
  const listingId = `${url}#listing`;
  const unitId = `${url}#property`;
  const offerId = `${url}#offer`;
  const placeId = loc ? `${site.url}/localities/${loc.slug}/#place` : undefined;
  const images = (p.photos ?? []).filter((x) => x.url).map((x) => abs(x.url!));
  const { type, additionalType } = accommodationType(p);
  const geo = p.geo ? { '@type': 'GeoCoordinates', latitude: p.geo.lat, longitude: p.geo.lng } : undefined;

  const address: Record<string, string> = {
    '@type': 'PostalAddress',
    addressLocality: p.localityName,
    addressRegion: 'Gujarat',
    addressCountry: 'IN',
  };
  // Only keep the street part of the address (the field usually reads
  // "Building, Road, Locality, Ahmedabad").
  const street = (p.address ?? '')
    .replace(new RegExp(`,?\\s*${p.localityName}\\s*,?`, 'i'), '')
    .replace(/,?\s*Ahmedabad.*$/i, '')
    .replace(/^[,\s]+|[,\s]+$/g, '');
  if (street) address.streetAddress = street;
  const pin = (p.address ?? '').match(/\b38\d{4}\b/)?.[0] ?? (loc?.pincode || undefined);
  if (pin) address.postalCode = pin;

  const unit: Record<string, any> = {
    '@type': type,
    '@id': unitId,
    ...(additionalType ? { additionalType } : {}),
    name: seo.h1,
    address,
    ...(geo ? { geo } : {}),
    ...(placeId ? { containedInPlace: { '@id': placeId } } : {}),
  };
  const fs = floorSize(p);
  if (fs) {
    // Plots are plain Places (no floorSize); expose the area as a PropertyValue.
    if (type === 'Place') unit.additionalProperty = [{ '@type': 'PropertyValue', name: 'Plot area', value: fs.value, unitCode: fs.unitCode, unitText: fs.unitText }];
    else unit.floorSize = fs;
  }
  if (isResidential(p)) {
    if (typeof p.beds === 'number') unit.numberOfRooms = p.beds;
    if (typeof p.baths === 'number') unit.numberOfBathroomsTotal = p.baths;
  }
  const am = (p.amenities ?? []).filter(Boolean);
  if (am.length) unit.amenityFeature = am.map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true }));
  if (p.builtYear && /^\d{4}$/.test(p.builtYear)) unit.yearBuilt = Number(p.builtYear);
  const fl = floorLevel(p);
  if (fl && type !== 'Place') unit.floorLevel = fl;
  if (images.length) unit.image = images;

  const listing: Record<string, any> = {
    '@type': 'RealEstateListing',
    '@id': listingId,
    url,
    mainEntityOfPage: url,
    name: seo.h1,
    description: seo.description,
    ...(p.newAt ? { datePosted: p.newAt } : {}),
    ...(images.length ? { image: images } : {}),
    provider: { '@id': ORG_ID },
    // RealEstateListing is a WebPage, so the locality is its spatialCoverage;
    // containedInPlace lives on the Accommodation/Place node below.
    ...(placeId ? { spatialCoverage: { '@id': placeId } } : {}),
    mainEntity: { '@id': unitId },
    isPartOf: { '@id': `${site.url}/#website` },
  };

  const nodes: Record<string, any>[] = [listing, unit];

  if (placeId && loc) {
    nodes.push({
      '@type': 'Place',
      '@id': placeId,
      name: `${loc.name}, ${loc.city}`,
      url: `${site.url}/localities/${loc.slug}/`,
      address: { '@type': 'PostalAddress', addressLocality: loc.name, addressRegion: 'Gujarat', addressCountry: 'IN', ...(loc.pincode ? { postalCode: loc.pincode } : {}) },
      ...(loc.latitude != null ? { geo: { '@type': 'GeoCoordinates', latitude: loc.latitude, longitude: loc.longitude } } : {}),
      containedInPlace: { '@type': 'City', name: loc.city },
    });
  }

  // ── Offer: price in the markup must be the price shown on the page ──
  if (!isPriceOnRequest(p)) {
    const offer: Record<string, any> = {
      '@type': 'Offer',
      '@id': offerId,
      url,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      itemOffered: { '@id': unitId },
      seller: { '@id': ORG_ID },
      businessFunction: p.status === 'sale'
        ? 'http://purl.org/goodrelations/v1#Sell'
        : 'http://purl.org/goodrelations/v1#LeaseOut',
    };
    const range = priceRange(p.priceDisplay);
    const rate = p.status !== 'sale' ? perSqftRate(p.priceDisplay) : undefined;
    if (p.status === 'sale') {
      if (range) offer.priceSpecification = { '@type': 'PriceSpecification', minPrice: range.min, maxPrice: range.max, priceCurrency: 'INR' };
      else offer.price = p.priceValue;
    } else if (rate) {
      // "₹65 / sq.ft per month": a unit price per 1 sq ft, billed monthly.
      // The derived monthly total is deliberately NOT emitted.
      offer.priceSpecification = {
        '@type': 'UnitPriceSpecification',
        price: rate,
        priceCurrency: 'INR',
        unitCode: 'FTK',
        unitText: `per sq.ft ${p.pricePer ?? 'per month'}`.replace(/\s+/g, ' '),
        referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'FTK' },
        billingDuration: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' },
      };
    } else {
      offer.priceSpecification = {
        '@type': 'UnitPriceSpecification',
        price: p.priceValue,
        priceCurrency: 'INR',
        unitText: p.pricePer ?? 'per month',
        billingDuration: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' },
      };
    }
    nodes.push(offer);
  }

  nodes.push({
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: breadcrumbs.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: b.name,
      item: abs(b.url),
    })),
  });

  return nodes;
}
