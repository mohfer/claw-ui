const TOOL_COLORS = {
  web_search: "#4a90d9",
  web_fetch: "#5ba85a",
  exec: "#d4522a",
  read_file: "#e8a838",
  write_file: "#9b6fd4",
  list_dir: "#4db8b0",
}

export function toolColor(name) {
  if (TOOL_COLORS[name]) return TOOL_COLORS[name]
  let hash = 0
  for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash)
  return `hsl(${Math.abs(hash) % 360}, 45%, 45%)`
}

export function toolLabel(name, args = {}) {
  switch (name) {
    case "exec":
      return args.command ? `exec: ${args.command}` : "exec"
    case "web_search":
      return args.query ? `search: ${args.query}` : "web_search"
    case "web_fetch": {
      if (!args.url) return "web_fetch"
      try {
        return `fetch: ${new URL(args.url).hostname}`
      } catch {
        return "web_fetch"
      }
    }
    case "read_file":
      return args.path ? `read: ${args.path}` : "read_file"
    case "write_file":
      return args.path ? `write: ${args.path}` : "write_file"
    case "list_dir":
      return args.path ? `ls: ${args.path}` : "list_dir"
    default:
      return name
  }
}
