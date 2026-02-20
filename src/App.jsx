import { useCallback, useEffect } from "react"
import { useChat } from "./hooks/useChat"
import { MessageList } from "./components/MessageList"
import { ChatInput } from "./components/ChatInput"

export default function App() {
  const { messages, isStreaming, isLoadingHistory, sendMessage, cancel } = useChat()

  const handleSuggestion = useCallback((text) => {
    sendMessage(text)
  }, [sendMessage])

  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (!isStreaming) return
      e.preventDefault()
      e.returnValue = 'A response is in progress. Refreshing will stop it.'
      return e.returnValue
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isStreaming])

  if (isLoadingHistory) {
    return (
      <div className="flex flex-col h-screen max-w-2xl mx-auto">
        <header className="flex items-center px-6 pt-5 pb-4 border-b border-[#e8e6e0] bg-[#f7f6f3] shrink-0">
          <div className="font-mono-dm text-[13px] font-medium tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9a9690] shrink-0" />
            Claw UI
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-[#9a9690]">
            <div className="text-3xl opacity-50">🦞</div>
            <p className="text-sm">Loading history...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      <header className="flex items-center px-6 pt-5 pb-4 border-b border-[#e8e6e0] bg-[#f7f6f3] shrink-0">
        <div className="font-mono-dm text-[13px] font-medium tracking-wide flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 transition-colors duration-300 ${isStreaming
            ? "bg-[#d4522a] animate-pulse-dot"
            : "bg-[#9a9690]"
            }`} />
          Claw UI
        </div>
      </header>

      <MessageList messages={messages} onSuggestion={handleSuggestion} />
      <ChatInput onSend={sendMessage} isStreaming={isStreaming} onCancel={cancel} />
    </div>
  )
}
