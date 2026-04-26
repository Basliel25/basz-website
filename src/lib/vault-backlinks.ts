import type { CollectionEntry } from "astro:content"

// Vite statically analyzes this glob at build time
const rawFiles = import.meta.glob("/src/content/vault/*.md", { as: "raw", eager: true })

function extractWikilinks(body: string): string[] {
  const targets: string[] = []
  const re = /\[\[([^\]]+)\]\]/g
  let m: RegExpExecArray | null
  while ((m = re.exec(body)) !== null) {
    const inner = m[1]
    const pipe = inner.indexOf("|")
    targets.push(pipe >= 0 ? inner.slice(0, pipe).trim() : inner.trim())
  }
  return targets
}

export function buildBacklinksMap(
  notes: CollectionEntry<"vault">[]
): Map<string, CollectionEntry<"vault">[]> {
  // title + slug → canonical slug
  const resolution = new Map<string, string>()
  for (const note of notes) {
    const slug = note.id.replace(/\.[^.]+$/, "")
    resolution.set(slug, slug)
    resolution.set(slug.toLowerCase(), slug)
    resolution.set(note.data.title, slug)
    resolution.set(note.data.title.toLowerCase(), slug)
  }

  const noteBySlug = new Map(notes.map((n) => [n.id.replace(/\.[^.]+$/, ""), n]))
  const backlinksMap = new Map<string, CollectionEntry<"vault">[]>()

  for (const [filePath, raw] of Object.entries(rawFiles)) {
    const fileName = filePath.split("/").pop()!
    const sourceSlug = fileName.replace(/\.[^.]+$/, "")
    const sourceNote = noteBySlug.get(sourceSlug)
    if (!sourceNote) continue

    for (const target of extractWikilinks(raw as string)) {
      const resolved = resolution.get(target) ?? resolution.get(target.toLowerCase())
      if (!resolved || resolved === sourceSlug) continue
      if (!backlinksMap.has(resolved)) backlinksMap.set(resolved, [])
      const list = backlinksMap.get(resolved)!
      if (!list.find((n) => n.id === sourceNote.id)) list.push(sourceNote)
    }
  }

  return backlinksMap
}
