import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/** Icon keys map to paths in src/components/Icon.astro */
const iconKey = z.enum([
  'adult-day',
  'community',
  'day-support',
  'residential',
  'family',
  'respite',
  'vocational',
  'supported-living',
  'transitional',
  'transportation',
  'heart',
  'shield',
  'users',
  'star',
  'compass',
]);

const services = defineCollection({
  loader: glob({ base: './src/content/services', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(), // descriptive tagline shown above the title
    order: z.number(),
    summary: z.string(), // one-line, used on cards
    icon: iconKey,
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    featured: z.boolean().default(true),
  }),
});

const values = defineCollection({
  loader: glob({ base: './src/content/values', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    icon: iconKey,
    summary: z.string(),
  }),
});

const team = defineCollection({
  loader: glob({ base: './src/content/team', pattern: '**/*.md' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    order: z.number(),
    photo: z.string().optional(),
  }),
});

export const collections = { services, values, team };
