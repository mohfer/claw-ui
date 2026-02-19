import { marked } from "marked"
import DOMPurify from "dompurify"

marked.setOptions({
  breaks: true,
  gfm: true,
})

export function renderMarkdown(text) {
  if (!text) return ""
  const html = marked.parse(text)
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "code", "pre", "blockquote",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li",
      "table", "thead", "tbody", "tr", "th", "td",
      "a", "hr", "s", "del",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
  })
}