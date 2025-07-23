import { defineCollection, z } from 'astro:content';

const projectCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    role: z.string(),
    tech: z.array(z.string()),
    platform: z.array(z.string()),
    thumbnail: z.string().describe('Path to the thumbnail image, e.g., /images/aetherfall.gif'),
    liveUrl: z.string().url().optional(),
    githubUrl: z.string().url().optional(),
    videoUrl: z.string().url().optional(),
  }),
});

export const collections = {
  'projects': projectCollection,
};