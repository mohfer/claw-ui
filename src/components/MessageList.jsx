import { useEffect, useRef } from "react"
import { MessageBubble } from "./MessageBubble"

const SUGGESTIONS = [
  "how's the weather in London today?",
  "run neofetch",
  "what's the disk usage?",
  "current CPU temperature",
  "show me the latest news",
  "what time is it?",
  "tell me a joke",
  "convert 100 USD to EUR",
]

export function MessageList({ messages, onSuggestion }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="messages messages--empty">
        <div className="empty-state">
          <div className="empty-icon">🦞</div>
          <p>Ask me anything. I can search for information, execute commands, and much more.</p>
          <div className="suggestions">
            {SUGGESTIONS.map(s => (
              <button key={s} className="suggestion" onClick={() => onSuggestion(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="messages">
      {messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
