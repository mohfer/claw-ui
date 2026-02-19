import { ToolBadge } from "./ToolBadge"
import { renderMarkdown } from "../lib/markdown"

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-0.5">
      <span className="block w-[5px] h-[5px] rounded-full bg-[#9a9690] animate-blink" />
      <span className="block w-[5px] h-[5px] rounded-full bg-[#9a9690] animate-blink-2" />
      <span className="block w-[5px] h-[5px] rounded-full bg-[#9a9690] animate-blink-3" />
    </span>
  )
}

export function MessageBubble({ message }) {
  const { role, content, tools, isStreaming } = message
  const isEmpty = !content && isStreaming
  const isUser = role === "user"

  return (
    <div className={`flex flex-col gap-1.5 animate-fade-up ${isUser ? "items-end" : "items-start"}`}>
      {tools?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tools.map((t, i) => (
            <ToolBadge key={i} name={t.name} args={t.args} />
          ))}
        </div>
      )}

      <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-[14.5px] leading-[1.65] ${isUser
        ? "bg-[#1a1916] text-[#f7f6f3] rounded-br-lg"
        : "bg-white border border-[#e8e6e0] rounded-bl-lg"
        }`}>
        {isEmpty ? (
          <TypingDots />
        ) : (
          <div
            className="
              bubble-content
              [&_strong]:font-medium
              [&_em]:italic [&_em]:text-[#9a9690]
              [&_code]:font-mono-dm [&_code]:text-[12.5px] [&_code]:bg-[#f2f1ee] [&_code]:px-[5px] [&_code]:py-px [&_code]:rounded
              [&_p]:mb-1 last:[&_p]:mb-0
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-[3px] [&_ul]:my-1
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:flex [&_ol]:flex-col [&_ol]:gap-[3px] [&_ol]:my-1
              [&_a]:text-[#d4522a] [&_a]:no-underline [&_a]:border-b [&_a]:border-current
              [&_br]:hidden
            "
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        )}
        {!isEmpty && isStreaming && <TypingDots />}
      </div>
    </div>
  )
}