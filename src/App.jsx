import { useCallback } from "react"
import { useChat } from "./hooks/useChat"
import { MessageList } from "./components/MessageList"
import { ChatInput } from "./components/ChatInput"

export default function App() {
  const { messages, isStreaming, isLoadingHistory, sendMessage } = useChat()

  const handleSuggestion = useCallback((text) => {
    sendMessage(text)
  }, [sendMessage])

  if (isLoadingHistory) {
    return (
      <div className="app">
        <header className="header">
          <div className="logo">
            <span className="logo-dot" />
            Claw UI
          </div>
        </header>
        <div className="messages messages--empty">
          <div className="empty-state">
            <div className="empty-icon">🦞</div>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading history...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className={`logo-dot ${isStreaming ? "logo-dot--active" : ""}`} />
          Claw UI
        </div>
      </header>

      <MessageList
        messages={messages}
        onSuggestion={handleSuggestion}
      />

      <ChatInput
        onSend={sendMessage}
        isStreaming={isStreaming}
      />
    </div>
  )
}
