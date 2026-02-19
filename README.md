# Claw UI

A minimal, real-time web interface for [PicoClaw](https://github.com/sipeed/picoclaw) — featuring tool call badges, live message streaming, and a simple chat experience.

## Features

- **Real-time UI**: Streamed assistant responses, fast updates.
- **Tool Call Badges**: See when/which tools are triggered by PicoClaw (e.g., exec, search, etc.).
- **Minimalist Chat**: Clean, single-page chat interface.
- **Proxy Backend**: Simple Express server that connects the UI to the PicoClaw agent.

## Project Structure

```
claw-ui/
├── src/
│   ├── components/
│   │   ├── ChatInput.jsx       # Chat input box and send button
│   │   ├── MessageBubble.jsx   # Individual message with tool badge
│   │   ├── MessageList.jsx     # List of chat messages
│   │   └── ToolBadge.jsx       # Renders which tool was called
│   ├── hooks/
│   │   └── useChat.js          # Handles chat state and SSE streaming
│   ├── lib/
│   │   ├── markdown.js         # Simple markdown renderer
│   │   └── toolColor.js        # Tool label and color mapping
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── server/
│   └── server.js               # Express proxy to PicoClaw agent
├── index.html
├── package.json
└── vite.config.js
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the proxy server

```bash
npm run server
```

This starts an Express proxy that connects the UI to your PicoClaw agent (default: `localhost:3000`).

### 3. Start the Vite development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to use the chat UI.

> The Vite config automatically proxies `/chat` requests to the proxy server.

### 4. Build for production

```bash
npm run build
```

- Output is placed in `dist/`.
- Use `npm run preview` or serve `dist/` with any static server.

## Requirements
- Node.js 18+
- A running [PicoClaw](https://github.com/sipeed/picoclaw) agent on your system

## About This Repo (Suggestion)

> **Minimal web UI for PicoClaw, the lightweight AI assistant.**
> - Real-time chat, tool call highlighting, and proxy integration.
> - Built with React, Express, Vite. No heavy dependencies.

Feel free to use this as the About section in your GitHub repository.

---

**Contributions welcome!**

