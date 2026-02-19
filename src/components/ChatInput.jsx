import { useState, useRef, useEffect } from "react"

export function ChatInput({ onSend, isStreaming }) {
  const [value, setValue] = useState("")
  const textareaRef = useRef(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 140) + "px"
  }, [value])

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const submit = () => {
    const text = value.trim()
    if (!text || isStreaming) return
    onSend(text)
    setValue("")
  }

  return (
    <footer className="px-6 pt-4 pb-6 border-t border-[#e8e6e0] bg-[#f7f6f3] shrink-0">
      <div className="flex items-end gap-2.5 bg-white border border-[#e8e6e0] rounded-2xl px-4 py-2.5 pr-2.5 transition-colors focus-within:border-[#9a9690]">
        <textarea
          ref={textareaRef}
          className="flex-1 bg-transparent border-none outline-none font-sans-dm text-[14.5px] text-[#1a1916] resize-none leading-[1.5] max-h-[140px] min-h-6 overflow-y-auto placeholder:text-[#9a9690] disabled:opacity-50"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          rows={1}
          disabled={isStreaming}
        />
        <button
          className="w-[34px] h-[34px] rounded-[10px] bg-[#1a1916] text-[#f7f6f3] border-none cursor-pointer flex items-center justify-center shrink-0 transition-colors hover:bg-[#d4522a] disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={submit}
          disabled={!value.trim() || isStreaming}
          aria-label="Send"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        </button>
      </div>
      <div className="font-mono-dm text-[11.5px] text-[#9a9690] text-center mt-2.5">
        Enter to send · Shift+Enter for new line
      </div>
    </footer>
  )
}
