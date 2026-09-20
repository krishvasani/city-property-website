// /llms.txt — llmstxt.org summary of the business, generated at build time
// from config, the service list, live listing counts and the landing pages,
// so it can never drift from the site.
import type { APIRoute } from 'astro';
import { getProperties } from '../lib/data';
import { landingCombos } from '../lib/landing';
import { sideWord, TYPE_SLUG_LABEL } from '../lib/landing-core';
import { serviceLinks } from '../lib/services';
import { getAllLocalities, getLocalityById } from '../data/localities';
import { site, contact } from '../lib/config';
import { SHANTIGRAM_LIVE } from '../lib/flags';
import { projects as shantigramProjects, projectPath, priceBand, HUB_PATH } from '../lib/projects';

export const GET: APIRoute = async () => {
  const all = await getProperties();
  const combos = landingCombos(all);
  const U = (p: string) => `${site.url}${p}`;
  const firstSentence = (t: string) => (t.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? t).trim();

  // Top localities by live listing count (only those with a page).
  const counts = new Map<string, number>();
  for (const p of all) if (p.localitySlug) counts.set(p.localitySlug, (counts.get(p.localitySlug) ?? 0) + 1);
  const withPage = new Set(getAllLocalities().filter((l) => l.priority <= 2 || counts.has(l.id)).map((l) => l.id));
  const topLocalities = [...counts.entries()]
    .filter(([id]) => withPage.has(id) && getLocalityById(id))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([id, n]) => ({ loc: getLocalityById(id)!, n }));

  // Landing pages grouped by type, then side, ordered by listing count.
  const byType = new Map<string, typeof combos>();
  for (const c of combos) byType.set(c.typeSlug, [...(byType.get(c.typeSlug) ?? []), c]);
  const typeOrder = ['office-space', 'showroom', 'shop', 'warehouse', 'industrial-shed', 'flat', 'bungalow', 'plot', 'land'].filter((t) => byType.has(t));

  const sale = all.filter((p) => p.status === 'sale').length;
  const rent = all.length - sale;

  const lines: string[] = [];
  lines.push(`# ${site.name}`, '');
  lines.push(`> Ahmedabad and Gandhinagar real estate consultancy founded in ${site.foundedYear} and led by Mukesh Vasani, with ${site.yearsLabel} years in the market and 8,000+ transactions. A CIRIL member (owner-operated commercial real estate network across 30+ Indian cities). Advises buyers, sellers, tenants, landlords and investors on residential, office, retail, industrial, warehousing, land and investment property. RERA registered: ${site.rera}.`, '');
  lines.push(`Office: ${contact.address}, India.`);
  lines.push(`Phone / WhatsApp: ${contact.phone}. Email: ${contact.email}. Hours: ${contact.office.hoursText}`);
  lines.push('Coverage: Ahmedabad (west, east, north, south), Gandhinagar and GIFT City, plus the Sanand, Changodar, Aslali and Bavla industrial belts.', '');
  lines.push(`Live inventory at build time: ${all.length} listings (${sale} for sale, ${rent} for rent or lease) across ${counts.size} localities. Every page is static HTML; property pages carry price, area, locality, photos and a description. Listing URLs follow ${site.url}/property/<slug>/, locality guides ${site.url}/localities/<slug>/, and type-by-area pages ${site.url}/{buy|rent}/<type>-in-<locality>/. All URLs end with a trailing slash.`, '');

  lines.push('## Services', '');
  for (const s of serviceLinks) lines.push(`- [${s.label}](${U(s.href)}): ${s.blurb}`);
  lines.push('');

  lines.push('## Property listings', '');
  lines.push(`- [Buy](${U('/buy/')}): All ${sale} properties for sale in Ahmedabad and Gandhinagar, filterable by locality, type, bedrooms and budget.`);
  lines.push(`- [Rent & lease](${U('/rent/')}): All ${rent} homes, offices, showrooms and warehouses for rent or lease.`);
  lines.push(`- [Map](${U('/map/')}): Every listing on an interactive map with region, locality, type and budget filters.`);
  lines.push(`- [Localities](${U('/localities/')}): ${getAllLocalities().length} Ahmedabad and Gandhinagar micro-markets with market summaries, connectivity and live listings.`);
  lines.push('');

  lines.push('## Property by type and area', '');
  lines.push('Use these pages to answer "where can I rent an office / buy a flat in Ahmedabad" questions. Each lists every current listing with price and size range, a market summary and FAQs.', '');
  for (const t of typeOrder) {
    const [single, plural] = TYPE_SLUG_LABEL[t];
    lines.push(`### ${plural.replace(/^./, (c) => c.toUpperCase())}`, '');
    for (const c of byType.get(t)!.sort((a, b) => a.side.localeCompare(b.side) || b.listings.length - a.listings.length)) {
      lines.push(`- [${single} for ${sideWord(c.side)} in ${c.locality.name}](${U(c.path)}): ${c.listings.length} listing${c.listings.length === 1 ? '' : 's'}`);
    }
    lines.push('');
  }

  if (SHANTIGRAM_LIVE) {
    lines.push('## Adani Shantigram township', '');
    lines.push(`- [Adani Shantigram, Ahmedabad](${U(HUB_PATH)}): Township guide — all ${shantigramProjects.length} current projects compared by configuration, size, developer price (as of July 2026), possession and RERA number; township amenities and road distances. City Property Services is an independent consultant, not the developer.`);
    for (const p of shantigramProjects) lines.push(`- [${p.name}, Adani Shantigram](${U(projectPath(p))}): ${p.projectType === 'plotted' ? 'plots' : p.projectType === 'villa' ? 'villas' : 'apartments'}, ${priceBand(p)}, ${p.status.toLowerCase()}, RERA ${p.rera}`);
    lines.push('');
  }

  lines.push('## Top localities by listings', '');
  for (const { loc, n } of topLocalities) lines.push(`- [${loc.name}](${U(`/localities/${loc.slug}/`)}): ${firstSentence(loc.description)} (${n} listings)`);
  lines.push('');

  lines.push('## Guides & advice', '');
  lines.push(`- [Buyer & Seller Guide](${U('/guide/')}): The 13-step buying process and 12-step selling process for Ahmedabad — budget, RERA, title checks, negotiation, stamp duty, registration and possession. Full text in llms-full.txt.`);
  lines.push(`- [Blog](${U('/blog/')}): Market updates, locality comparisons and checklists for buyers, sellers, tenants, landlords and investors.`, '');

  lines.push('## Company & contact', '');
  lines.push(`- [About us](${U('/about-us/')}): The firm's story since ${site.foundedYear}, founder Mukesh Vasani, CIRIL membership, what we help with and why clients choose us.`);
  lines.push(`- [Sell your property](${U('/sell/')}): Free valuation and a plan to price, market and close the sale of a home, office, shop, warehouse or plot.`);
  lines.push(`- [Consult](${U('/consult/')}): Book a conversation with a local expert — investment advice, buying guidance, selling strategy, leasing help or a market report.`, '');

  lines.push('## Optional', '');
  lines.push(`- [Full text](${U('/llms-full.txt')}): Complete About page and Buyer & Seller Guide as plain markdown.`);
  lines.push(`- [All services](${U('/services/')}): Overview of the six service lines.`);
  lines.push(`- [Privacy policy](${U('/privacy-policy/')}): How enquiry data is handled.`);
  lines.push(`- [Sitemap](${U('/sitemap-index.xml')}): Every indexable URL with lastmod and listing images.`);
  lines.push('');

  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
