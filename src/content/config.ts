import { defineCollection, z } from "astro:content";

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    titleAccent: z.string().optional(),
    subtitle: z.string().optional(),
    author: z.string(),
    readingTime: z.string(),
    tags: z.array(z.string()),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    noteId: z.string().optional(),
    hero: z
      .object({
        src: z.string(),
        alt: z.string(),
        caption: z.string().optional(),
      })
      .optional(),
  }),
});

export const collections = { posts };
