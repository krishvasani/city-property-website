import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'locality',
  title: 'Locality / Neighbourhood',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'blurb',
      title: 'Short blurb',
      type: 'string',
      description: 'e.g. "Commercial hub · Avg ₹7,200/sqft"',
    }),
    defineField({ name: 'avgPriceDisplay', title: 'Avg price (display)', type: 'string' }),
    defineField({ name: 'geo', title: 'Map location', type: 'geopoint' }),
    defineField({
      name: 'mapPos',
      title: 'Stylised-map position (fallback)',
      type: 'object',
      description: 'Only used when no Mapbox token is configured.',
      fields: [
        { name: 'left', type: 'string', title: 'Left %' },
        { name: 'top', type: 'string', title: 'Top %' },
      ],
    }),
  ],
  preview: { select: { title: 'name', subtitle: 'blurb' } },
});
