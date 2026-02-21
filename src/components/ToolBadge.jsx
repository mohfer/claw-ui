import { useState } from "react"
import { toolColor, toolLabel } from "../lib/toolColor"
import { getTextToCopy, tryOpenUrl, copyToClipboard } from "../lib/toolBadgeUtils"

export function ToolBadge({ name, args }) {
  const color = toolColor(name)
  const label = toolLabel(name, args)
  const [feedback, setFeedback] = useState("")

  const handleClick = async () => {
    try {
      const openUrl = tryOpenUrl(name, args)
      if (openUrl) {
        window.open(openUrl, '_blank', 'noopener')
        setFeedback('Opened')
        setTimeout(() => setFeedback(''), 1200)
        return
      }

      const text = getTextToCopy(name, args, label)
      const ok = await copyToClipboard(text)
      if (ok) {
        setFeedback('Copied')
        setTimeout(() => setFeedback(''), 1200)
      }
    } catch (err) {
      console.error('Error handling tool badge click:', err)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center justify-start gap-[5px] bg-[#f2f1ee] text-[#6b6860] font-mono-dm text-[11px] px-[9px] py-[3px] rounded-full border border-[#e8e6e0] animate-fade-up-fast cursor-pointer text-left"
      title={feedback ? feedback : 'Copy'}
    >
      <span
        className="w-[5px] h-[5px] rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      {feedback ? feedback : label}
    </button>
  )
}
