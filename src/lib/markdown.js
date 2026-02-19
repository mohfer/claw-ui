export function renderMarkdown(text) {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  html = html
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>'
    )

  const lines = html.split("\n")
  const result = []
  let listType = null

  for (const line of lines) {
    const ulMatch = line.match(/^[-*] (.+)/)
    const olMatch = line.match(/^\d+\. (.+)/)

    if (ulMatch) {
      if (listType !== "ul") {
        if (listType) result.push(`</${listType}>`)
        result.push("<ul>")
        listType = "ul"
      }
      result.push(`<li>${ulMatch[1]}</li>`)
    } else if (olMatch) {
      if (listType !== "ol") {
        if (listType) result.push(`</${listType}>`)
        result.push("<ol>")
        listType = "ol"
      }
      result.push(`<li>${olMatch[1]}</li>`)
    } else {
      if (listType) {
        result.push(`</${listType}>`)
        listType = null
      }
      result.push(line)
    }
  }

  if (listType) result.push(`</${listType}>`)

  return result.join("\n")
}