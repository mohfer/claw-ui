import express from "express"
import { spawn } from "child_process"
import { readFileSync } from "fs"
import { homedir } from "os"
import { join } from "path"

const app = express()
app.use(express.json())

const SKIP_PATTERNS = [
  "subagent",
  "in progress",
  "as soon as the result",
  "system rule accepted",
  "rule accepted",
  "rule recorded",
  "rule understood",
  "system note",
]

const SESSION_FILE = join(homedir(), ".picoclaw/workspace/sessions/cli_default.json")

const HIDDEN_TOOLS = ["message"]

function isSkipped(text) {
  return SKIP_PATTERNS.some(p => text.toLowerCase().includes(p))
}

function cleanLine(line) {
  return line
    .replace(/^\ud83e\udd9e\s*/, "")
    .replace(/Goodbye!/, "")
    .trim()
}

function parseToolCall(text) {
  const match = text.match(/Tool call: (\w+)\((\{.*\})\)/)
  if (!match) return null
  const name = match[1]
  if (HIDDEN_TOOLS.includes(name)) return null
  try {
    return { name, args: JSON.parse(match[2]) }
  } catch {
    return { name, args: {} }
  }
}

app.get("/session", (req, res) => {
  try {
    const raw = readFileSync(SESSION_FILE, "utf8")
    const session = JSON.parse(raw)

    const messages = []
    let pendingTools = []

    for (let i = 0; i < session.messages.length; i++) {
      const m = session.messages[i]

      if (m.role === "tool") continue

      if (m.role === "assistant" && m.tool_calls) {
        const tools = m.tool_calls.flatMap(tc => {
          let args = {}
          try { args = JSON.parse(tc.function.arguments || "{}") } catch { }
          const name = tc.function.name

          if (HIDDEN_TOOLS.includes(name)) return []
          return [{ name, args }]
        })
        pendingTools.push(...tools)
        continue
      }

      if (m.role === "assistant" && m.content) {
        messages.push({
          role: "assistant",
          content: m.content,
          tools: pendingTools
        })
        pendingTools = []
        continue
      }

      if (m.role === "user" && m.content) {
        messages.push({
          role: "user",
          content: m.content,
          tools: []
        })
      }
    }

    res.json({ messages })
  } catch (err) {
    res.json({ messages: [] })
  }
})

app.post("/chat", (req, res) => {
  const { message } = req.body
  if (!message) return res.status(400).json({ error: "Message is required" })

  const proc = spawn("/usr/local/bin/picoclaw", ["agent"])
  let output = ""
  let errorOutput = ""

  proc.stdout.on("data", d => { output += d.toString() })
  proc.stderr.on("data", d => { errorOutput += d.toString() })

  proc.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: errorOutput || `Process exited with code ${code}` })
    }
    let cleaned = output
      .replace(/\ud83e\udd9e Interactive mode.*\n/, "")
      .replace(/Goodbye!/, "")
      .trim()

    const parts = cleaned.split("\ud83e\udd9e")
    const raw = parts.length > 1 ? parts[parts.length - 1].trim() : cleaned
    const reply = raw.split("\n").filter(l => !isSkipped(l)).join("\n").trim()
    res.json({ reply })
  })

  proc.stdin.write(`${message}\n`)
  proc.stdin.end()
})

app.get("/chat/stream", (req, res) => {
  const { message } = req.query
  if (!message) return res.status(400).json({ error: "Message is required" })

  res.setHeader("Content-Type", "text/event-stream")
  res.setHeader("Cache-Control", "no-cache")
  res.setHeader("Connection", "keep-alive")
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.flushHeaders()

  const send = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  const proc = spawn("/usr/local/bin/picoclaw", ["agent"])

  let buffer = ""
  let currentBlock = []
  let lastBlock = []
  let closed = false
  let llmStarted = false
  let pendingStdout = []

  proc.stdout.on("data", (data) => {
    buffer += data.toString()
    const lines = buffer.split("\n")
    buffer = lines.pop()

    for (const line of lines) {
      if (line.includes("Interactive mode") || line.includes("Ctrl+C")) continue
      if (line.trim() === "Goodbye!" || line.trim() === "") continue

      const cleaned = cleanLine(line)
      if (!cleaned || isSkipped(cleaned)) continue

      if (!llmStarted) {
        pendingStdout.push(cleaned)
      } else {
        currentBlock.push(cleaned)
        send({ type: "chunk", text: cleaned })
      }
    }
  })

  proc.stderr.on("data", (data) => {
    const text = data.toString()


    if (!llmStarted && (
      text.includes("Tool call:") ||
      text.includes("Sending") ||
      text.includes("tokens") ||
      text.includes("LLM")
    )) {
      llmStarted = true
      pendingStdout = []

    }

    if (text.includes("Tool call:")) {
      const tool = parseToolCall(text)
      if (tool) {
        if (currentBlock.length > 0) {
          lastBlock = currentBlock
          currentBlock = []
        }
        send({ type: "tool", name: tool.name, args: tool.args })
      }
    }

    if (text.includes("LLM response without tool calls")) {
      if (currentBlock.length > 0) {
        lastBlock = currentBlock
        currentBlock = []
      }
      send({ type: "status", text: "Summarizing response..." })
    }
  })

  proc.on("close", (code) => {
    if (closed) return
    closed = true

    if (!llmStarted && pendingStdout.length > 0) {
      for (const line of pendingStdout) {
        currentBlock.push(line)
        send({ type: "chunk", text: line })
      }
    }

    if (buffer.trim()) {
      const cleaned = cleanLine(buffer)
      if (cleaned && !isSkipped(cleaned)) {
        currentBlock.push(cleaned)
        send({ type: "chunk", text: cleaned })
      }
    }

    const finalBlock = currentBlock.length > 0 ? currentBlock : lastBlock
    send({ type: "done", code, reply: finalBlock.join("\n") })
    res.end()

  })

  req.on("close", () => {
    if (!closed) {
      closed = true
      proc.kill()
    }
  })

  proc.stdin.write(`${message}\n`)
  proc.stdin.end()
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {

})