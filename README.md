# claw-ui

Web UI untuk [PicoClaw](https://github.com/sipeed/picoclaw) — minimalis, real-time, dengan tool badge.

## Struktur

```
claw-ui/
├── src/
│   ├── components/
│   │   ├── ChatInput.jsx       # Input textarea + send button
│   │   ├── MessageBubble.jsx   # Bubble pesan + tool badges
│   │   ├── MessageList.jsx     # List semua pesan + empty state
│   │   └── ToolBadge.jsx       # Badge tool calling (exec, search, dll)
│   ├── hooks/
│   │   └── useChat.js          # Logic SSE streaming + state messages
│   ├── lib/
│   │   ├── markdown.js         # Render markdown sederhana
│   │   └── toolColor.js        # Warna + label per tool
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── server/
│   └── server.js               # Express proxy ke picoclaw
├── index.html
├── package.json
└── vite.config.js
```

## Setup

### 1. Install dependencies

```bash
npm install
```

Tambahkan express untuk server:

```bash
npm install express
```

### 2. Jalankan proxy server

```bash
node server/server.js
```

### 3. Jalankan dev server Vite

```bash
npm run dev
```

Buka `http://localhost:5173`

> Vite proxy `/chat` ke `localhost:3000` otomatis via `vite.config.js`

## Build production

```bash
npm run build
```

Output di `dist/` — serve dengan nginx atau `npm run preview`.
