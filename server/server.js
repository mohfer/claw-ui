import express from "express"
import { spawn } from "child_process"
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs"
import { homedir } from "os"
import { join, dirname } from "path"
import dotenv from "dotenv"

dotenv.config({ path: join(process.cwd(), ".env") })

const app = express()
app.use(express.json())

const runningProcs = new Map()

function ensureDirExists(dir) {
  try {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  } catch (e) {
    console.error(`Failed to create directory ${dir}:`, e)
  }
}

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

const SESSION_FILE = process.env.SESSION_FILE?.replace(/^~(?=$|\/|\\)/, homedir()) || join(homedir(), ".picoclaw/workspace/sessions/cli_default.json")
const PICOCLAW_BIN = process.env.PICOCLAW_BIN || "/usr/local/bin/picoclaw"

const HIDDEN_TOOLS = ["message"]

function isSkipped(text) {
  return SKIP_PATTERNS.some(p => text.toLowerCase().includes(p))
}

const cleanLine = (line) => line.replace(/^\ud83e\udd9e\s*/, "").replace(/Goodbye!/, "").trim()

function safeJsonParse(str, fallback = {}) {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

function parseToolCall(text) {
  const match = text.match(/Tool call: (\w+)\((\{.*\})\)/)
  if (!match) return null
  const name = match[1]
  if (HIDDEN_TOOLS.includes(name)) return null
  const args = safeJsonParse(match[2], {})
  return { name, args }
}

function extractMessagesFromSession(session) {
  const messages = []
  let pendingTools = []

  for (let i = 0; i < session.messages.length; i++) {
    const m = session.messages[i]

    if (m.role === 'tool') continue

    if (m.role === 'assistant' && m.tool_calls) {
      const tools = m.tool_calls.flatMap(tc => {
        let args = {}
        try { args = safeJsonParse(tc.function.arguments || '{}') } catch { }
        const name = tc.function.name
        if (HIDDEN_TOOLS.includes(name)) return []
        return [{ name, args }]
      })
      pendingTools.push(...tools)
      continue
    }

    if (m.role === 'assistant' && m.content) {
      messages.push({ role: 'assistant', content: m.content, tools: pendingTools })
      pendingTools = []
      continue
    }

    if (m.role === 'user' && m.content) {
      messages.push({ role: 'user', content: m.content, tools: [] })
    }
  }

  return messages
}

app.get("/session", (req, res) => {
  try {
    const raw = readFileSync(SESSION_FILE, 'utf8')
    const session = safeJsonParse(raw, { messages: [] })
    const messages = extractMessagesFromSession(session)
    res.json({ messages })
  } catch (err) {
    res.json({ messages: [] })
  }
})

app.get("/chat/stream", (req, res) => {
  const { message } = req.query
  const streamId = req.query.streamId || `${Date.now()}-${Math.random().toString(36).slice(2)}`
  if (!message) return res.status(400).json({ error: "Message is required" })

  const sanitized = message.replace(/\n+/g, " ").trim()

  res.setHeader("Content-Type", "text/event-stream")
  res.setHeader("Cache-Control", "no-cache")
  res.setHeader("Connection", "keep-alive")
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.flushHeaders()

  const send = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }
  startAgentStream({ streamId, sanitized, res, req })
})

function startAgentStream({ streamId, sanitized, res, req }) {
  const proc = spawn(PICOCLAW_BIN, ["agent"])
  runningProcs.set(streamId, proc)

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`)

  let buffer = ''
  let currentBlock = []
  let lastBlock = []
  let isClosed = false
  let isLLMStarted = false
  let pendingStdout = []

  const handleStdoutData = (data) => {
    buffer += data.toString()
    const lines = buffer.split('\n')
    buffer = lines.pop()

    for (const line of lines) {
      if (line.includes('Interactive mode') || line.includes('Ctrl+C')) continue
      if (line.trim() === 'Goodbye!' || line.trim() === '') continue

      const cleaned = cleanLine(line)
      if (!cleaned || isSkipped(cleaned)) continue

      if (!isLLMStarted) pendingStdout.push(cleaned)
      else {
        currentBlock.push(cleaned)
        send({ type: 'chunk', text: cleaned })
      }
    }
  }

  const handleStderrData = (data) => {
    const text = data.toString()

    if (!isLLMStarted && (
      text.includes('Tool call:') ||
      text.includes('Sending') ||
      text.includes('tokens') ||
      text.includes('LLM')
    )) {
      isLLMStarted = true
      pendingStdout = []
    }

    if (text.includes('Tool call:')) {
      const tool = parseToolCall(text)
      if (tool) {
        if (currentBlock.length > 0) {
          lastBlock = currentBlock
          currentBlock = []
        }
        send({ type: 'tool', name: tool.name, args: tool.args })
      }
    }

    if (text.includes('LLM response without tool calls')) {
      if (currentBlock.length > 0) {
        lastBlock = currentBlock
        currentBlock = []
      }
      send({ type: 'status', text: 'Summarizing response...' })
    }
  }

  const handleClose = (code) => {
    if (isClosed) return
    isClosed = true

    if (!isLLMStarted && pendingStdout.length > 0) {
      for (const line of pendingStdout) {
        currentBlock.push(line)
        send({ type: 'chunk', text: line })
      }
    }

    if (buffer.trim()) {
      const cleaned = cleanLine(buffer)
      if (cleaned && !isSkipped(cleaned)) {
        currentBlock.push(cleaned)
        send({ type: 'chunk', text: cleaned })
      }
    }

    const finalBlock = currentBlock.length > 0 ? currentBlock : lastBlock
    send({ type: 'done', code, reply: finalBlock.join('\n') })
    res.end()
    runningProcs.delete(streamId)
  }

  proc.stdout.on('data', handleStdoutData)
  proc.stderr.on('data', handleStderrData)
  proc.on('close', handleClose)

  req.on('close', () => {
    if (!isClosed) {
      isClosed = true
      proc.kill()
      runningProcs.delete(streamId)
    }
  })

  proc.stdin.write(`${sanitized}\n`)
  proc.stdin.end()
}

app.post('/chat/cancel', (req, res) => {
  const { streamId } = req.body || {}
  if (typeof streamId !== 'string' || !streamId) {
    return res.status(400).json({ error: 'streamId is required and must be a string' })
  }

  const proc = runningProcs.get(streamId)
  if (!proc) return res.status(404).json({ error: 'no running process for that streamId' })

  try {
    proc.kill('SIGINT')
    runningProcs.delete(streamId)
    return res.json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
})

app.post('/session/reset', (req, res) => {
  try {
    const dir = dirname(SESSION_FILE)
    ensureDirExists(dir)
    writeFileSync(SESSION_FILE, JSON.stringify({ messages: [] }, null, 2), 'utf8')
    return res.json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})