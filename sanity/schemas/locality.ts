import { defineType, defineField } from 'sanity';

const LOCALITY_TYPES = ['residential', 'commercial', 'office', 'industrial', 'warehousing', 'logistics', 'plots', 'investment'];
const GROUPS = [
  'West Ahmedabad', 'North Ahmedabad', 'East Ahmedabad', 'South Ahmedabad',
  'Central Ahmedabad', 'Ahmedabad Outskirts', 'Industrial & Warehousing', 'GIFT City & Gandhinagar',
];

export default defineType({
  name: 'locality',
  title: 'Locality / Micro-market',
  type: 'document',
  groups: [
    { name: 'main', title: 'Main', default: true },
    { name: 'market', title: 'Market & relevance' },
    { name: 'geo', title: 'Geo & nearby' },
    { name: 'home', title: 'Homepage / SEO' },
  ],
  fields: [
    defineField({ name: 'name', type: 'string', group: 'main', validation: (r) => r.required() }),
    defineField({ name: 'slug', type: 'slug', group: 'main', options: { source: 'name' }, validation: (r) => r.required() }),
    defineField({ name: 'aliases', type: 'array', group: 'main', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({ name: 'city', type: 'string', group: 'main', initialValue: 'Ahmedabad' }),
    defineField({ name: 'district', type: 'string', group: 'main', initialValue: 'Ahmedabad' }),
    defineField({ name: 'region', type: 'string', group: 'main', description: 'e.g. "West Ahmedabad", "Gandhinagar"' }),
    defineField({ name: 'zone', type: 'string', group: 'main' }),
    defineField({ name: 'group', title: 'UI group / cluster', type: 'string', group: 'main', options: { list: GROUPS } }),
    defineField({ name: 'microMarket', type: 'string', group: 'main' }),

    // Market & relevance
    defineField({ name: 'type', title: 'Property types', type: 'array', group: 'market', of: [{ type: 'string' }], options: { list: LOCALITY_TYPES } }),
    defineField({
      name: 'propertyRelevance', title: 'Property relevance', type: 'object', group: 'market',
      options: { columns: 2 },
      fields: ['buy', 'rent', 'sell', 'lease', 'plots', 'industrial', 'warehousing', 'commercial'].map((f) => ({ name: f, type: 'boolean', title: f[0].toUpperCase() + f.slice(1) })),
    }),
    defineField({ name: 'popularFor', type: 'array', group: 'market', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({ name: 'priority', type: 'number', group: 'market', description: '1 = prime / most-searched … 4 = niche' }),

    // Geo & nearby
    defineField({ name: 'geo', title: 'Map location (centroid)', type: 'geopoint', group: 'geo' }),
    defineField({ name: 'nearbyAreas', title: 'Nearby areas (locality ids)', type: 'array', group: 'geo', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({ name: 'connectivity', type: 'array', group: 'geo', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({ name: 'landmarks', type: 'array', group: 'geo', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({ name: 'pincode', type: 'string', group: 'geo' }),

    // Homepage / SEO
    defineField({ name: 'blurb', title: 'Homepage blurb', type: 'string', group: 'home', description: 'Shown on the homepage neighbourhoods strip, e.g. "Commercial hub · Avg ₹7,200/sqft". Leave blank to hide from that strip.' }),
    defineField({ name: 'avgPriceDisplay', title: 'Avg price (display)', type: 'string', group: 'home' }),
    defineField({
      name: 'mapPos', title: 'Stylised-map position (fallback)', type: 'object', group: 'home',
      description: 'Only used by the stylised CSS map when no Mapbox token is set.',
      fields: [{ name: 'left', type: 'string', title: 'Left %' }, { name: 'top', type: 'string', title: 'Top %' }],
    }),
    defineField({ name: 'description', type: 'text', group: 'home' }),
    defineField({ name: 'seoTitle', type: 'string', group: 'home' }),
    defineField({ name: 'seoDescription', type: 'text', group: 'home' }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'region' },
  },
});
