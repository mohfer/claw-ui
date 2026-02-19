import { toolColor, toolLabel } from "../lib/toolColor"

export function ToolBadge({ name, args }) {
  const color = toolColor(name)
  const label = toolLabel(name, args)

  return (
    <span className="tool-badge" style={{ "--dot-color": color }}>
      <span className="tool-dot" />
      {label}
    </span>
  )
}
