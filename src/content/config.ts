// Astro Content Collections — the editable source of truth for blog posts and
// properties. Decap CMS (see public/cps-admin) writes these files; the site
// reads them through src/lib/data.ts and the blog pages.
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content', // Markdown body
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.string(),
    author: z.string().default('City Property Services'),
    tags: z.array(z.string()).default([]),
    excerpt: z.string(),
    coverImage: z.string().optional(),
    coverAlt: z.string().optional(),
    imageCredit: z.string().optional(),
    readTime: z.string().default('5 min read'),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const photo = z.object({
  url: z.string().optional(),
  alt: z.string().optional(),
  label: z.string().optional(),
});

const properties = defineCollection({
  type: 'data', // JSON
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    status: z.enum(['sale', 'rent', 'lease']),
    statusLabel: z.string().optional(),
    propertyType: z.string(),
    // price
    priceDisplay: z.string(),
    priceValue: z.number().optional(),
    pricePer: z.string().optional(),
    priceOnRequest: z.boolean().optional(),
    deposit: z.string().optional(),
    maintenance: z.string().optional(),
    perSqftDisplay: z.string().optional(),
    // location
    localityName: z.string(),
    localitySlug: z.string().optional(),
    city: z.string().default('Ahmedabad'),
    district: z.string().optional(),
    region: z.string().optional(),
    address: z.string().optional(),
    nearby: z.array(z.string()).optional(),
    landmarks: z.array(z.string()).optional(),
    geo: z.object({ lat: z.number(), lng: z.number() }).optional(),
    // details
    beds: z.union([z.number(), z.string()]).optional(),
    baths: z.union([z.number(), z.string()]).optional(),
    area: z.string().optional(),
    areaSqft: z.number().optional(),
    carpetArea: z.string().optional(),
    builtUpArea: z.string().optional(),
    plotSize: z.string().optional(),
    floor: z.string().optional(),
    totalFloors: z.string().optional(),
    furnishing: z.string().optional(),
    parking: z.string().optional(),
    facing: z.string().optional(),
    age: z.string().optional(),
    possession: z.string().optional(),
    rera: z.string().optional(),
    builtYear: z.string().optional(),
    amenities: z.array(z.string()).default([]),
    suitableFor: z.array(z.string()).optional(),
    description: z.array(z.string()).default([]),
    // commercial / industrial
    roadWidth: z.string().optional(),
    ceilingHeight: z.string().optional(),
    powerLoad: z.string().optional(),
    loadingAccess: z.string().optional(),
    warehouseType: z.string().optional(),
    industrialUse: z.string().optional(),
    plotZoning: z.string().optional(),
    naStatus: z.string().optional(),
    frontage: z.string().optional(),
    dockAccess: z.string().optional(),
    // media
    mainImage: z.string().optional(),
    photos: z.array(photo).default([]),
    videoUrl: z.string().optional(),
    brochure: z.string().optional(),
    // meta
    cardMeta: z.array(z.object({ icon: z.string(), label: z.string() })).optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    newAt: z.string().optional(),
    // seo + cta
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    searchKeywords: z.string().optional(),
    inquiryLabel: z.string().optional(),
    whatsappText: z.string().optional(),
  }),
});

export const collections = { blog, properties };
