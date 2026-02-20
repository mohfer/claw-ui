import { useState } from "react"
import { toolColor, toolLabel } from "../lib/toolColor"

export function ToolBadge({ name, args }) {
  const color = toolColor(name)
  const label = toolLabel(name, args)
  const [feedback, setFeedback] = useState("")

  const handleClick = async () => {
    try {
      let textToCopy = label
      if (args && typeof args === 'object' && Object.keys(args).length) {
        if (typeof args.command === 'string' && args.command) textToCopy = args.command
        else if (typeof args.cmd === 'string' && args.cmd) textToCopy = args.cmd
        else if (typeof args.path === 'string' && args.path) textToCopy = args.path
        else if (typeof args.directory === 'string' && args.directory) textToCopy = args.directory
        else if (typeof args.dir === 'string' && args.dir) textToCopy = args.dir
        else if (typeof args.url === 'string' && args.url) textToCopy = args.url
        else if (typeof args.query === 'string' && args.query) textToCopy = args.query
        else if (typeof args.prompt === 'string' && args.prompt) textToCopy = args.prompt
        else textToCopy = JSON.stringify({ name, args })
      }

      if (name === 'web_fetch' || name === 'web_search') {
        let openUrl = null
        if (args && typeof args.url === 'string' && args.url) openUrl = args.url
        else if (name === 'web_search' && args && typeof args.query === 'string' && args.query) {
          openUrl = `https://www.google.com/search?q=${encodeURIComponent(args.query)}`
        }

        if (openUrl) {
          try {
            window.open(openUrl, '_blank', 'noopener')
            setFeedback('Opened')
            setTimeout(() => setFeedback(''), 1200)
            return
          } catch (e) {
            console.error('Failed to open URL:', e)
          }
        }
      }

      const copyFallback = (text) => {
        try {
          const ta = document.createElement('textarea')
          ta.value = text
          ta.style.position = 'fixed'
          ta.style.left = '-9999px'
          document.body.appendChild(ta)
          ta.focus()
          ta.select()
          const ok = document.execCommand && document.execCommand('copy')
          document.body.removeChild(ta)
          return Boolean(ok)
        } catch (e) {
          return false
        }
      }

      let ok = false
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(textToCopy)
          ok = true
        } catch (e) {
          ok = copyFallback(textToCopy)
        }
      } else {
        ok = copyFallback(textToCopy)
      }

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
      className="inline-flex items-center gap-[5px] bg-[#f2f1ee] text-[#6b6860] font-mono-dm text-[11px] px-[9px] py-[3px] rounded-full border border-[#e8e6e0] animate-fade-up-fast cursor-pointer"
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
