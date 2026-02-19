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
    <footer className="footer">
      <div className="input-wrap">
        <textarea
          ref={textareaRef}
          className="input"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          rows={1}
          disabled={isStreaming}
        />
        <button
          className="send-btn"
          onClick={submit}
          disabled={!value.trim() || isStreaming}
          aria-label="Send"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        </button>
      </div>
      <div className="hint">Enter to send · Shift+Enter for new line</div>
    </footer>
  )
}
