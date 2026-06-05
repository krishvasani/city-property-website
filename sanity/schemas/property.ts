import { defineType, defineField } from 'sanity';

const TYPES = ['residential', 'commercial', 'land', 'industrial', 'warehousing', 'investment'];
const ICONS = ['bed', 'bath', 'ruler', 'furnished', 'plot', 'commercial', 'parking'];

export default defineType({
  name: 'property',
  title: 'Property',
  type: 'document',
  groups: [
    { name: 'main', title: 'Main', default: true },
    { name: 'facts', title: 'Facts' },
    { name: 'content', title: 'Content' },
    { name: 'meta', title: 'Meta' },
  ],
  fields: [
    defineField({ name: 'title', type: 'string', group: 'main', validation: (r) => r.required(), description: 'e.g. "3 BHK Apartment · Iscon Platinum"' }),
    defineField({ name: 'slug', type: 'slug', group: 'main', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({
      name: 'status', type: 'string', group: 'main',
      options: { list: [{ title: 'For sale', value: 'sale' }, { title: 'For rent', value: 'rent' }, { title: 'For lease', value: 'lease' }], layout: 'radio' },
      initialValue: 'sale', validation: (r) => r.required(),
    }),
    defineField({ name: 'statusLabel', title: 'Status label (optional override)', type: 'string', group: 'meta', description: 'Defaults to "For sale" / "For rent".' }),
    defineField({ name: 'propertyType', title: 'Property type', type: 'string', group: 'main', options: { list: TYPES }, initialValue: 'residential', validation: (r) => r.required() }),
    defineField({ name: 'priceDisplay', title: 'Price (display)', type: 'string', group: 'main', description: 'e.g. "₹ 1.45 Cr" or "₹ 65,000"', validation: (r) => r.required() }),
    defineField({ name: 'priceValue', title: 'Price (numeric ₹, for sorting)', type: 'number', group: 'main' }),
    defineField({ name: 'pricePer', title: 'Price suffix', type: 'string', group: 'main', description: 'e.g. " /month" for rentals' }),
    defineField({ name: 'locality', title: 'Locality', type: 'reference', to: [{ type: 'locality' }], group: 'main' }),
    defineField({ name: 'address', type: 'string', group: 'main', description: 'e.g. "Prahlad Nagar, Ahmedabad"' }),
    defineField({ name: 'perSqftDisplay', title: 'Price per sqft (display)', type: 'string', group: 'main' }),
    defineField({ name: 'agent', title: 'Advisor', type: 'reference', to: [{ type: 'agent' }], group: 'main' }),
    defineField({ name: 'featured', title: 'Featured on homepage', type: 'boolean', group: 'main', initialValue: false }),

    // Facts
    defineField({ name: 'beds', type: 'string', group: 'facts', description: 'Number, or text like "Shed" / "Retail"' }),
    defineField({ name: 'baths', type: 'string', group: 'facts' }),
    defineField({ name: 'area', title: 'Area (display)', type: 'string', group: 'facts', description: 'e.g. "1,950 sqft"' }),
    defineField({ name: 'areaSqft', title: 'Area (numeric, for sorting)', type: 'number', group: 'facts' }),
    defineField({ name: 'floor', type: 'string', group: 'facts', description: 'e.g. "7 / 14"' }),
    defineField({ name: 'builtYear', title: 'Built', type: 'string', group: 'facts' }),
    defineField({ name: 'facing', type: 'string', group: 'facts' }),
    defineField({ name: 'parking', type: 'string', group: 'facts' }),
    defineField({ name: 'furnishing', type: 'string', group: 'facts' }),
    defineField({
      name: 'cardMeta', title: 'Card meta (override)', type: 'array', group: 'facts',
      description: 'Optional. Overrides the beds/bath/area pills on the card (use for offices, sheds, retail).',
      of: [{
        type: 'object',
        fields: [
          { name: 'icon', type: 'string', options: { list: ICONS } },
          { name: 'label', type: 'string' },
        ],
        preview: { select: { title: 'label', subtitle: 'icon' } },
      }],
    }),

    // Content
    defineField({ name: 'description', title: 'Description paragraphs', type: 'array', group: 'content', of: [{ type: 'text' }] }),
    defineField({ name: 'amenities', type: 'array', group: 'content', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({
      name: 'photos', type: 'array', group: 'content',
      of: [{
        type: 'image', options: { hotspot: true },
        fields: [
          { name: 'alt', type: 'string', title: 'Alt text' },
          { name: 'label', type: 'string', title: 'Caption / placeholder label' },
        ],
      }],
    }),
    defineField({ name: 'geo', title: 'Map location', type: 'geopoint', group: 'content' }),

    // Meta
    defineField({ name: 'newAt', title: 'Listed date', type: 'datetime', group: 'meta' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'priceDisplay', media: 'photos.0' },
  },
});
