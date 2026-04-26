import fs from "fs"
import path from "path"
import { visit } from "unist-util-visit"

let cache = null

function buildCache(contentDir) {
  if (cache) return cache
  cache = new Map()

  // blog + projects: map by filename slug
  for (const col of ["blog", "projects"]) {
    const dir = path.join(contentDir, col)
    try {
      for (const f of fs.readdirSync(dir)) {
        if (!/\.(md|mdx)$/.test(f)) continue
        const id = f.replace(/\.(md|mdx)$/, "")
        cache.set(id, `/${col}/${id}`)
        cache.set(id.toLowerCase(), `/${col}/${id}`)
      }
    } catch {}
  }

  // vault: map by filename slug AND by frontmatter title
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

function splitWikilinks(text, map) {
  const parts = []
  const re = /\[\[([^\]]+)\]\]/g
  let last = 0
  let m
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: "text", value: text.slice(last, m.index) })
    const inner = m[1]
    const pipe = inner.indexOf("|")
    const target = pipe >= 0 ? inner.slice(0, pipe).trim() : inner.trim()
    const display = pipe >= 0 ? inner.slice(pipe + 1) : inner
    const href = map.get(target) ?? map.get(target.toLowerCase())
    if (href) {
      parts.push({ type: "link", url: href, children: [{ type: "text", value: display }] })
    } else {
      parts.push({
        type: "html",
        value: `<span class="wikilink wikilink--unresolved" data-unresolved="true">${display}</span>`,
      })
    }
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) })
  return parts
}

export function remarkWikilinks() {
  console.log("[wikilinks] remarkWikilinks() factory called")
  return (tree) => {
    const map = buildCache(path.resolve(process.cwd(), "src/content"))
    visit(tree, (node) => {
      if (!node.children) return
      let changed = false
      const next = []
      for (const child of node.children) {
        if (child.type === "text" && child.value.includes("[[")) {
          const parts = splitWikilinks(child.value, map)
          if (parts.length > 1 || parts[0]?.type !== "text") {
            next.push(...parts)
            changed = true
            continue
          }
        }
        next.push(child)
      }
      if (changed) node.children = next
    })
  }
}
