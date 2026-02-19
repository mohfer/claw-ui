import { toolColor, toolLabel } from "../lib/toolColor"

export function ToolBadge({ name, args }) {
  const color = toolColor(name)
  const label = toolLabel(name, args)

  return (
    <span
      className="inline-flex items-center gap-[5px] bg-[#f2f1ee] text-[#6b6860] font-mono-dm text-[11px] px-[9px] py-[3px] rounded-full border border-[#e8e6e0] animate-fade-up-fast"
    >
      <span
        className="w-[5px] h-[5px] rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  )
}
