import { defineCollection, z } from 'astro:content';

const cookbookCollection = defineCollection({
  type: 'data',
  schema: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    thumbnail: z.string(),
    author: z.string(),
    date: z.string(),
    collections: z.array(z.string()).optional(),
    category: z.string(),
    cuisines: z.array(z.string()).optional(),
    diets: z.array(z.string()).optional(),
    cookware: z.array(z.string()).optional(),
    time: z.object({
      prep: z.number(),
      cook: z.number(),
      rest: z.number(),
    }),
    servings: z.number(),
    ingredients: z.array(z.object({
      item: z.string(),
      quantity: z.union([z.number(), z.string()]),
      unit: z.string(),
      note: z.string().optional(),
    })),
    instructions: z.array(z.string()),
    tips: z.array(z.string()).optional(),
  })),
});

const projectCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    thumbnail: z.string(),
    role: z.string(),
    priority: z.number().default(99),
    year: z.number(),
    filters: z.array(z.string()).optional(),
    tech: z.array(z.string()),
    platform: z.array(z.string()),
    liveUrl: z.string().url().or(z.literal('')).optional(),
    githubUrl: z.string().url().or(z.literal('')).optional(),
    videoUrl: z.string().url().or(z.literal('')).optional(),
  }),
});

export const collections = {
  'cookbook': cookbookCollection,
  'projects': projectCollection,
};