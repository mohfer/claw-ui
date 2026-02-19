import { ToolBadge } from "./ToolBadge"
import { renderMarkdown } from "../lib/markdown"

function TypingDots() {
  return (
    <span className="typing-dots">
      <span /><span /><span />
    </span>
  )
}

export function MessageBubble({ message }) {
  const { role, content, tools, isStreaming } = message
  const isEmpty = !content && isStreaming

  return (
    <div className={`message message--${role}`}>
      {tools?.length > 0 && (
        <div className="tool-strip">
          {tools.map((t, i) => (
            <ToolBadge key={i} name={t.name} args={t.args} />
          ))}
        </div>
      )}

      <div className="bubble">
        {isEmpty ? (
          <TypingDots />
        ) : (
          <div
            className="bubble-content"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        )}
        {!isEmpty && isStreaming && <TypingDots />}
      </div>
    </div>
  )
}
