import fs from "fs"
import path from "path"
import { visit } from "unist-util-visit"

let cache = null

function buildVaultMap(contentDir) {
  // Always rebuild — vault is small and this ensures new notes resolve immediately in dev
  cache = new Map()
  const vaultDir = path.join(contentDir, "vault")
  try {
    for (const f of fs.readdirSync(vaultDir)) {
      if (!/\.(md|mdx)$/.test(f)) continue
      const slug = f.replace(/\.(md|mdx)$/, "")
      const url = `/vault/${slug}`
      cache.set(slug, url)
      cache.set(slug.toLowerCase(), url)
      try {
        const raw = fs.readFileSync(path.join(vaultDir, f), "utf-8")
        const m = raw.match(/^title:\s*["']?(.+?)["']?\s*$/m)
        if (m) {
          cache.set(m[1].trim(), url)
          cache.set(m[1].trim().toLowerCase(), url)
        }
      } catch {}
    }
  } catch {}
  return cache
}

// Rehype plugin — runs after remark, converts unresolved wikilink spans to real links
export function rehypeResolveWikilinks() {
  const map = buildVaultMap(path.resolve(process.cwd(), "src/content"))
  return (tree) => {
    visit(tree, "element", (node, index, parent) => {
      if (
        node.tagName !== "span" ||
        !node.properties?.className?.includes("wikilink--unresolved") ||
        !parent ||
        index == null
      ) return

      // Extract display text from children
      const text = node.children
        .filter((c) => c.type === "text")
        .map((c) => c.value)
        .join("")

      const href = map.get(text) ?? map.get(text.toLowerCase())
      if (!href) return // genuinely unresolved — leave as span

      // Replace span with a proper link
      parent.children[index] = {
        type: "element",
        tagName: "a",
        properties: { href, className: ["wikilink"] },
        children: [{ type: "text", value: text }],
      }
    })
  }
}
