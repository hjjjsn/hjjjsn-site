// §4.2 コンテンツモデル。md ファイル1個の追加だけで掲載できることが受け入れ条件。
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const works = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/works" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    type: z.enum(["music", "mv", "illustration", "plugin", "mix", "inst"]),
    platform: z.enum(["youtube", "niconico", "none"]).default("none"),
    embedId: z.string().optional(),
    links: z
      .array(z.object({ label: z.string(), url: z.string().url() }))
      .default([]),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    description: z.string().default(""),
  }),
});

export const collections = { works };
