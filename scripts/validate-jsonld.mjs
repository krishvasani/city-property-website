#!/usr/bin/env node
// Dev-time JSON-LD validator for built pages (not part of the build).
//   node scripts/validate-jsonld.mjs dist/property/<slug>/index.html [...more]
// Checks, per page:
//   1. exactly one <script type="application/ld+json">, valid JSON, one @graph
//   2. every node has @type and @id; @ids are unique in the graph
//   3. every {"@id": …} reference resolves to a node in the same graph
//   4. every @type exists in schema.org; every property exists in schema.org
//      and is declared (domainIncludes) on the node's type or a supertype
//   5. Google BreadcrumbList rules (position/name/item on every ListItem)
//   6. Offer: has price OR priceSpecification.price OR min/maxPrice
// Vocabulary: schema.org/version/latest (cached in .cache/schemaorg.jsonld).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CACHE = join(process.cwd(), '.cache');
const VOCAB = join(CACHE, 'schemaorg.jsonld');
if (!existsSync(VOCAB)) {
  mkdirSync(CACHE, { recursive: true });
  const res = await fetch('https://schema.org/version/latest/schemaorg-current-https.jsonld');
  writeFileSync(VOCAB, Buffer.from(await res.arrayBuffer()));
}
const vocab = JSON.parse(readFileSync(VOCAB, 'utf8'))['@graph'];
const id = (x) => (typeof x === 'string' ? x : x?.['@id'] ?? '').replace('schema:', '');
const arr = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);
const classes = new Map(), props = new Map();
for (const t of vocab) {
  const types = arr(t['@type']);
  if (types.includes('rdfs:Class')) classes.set(id(t['@id']), { parents: arr(t['rdfs:subClassOf']).map(id) });
  if (types.includes('rdf:Property')) props.set(id(t['@id']), { domains: arr(t['schema:domainIncludes']).map(id) });
}
const supers = (type, seen = new Set()) => {
  if (!classes.has(type) || seen.has(type)) return seen;
  seen.add(type);
  for (const p of classes.get(type).parents) supers(p, seen);
  return seen;
};
// Properties expressible via a 2-D pseudo-namespace that are still valid.
const JSONLD_KEYS = new Set(['@context', '@type', '@id', '@graph']);

function validatePage(file) {
  const html = readFileSync(file, 'utf8');
  const errors = [], warnings = [];
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  if (blocks.length !== 1) errors.push(`expected 1 JSON-LD block, found ${blocks.length}`);
  let doc;
  try { doc = JSON.parse(blocks[0] ?? ''); } catch (e) { errors.push(`JSON parse error: ${e.message}`); return { errors, warnings, nodes: 0 }; }
  const graph = doc['@graph'];
  if (!Array.isArray(graph)) errors.push('top level is not a single @graph');
  const nodes = graph ?? [];
  const canon = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? '';
  const pageUrl = canon; const siteUrl = canon.replace(/^(https?:\/\/[^/]+).*$/, '$1');
  const ids = new Map();
  for (const n of nodes) {
    if (!n['@type']) errors.push(`node without @type: ${JSON.stringify(n).slice(0, 80)}`);
    if (!n['@id']) errors.push(`node without @id: ${n['@type']}`);
    else if (ids.has(n['@id'])) errors.push(`duplicate @id ${n['@id']}`);
    else ids.set(n['@id'], n);
  }
  // Walk every object: type/property checks + reference resolution
  const walk = (obj, path) => {
    if (Array.isArray(obj)) return obj.forEach((o, i) => walk(o, `${path}[${i}]`));
    if (!obj || typeof obj !== 'object') return;
    const keys = Object.keys(obj);
    if (keys.length === 1 && keys[0] === '@id') {
      const ref = obj['@id'];
      // A reference must resolve in this graph, unless it points at a node
      // published on ANOTHER page of this site (e.g. an ItemList referencing
      // /property/x/#listing) or at a known external entity.
      const external = /^https?:\/\/(www\.)?(ciril\.in|wikidata\.org)/.test(ref);
      const otherPage = ref.startsWith(siteUrl) && ref.split('#')[0] !== pageUrl && ref.split('#')[0] !== siteUrl + '/';
      if (!ids.has(ref) && !external && !otherPage) errors.push(`${path}: unresolved reference ${ref}`);
      return;
    }
    const types = arr(obj['@type']);
    for (const t of types) if (!classes.has(t)) errors.push(`${path}: unknown type ${t}`);
    const allSupers = new Set(types.flatMap((t) => [...supers(t)]));
    for (const k of keys) {
      if (JSONLD_KEYS.has(k)) continue;
      if (!props.has(k)) { errors.push(`${path}: unknown property "${k}" on ${types.join('/')}`); continue; }
      const domains = props.get(k).domains;
      if (types.length && !domains.some((d) => allSupers.has(d))) errors.push(`${path}: property "${k}" is not defined for ${types.join('/')} (domainIncludes: ${domains.join(', ')})`);
      walk(obj[k], `${path}.${k}`);
    }
  };
  nodes.forEach((n, i) => walk(n, `${n['@type']}#${i}`));
  // Google BreadcrumbList
  for (const n of nodes.filter((n) => n['@type'] === 'BreadcrumbList')) {
    arr(n.itemListElement).forEach((li, i) => {
      if (li['@type'] !== 'ListItem') errors.push(`BreadcrumbList item ${i}: not a ListItem`);
      if (li.position !== i + 1) errors.push(`BreadcrumbList item ${i}: position ${li.position} != ${i + 1}`);
      if (!li.name) errors.push(`BreadcrumbList item ${i}: missing name`);
      if (!li.item) errors.push(`BreadcrumbList item ${i}: missing item`);
      else if (!/\/(\?.*)?$/.test(li.item)) errors.push(`BreadcrumbList item ${i}: not trailing-slash form: ${li.item}`);
    });
  }
  // Offers: must carry a visible price construction
  for (const n of nodes.filter((n) => n['@type'] === 'Offer')) {
    const ps = n.priceSpecification;
    const ok = n.price != null || ps?.price != null || (ps?.minPrice != null && ps?.maxPrice != null);
    if (!ok) errors.push(`Offer ${n['@id']}: no price / priceSpecification.price / minPrice+maxPrice`);
    if (n.priceCurrency !== 'INR') warnings.push(`Offer ${n['@id']}: priceCurrency ${n.priceCurrency}`);
  }
  // Listing sanity
  const listing = nodes.find((n) => n['@type'] === 'RealEstateListing');
  if (listing) {
    for (const k of ['url', 'name', 'description', 'mainEntity', 'provider']) if (!listing[k]) warnings.push(`RealEstateListing missing ${k}`);
    if (!listing.image) warnings.push('RealEstateListing has no image (listing has no photos)');
    if (!nodes.some((n) => n['@type'] === 'Offer')) warnings.push('no Offer node (price on request)');
  }
  return { errors, warnings, nodes: nodes.length, types: nodes.map((n) => n['@type']) };
}

const files = process.argv.slice(2);
if (!files.length) { console.error('usage: node scripts/validate-jsonld.mjs <built html file> [...]'); process.exit(2); }
let failed = 0;
for (const f of files) {
  const r = validatePage(f);
  const status = r.errors.length ? 'FAIL' : 'PASS';
  if (r.errors.length) failed++;
  console.log(`${status}  ${f.replace(/^dist/, '')}  nodes=${r.nodes} [${(r.types ?? []).join(', ')}]`);
  for (const e of r.errors) console.log(`    ERROR  ${e}`);
  for (const w of r.warnings) console.log(`    warn   ${w}`);
}
process.exit(failed ? 1 : 0);
