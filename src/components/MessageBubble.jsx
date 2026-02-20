import { useEffect, useRef } from "react"
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
  const contentRef = useRef(null)

  useEffect(() => {
    const root = contentRef.current
    if (!root) return

    const pres = root.querySelectorAll('pre')
    pres.forEach(pre => {
      if (pre.dataset.copyEnhanced) return
      pre.dataset.copyEnhanced = '1'
      pre.style.position = 'relative'

      const btn = document.createElement('button')
      btn.type = 'button'
      btn.innerText = 'Copy'
      btn.className = 'absolute top-2 right-2 text-[12px] px-2 py-1 rounded bg-white border border-[#e8e6e0] text-[#1a1916] hover:bg-[#d4522a] hover:text-white transition-colors'
      btn.style.zIndex = 5

      btn.addEventListener('click', async (ev) => {
        ev.stopPropagation()
        const extractCodeText = () => {
          const codeEl = pre.querySelector('code')
          if (codeEl) return codeEl.innerText
          let text = ''
          pre.childNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === 'button') return
            if (node.nodeType === Node.TEXT_NODE) text += node.textContent
            else text += node.innerText || node.textContent || ''
          })
          return text
        }

        const codeText = extractCodeText()
        try {
          const copyFallback = (text) => {
            return new Promise((resolve) => {
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
                resolve(Boolean(ok))
              } catch (e) {
                resolve(false)
              }
            })
          }

          let ok = false
          if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
              await navigator.clipboard.writeText(codeText)
              ok = true
            } catch (e) {
              ok = await copyFallback(codeText)
            }
          } else {
            ok = await copyFallback(codeText)
          }



          const prev = btn.innerText
          btn.innerText = ok ? 'Copied' : 'Copy'
          setTimeout(() => { btn.innerText = prev }, 1200)
        } catch (err) {
        }
      })

      pre.appendChild(btn)
    })

    return () => {
      const pres2 = root.querySelectorAll('pre')
      pres2.forEach(pre => {
        const btn = pre.querySelector('button')
        if (btn) btn.remove()
        delete pre.dataset.copyEnhanced
        pre.style.position = ''
      })
    }
  }, [content])

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

              [&_p]:mb-2 [&_p:last-child]:mb-0

              [&_strong]:font-semibold
              [&_em]:italic [&_em]:text-[#9a9690]
              [&_del]:line-through [&_del]:opacity-60

              [&_h1]:text-[1.2em] [&_h1]:font-semibold [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:first:mt-0
              [&_h2]:text-[1.1em] [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h2]:first:mt-0
              [&_h3]:text-[1em] [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:first:mt-0
              [&_h4]:text-[0.95em] [&_h4]:font-semibold [&_h4]:mt-2 [&_h4]:mb-1 [&_h4]:first:mt-0

              [&_code]:font-mono-dm [&_code]:text-[12.5px] [&_code]:bg-[#f2f1ee] [&_code]:px-[5px] [&_code]:py-px [&_code]:rounded
              [&_pre]:bg-[#f2f1ee] [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:text-[12.5px]
              [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:rounded-none [&_pre_code]:font-mono-dm

              [&_blockquote]:border-l-2 [&_blockquote]:border-[#e8e6e0] [&_blockquote]:pl-3 [&_blockquote]:my-2 [&_blockquote]:text-[#6b6860] [&_blockquote]:italic

              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-[3px] [&_ul]:my-1.5
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:flex [&_ol]:flex-col [&_ol]:gap-[3px] [&_ol]:my-1.5
              [&_li_p]:mb-0

              [&_hr]:border-none [&_hr]:border-t [&_hr]:border-[#e8e6e0] [&_hr]:my-3

              [&_table]:w-full [&_table]:my-2 [&_table]:text-[13px] [&_table]:border-collapse
              [&_th]:text-left [&_th]:font-semibold [&_th]:px-2.5 [&_th]:py-1.5 [&_th]:border [&_th]:border-[#e8e6e0] [&_th]:bg-[#f7f6f3]
              [&_td]:px-2.5 [&_td]:py-1.5 [&_td]:border [&_td]:border-[#e8e6e0]
              [&_tr:nth-child(even)_td]:bg-[#faf9f7]

              [&_a]:text-[#d4522a] [&_a]:no-underline [&_a]:border-b [&_a]:border-current [&_a:hover]:opacity-80
            "
            ref={contentRef}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        )}
        {!isEmpty && isStreaming && <TypingDots />}
      </div>
    </div>
  )
}