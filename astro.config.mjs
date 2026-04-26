import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import { remarkWikilinks } from "./src/lib/remark-wikilinks.mjs"
import { rehypeResolveWikilinks } from "./src/lib/rehype-resolve-wikilinks.mjs"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"

export default defineConfig({
  site: "https://bas.dev",
  integrations: [mdx(), sitemap()],
  output: "static",
  markdown: {
    remarkPlugins: [remarkWikilinks, remarkMath],
    // rehypeResolveWikilinks runs after remark to upgrade unresolved spans → real links
    rehypePlugins: [rehypeResolveWikilinks, rehypeKatex],
    shikiConfig: { theme: "vesper" },
  },
})
