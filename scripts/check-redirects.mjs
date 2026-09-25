#!/usr/bin/env node
// Verifies every row of the Phase 1 redirect map against a live site.
//
//   node scripts/check-redirects.mjs [baseUrl] [csvPath]
//   node scripts/check-redirects.mjs https://cityprop.co.in
//
// Checks, per row: the old URL returns the expected status code, lands on the
// expected destination, does so in ONE hop (no chains), and that the destination
// itself returns 200. Exits non-zero if anything fails, so CI can gate on it.
import { readFileSync } from 'node:fs';

const BASE = (process.argv[2] ?? 'https://cityprop.co.in').replace(/\/$/, '');
const CSV = process.argv[3] ?? 'reports/2026-09-24-phase1-redirects.csv';
const CONCURRENCY = 12;

/** Minimal CSV row reader: the first three columns are unquoted by construction. */
const rows = readFileSync(CSV, 'utf8')
  .trim()
  .split('\n')
  .slice(1)
  .map((line) => {
    const m = line.match(/^([^,]+),([^,]*),(\d+),/);
    if (!m) return null;
    return { from: m[1], to: m[2], code: Number(m[3]) };
  })
  .filter(Boolean);

const failures = [];
const destinations = new Set();

async function checkRow(r) {
  const url = BASE + r.from;
  let res;
  try {
    res = await fetch(url, { redirect: 'manual' });
  } catch (err) {
    failures.push(`${r.from} — request failed: ${err.message}`);
    return;
  }
  if (res.status !== r.code) {
    failures.push(`${r.from} — expected ${r.code}, got ${res.status}`);
    return;
  }
  if (r.code === 410) return; // nothing further to check

  const loc = res.headers.get('location') ?? '';
  const got = loc.replace(BASE, '') || loc;
  if (got !== r.to) {
    failures.push(`${r.from} — expected → ${r.to}, got → ${got || '(no Location header)'}`);
    return;
  }
  // One hop only: the destination must not itself redirect.
  let hop;
  try {
    hop = await fetch(BASE + r.to, { redirect: 'manual' });
  } catch (err) {
    failures.push(`${r.to} — destination unreachable: ${err.message}`);
    return;
  }
  if (hop.status >= 300 && hop.status < 400) {
    failures.push(`${r.from} — CHAIN: ${r.to} itself redirects to ${hop.headers.get('location')}`);
    return;
  }
  if (hop.status !== 200) {
    failures.push(`${r.to} — destination returned ${hop.status}`);
    return;
  }
  destinations.add(r.to);
}

const queue = [...rows];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) await checkRow(queue.shift());
  }),
);

console.log(`[check-redirects] ${BASE} — ${rows.length} rows, ${destinations.size} distinct destinations, ${failures.length} failure(s)`);
for (const f of failures.slice(0, 40)) console.error('  ✗ ' + f);
if (failures.length > 40) console.error(`  … and ${failures.length - 40} more`);
process.exit(failures.length ? 1 : 0);
