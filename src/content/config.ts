import { defineCollection, z } from "astro:content"

const pillVariants = ["systems", "linux", "foss", "learning", "meta", "public", "portfolio"] as const

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title:       z.string(),
    status:      z.enum(["shipped", "wip", "archived"]),
    description: z.string(),
    excerpt:     z.string(),
    date:        z.coerce.date(),
    tags:        z.array(z.enum(pillVariants)).default([]),
    stack:       z.array(z.string()).default([]),
    stats:       z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    featured:    z.boolean().default(false),
    draft:       z.boolean().default(false),
  }),
})

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title:    z.string(),
    subtitle: z.string().optional(),
    date:     z.coerce.date(),
    issue:    z.string().optional(),       // e.g. "DISPATCH № 23"
    tags:     z.array(z.enum(pillVariants)).default([]),
    excerpt:  z.string(),
    readTime: z.number().int().positive(), // minutes
    featured: z.boolean().default(false),
    draft:    z.boolean().default(false),
  }),
})

const vault = defineCollection({
  type: "content",
  schema: z.object({
    title:       z.string(),
    type:        z.enum(["note", "moc"]).default("note"),
    status:      z.enum(["seedling", "growing", "evergreen"]).default("seedling"),
    created:     z.coerce.date().optional(),
    tags:        z.array(z.string()).default([]),
    description: z.string().optional(),
    featured:    z.boolean().default(false),
    draft:       z.boolean().default(false),
  }),
})

export const collections = { projects, blog, vault }
