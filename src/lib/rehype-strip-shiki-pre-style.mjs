import { visit } from "unist-util-visit"

// Remove Shiki's inline `style` attribute from <pre class="astro-code"> so our
// CSS controls background/color. Inner <span style="color:..."> tokens are kept
// so syntax highlighting still works.
export function rehypeStripShikiPreStyle() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "pre") return
      const cls = node.properties?.className
      const classList = Array.isArray(cls) ? cls : typeof cls === "string" ? cls.split(" ") : []
      if (!classList.includes("astro-code")) return
      if (node.properties?.style) delete node.properties.style
    })
  }
}
