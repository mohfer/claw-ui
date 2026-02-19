import { useEffect, useRef } from "react"
import { MessageBubble } from "./MessageBubble"

const SUGGESTIONS = [
  "what's the weather in London today?",
  "show system resource usage",
  "list running processes",
  "what's my public IP address?",
  "show disk usage",
  "what's the latest news?",
  "run neofetch",
  "what time is it in Tokyo?",
  "summarize today's top tech news",
  "check if port 3000 is open",
  "show recent git commits",
  "what's 1 BTC in USD right now?",
]

export function MessageList({ messages, onSuggestion }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center overflow-y-auto">
        <div className="flex flex-col items-center gap-3 text-center p-10 text-[#9a9690]">
          <div className="text-4xl opacity-50">🦞</div>
          <p className="text-sm max-w-[260px] leading-relaxed">
            Ask me anything. I can search for information, execute commands, and much more.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mt-1">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => onSuggestion(s)}
                className="bg-white border border-[#e8e6e0] rounded-full px-[14px] py-[6px] font-sans-dm text-[13px] text-[#9a9690] cursor-pointer transition-colors duration-150 hover:border-[#9a9690] hover:text-[#1a1916]"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5 scroll-smooth [scrollbar-width:thin] [scrollbar-color:#e8e6e0_transparent]">
      {messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
