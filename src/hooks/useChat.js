import { useState, useRef, useCallback, useEffect } from "react"

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`

export function useChat() {
  const [messages, setMessages] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const esRef = useRef(null)
  const streamIdRef = useRef(null)

  useEffect(() => {
    loadSession()
  }, [])

  const loadSession = useCallback(() => {
    setIsLoadingHistory(true)
    fetch("/session")
      .then(r => r.json())
      .then(({ messages }) => {
        const hydrated = messages.map(m => ({
          id: uid(),
          role: m.role,
          content: m.content,
          tools: m.tools || [],
          isStreaming: false,
        }))
        setMessages(hydrated)
      })
      .catch(() => { })
      .finally(() => setIsLoadingHistory(false))
  }, [])

  const addMessage = useCallback((role, content, tools = []) => {
    const msg = { id: uid(), role, content, tools }
    setMessages(prev => [...prev, msg])
    return msg.id
  }, [])

  const sendMessage = useCallback((text) => {
    if (!text.trim() || isStreaming) return

    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }

    const userMsgId = uid()
    const assistantId = uid()

    setMessages(prev => {
      const ended = prev.map(m =>
        m.role === "assistant" && m.isStreaming
          ? { ...m, isStreaming: false }
          : m
      )
      const newMessages = [
        ...ended,
        { id: userMsgId, role: "user", content: text, tools: [], isStreaming: false },
        { id: assistantId, role: "assistant", content: "", tools: [], isStreaming: true },
      ]

      return newMessages
    })

    setIsStreaming(true)

    const streamId = uid()
    streamIdRef.current = streamId
    const url = `/chat/stream?message=${encodeURIComponent(text)}&streamId=${encodeURIComponent(streamId)}`
    const es = new EventSource(url)
    esRef.current = es

    const targetId = assistantId

    es.onmessage = (e) => {
      const data = JSON.parse(e.data)
      setMessages(prev => {
        const streamingIdx = prev.findIndex(m => m.id === targetId)
        if (streamingIdx === -1) return prev
        const updated = [...prev]
        const m = updated[streamingIdx]

        if (data.type === "tool") {
          updated[streamingIdx] = { ...m, tools: [...m.tools, { name: data.name, args: data.args || {} }] }
        } else if (data.type === "chunk") {
          const lastChunk = m.content?.split('\n').pop() || ""
          if (lastChunk !== data.text) {
            updated[streamingIdx] = { ...m, content: m.content ? m.content + "\n" + data.text : data.text }
          }
        } else if (data.type === "done") {
          updated[streamingIdx] = { ...m, content: m.content || data.reply || "", isStreaming: false }
        }
        return updated
      })

      if (data.type === "done") {
        es.close()
        esRef.current = null
        streamIdRef.current = null
        setIsStreaming(false)
      }
    }

    es.onerror = () => {
      es.close()
      esRef.current = null
      streamIdRef.current = null
      setMessages(prev => {
        const streamingIdx = prev.findIndex(m => m.id === targetId)
        if (streamingIdx === -1) return prev
        const updated = [...prev]
        updated[streamingIdx] = {
          ...updated[streamingIdx],
          content: updated[streamingIdx].content || "Failed to connect to the server.",
          isStreaming: false
        }

        return updated
      })
      setIsStreaming(false)
    }
  }, [isStreaming])

  const cancel = useCallback(() => {
    const sid = streamIdRef.current
    if (sid) {
      fetch('/chat/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId: sid })
      }).catch(() => { })
      streamIdRef.current = null
    }

    esRef.current?.close()
    esRef.current = null
    setIsStreaming(false)

    setMessages(prev => {
      if (!prev || prev.length === 0) return prev
      const last = prev[prev.length - 1]
      if (last && last.role === 'assistant' && last.isStreaming) {
        return prev.slice(0, -1)
      }
      return prev.map((m, i) =>
        i === prev.length - 1 && m.isStreaming
          ? { ...m, isStreaming: false }
          : m
      )
    })
  }, [])

  return { messages, isStreaming, isLoadingHistory, sendMessage, cancel, reloadSession: loadSession, addMessage }
}