// /llms-full.txt — the About page and the Buyer & Seller Guide as plain
// markdown, generated from the same data modules the pages render from.
import type { APIRoute } from 'astro';
import { site, contact } from '../lib/config';
import { aboutIntro, story, vision, helpWith, why } from '../data/about';
import { buyerSteps, sellerSteps, guideIntro, buyerIntro, sellerIntro } from '../data/guide';

export const GET: APIRoute = async () => {
  const L: string[] = [];
  L.push(`# ${site.name} — full text`, '');
  L.push(`> Plain-text companion to ${site.url}/llms.txt containing the complete About page and the Ahmedabad Buyer & Seller Guide. Canonical pages: ${site.url}/about-us/ and ${site.url}/guide/`, '');
  L.push('**Company facts**', '');
  L.push(`- Business: ${site.name} (CPS), real estate consultancy, Ahmedabad and Gandhinagar, Gujarat, India`);
  L.push(`- Founded: ${site.foundedYear} (${site.yearsLabel} years) by Mukesh Vasani; 8,000+ transactions; co-founder of CIRIL, an owner-operated commercial real estate network across 30+ Indian cities`);
  L.push('- Services: residential, corporate offices, retail, industrial and warehousing, land and plots, investment (preleased and prelaunch)');
  L.push(`- RERA registration: ${site.rera}`);
  L.push(`- Office: ${contact.address}`);
  L.push(`- Hours: ${contact.office.hoursText}`);
  L.push(`- Phone / WhatsApp: ${contact.phone} · Email: ${contact.email}`);
  L.push(`- Website: ${site.url} (listings: /buy/, /rent/, /map/; areas: /localities/)`, '');
  L.push('---', '', '# About City Property Services', '', `Source: ${site.url}/about-us/`, '');
  L.push(aboutIntro, '');
  L.push('## Our story', '', ...story.flatMap((p) => [p, '']));
  L.push('## What we help with', '', 'We cover the full range of property needs in and around Ahmedabad:', '', ...helpWith.map((h) => `- ${h}`), '');
  L.push('## Why clients choose us', '', ...why.map((w) => `- **${w.title}** — ${w.text}`), '');
  L.push('## Our vision', '', ...vision.flatMap((p) => [p, '']));
  L.push('---', '', '# The Ahmedabad Buyer & Seller Guide', '', `Source: ${site.url}/guide/`, '', guideIntro, '');
  L.push(`## Buyer's Guide for Ahmedabad (${buyerSteps.length} steps)`, '', buyerIntro, '', ...buyerSteps.map(([t, d], i) => `${i + 1}. **${t}** — ${d}`), '');
  L.push(`## Seller's Guide for Ahmedabad (${sellerSteps.length} steps)`, '', sellerIntro, '', ...sellerSteps.map(([t, d], i) => `${i + 1}. **${t}** — ${d}`), '');
  L.push('## Talk to an expert', '', `Questions about any step? Call or WhatsApp ${contact.phone}, or request a consultation at ${site.url}/consult/. Selling? Get a free estimate at ${site.url}/sell/.`, '');
  return new Response(L.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
