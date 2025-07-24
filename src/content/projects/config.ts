import { defineCollection, z } from 'astro:content';

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
    liveUrl: z.string().url().optional(),
    githubUrl: z.string().url().optional(),
    videoUrl: z.string().url().optional(),
  }),
});

export const collections = {
  'projects': projectCollection,
};