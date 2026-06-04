import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'agent',
  title: 'Advisor / Agent',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'role', type: 'string', description: 'e.g. "Senior Advisor"' }),
    defineField({ name: 'exp', title: 'Experience', type: 'string', description: 'e.g. "12 yrs"' }),
    defineField({ name: 'region', type: 'string', description: 'e.g. "West Ahmedabad"' }),
    defineField({ name: 'phone', title: 'Phone (for Call)', type: 'string' }),
    defineField({
      name: 'whatsapp',
      title: 'WhatsApp number (digits only)',
      type: 'string',
      description: 'International format, digits only — e.g. 919876543210',
    }),
    defineField({ name: 'email', type: 'string' }),
    defineField({ name: 'image', title: 'Photo', type: 'image', options: { hotspot: true } }),
  ],
  preview: { select: { title: 'name', subtitle: 'role', media: 'image' } },
});
