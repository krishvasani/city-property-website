/**
 * Emits Sanity NDJSON for ALL localities from src/data/localities.ts, merging in
 * the curated homepage fields (blurb / avgPriceDisplay / mapPos) for the few that
 * have them (from src/data/sample.ts). Import with --replace so it updates the
 * existing curated locality docs and adds the rest, leaving properties/agents alone:
 *
 *   npx tsx scripts/seed-localities.ts > localities.ndjson
 *   npx sanity dataset import localities.ndjson production --replace
 */
import { localities as rich } from '../src/data/localities';
import { localities as curated } from '../src/data/sample';

const extra = new Map(curated.map((c) => [c.id, c]));
const clean = <T extends object>(o: T): T =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== '')) as T;

const lines = rich.map((l) => {
  const c = extra.get(l.id);
  return JSON.stringify(
    clean({
      _id: `locality.${l.id}`,
      _type: 'locality',
      name: l.name,
      slug: { _type: 'slug', current: l.id },
      aliases: l.aliases,
      city: l.city,
      district: l.district,
      region: l.region,
      zone: l.zone,
      group: l.group,
      microMarket: l.microMarket,
      type: l.type,
      propertyRelevance: l.propertyRelevance,
      popularFor: l.popularFor,
      priority: l.priority,
      geo: { _type: 'geopoint', lat: l.latitude, lng: l.longitude },
      nearbyAreas: l.nearbyAreas,
      connectivity: l.connectivity,
      landmarks: l.landmarks,
      pincode: l.pincode || undefined,
      description: l.description,
      seoTitle: l.seoTitle,
      seoDescription: l.seoDescription,
      // curated homepage extras (only present on a few)
      blurb: c?.blurb || undefined,
      avgPriceDisplay: c?.avgPriceDisplay || undefined,
      mapPos: c?.mapPos ? { left: c.mapPos.left, top: c.mapPos.top } : undefined,
    }),
  );
});

process.stdout.write(lines.join('\n') + '\n');
process.stderr.write(
  `localities: ${rich.length}, with homepage blurb: ${rich.filter((l) => extra.get(l.id)?.blurb).length}\n`,
);
