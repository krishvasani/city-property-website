/**
 * Generates Sanity NDJSON from the bundled sample content so a new dataset
 * starts populated with the same 12 listings / agents / localities the site
 * ships with. Photos are intentionally omitted (upload real ones in the Studio).
 *
 * Usage:
 *   npx tsx scripts/seed.ts > seed.ndjson
 *   npx sanity dataset import seed.ndjson production --replace
 */
import { properties, localities } from '../src/data/sample';

type Doc = Record<string, unknown>;
const lines: string[] = [];
const emit = (d: Doc) => lines.push(JSON.stringify(d));

const geopoint = (g?: { lat: number; lng: number }) =>
  g ? { _type: 'geopoint', lat: g.lat, lng: g.lng } : undefined;
const slug = (current: string) => ({ _type: 'slug', current });
const isoDate = (d?: string) => (d ? (d.length === 10 ? `${d}T00:00:00Z` : d) : undefined);

for (const l of localities) {
  emit({
    _id: `locality.${l.slug}`,
    _type: 'locality',
    name: l.name,
    slug: slug(l.slug),
    blurb: l.blurb,
    avgPriceDisplay: l.avgPriceDisplay,
    geo: geopoint(l.geo),
    ...(l.mapPos ? { mapPos: { left: l.mapPos.left, top: l.mapPos.top } } : {}),
  });
}

for (const p of properties) {
  emit({
    _id: `property.${p.slug}`,
    _type: 'property',
    title: p.title,
    slug: slug(p.slug),
    status: p.status,
    statusLabel: p.statusLabel,
    propertyType: p.propertyType,
    priceDisplay: p.priceDisplay,
    priceValue: p.priceValue,
    pricePer: p.pricePer,
    ...(p.localitySlug ? { locality: { _type: 'reference', _ref: `locality.${p.localitySlug}` } } : {}),
    address: p.address,
    perSqftDisplay: p.perSqftDisplay,
    featured: !!p.featured,
    beds: p.beds !== undefined ? String(p.beds) : undefined,
    baths: p.baths !== undefined ? String(p.baths) : undefined,
    area: p.area,
    areaSqft: p.areaSqft,
    floor: p.floor,
    builtYear: p.builtYear,
    facing: p.facing,
    parking: p.parking,
    furnishing: p.furnishing,
    ...(p.cardMeta
      ? { cardMeta: p.cardMeta.map((m, i) => ({ _key: `cm${i}`, icon: m.icon, label: m.label })) }
      : {}),
    description: p.description,
    amenities: p.amenities,
    geo: geopoint(p.geo),
    newAt: isoDate(p.newAt),
  });
}

process.stdout.write(lines.join('\n') + '\n');
process.stderr.write(`seed: ${localities.length} localities, ${properties.length} properties\n`);
