# Claw UI

A minimal, real-time web interface for [PicoClaw](https://github.com/sipeed/picoclaw) with live streaming and a simple chat experience.

## Features

- **Real-time UI**: Streamed assistant responses, fast updates.
- **Tool Call Badges**: See when/which tools are triggered by PicoClaw (e.g., exec, search, etc.).
- **Minimalist Chat**: Clean, single-page chat interface.
- **Proxy Backend**: Simple Express server that connects the UI to the PicoClaw agent.
- **Reset Session**: Easily clear and restart your chat session.

## Demo

<video src="./assets/demo.mp4" controls width="100%"></video>

## Configuration

Claw UI uses a proxy server to connect the web interface with your PicoClaw agent. You can customize paths and ports using a `.env` file in the project root.

- **Session File Path:**  
  By default, chat history is read from:  
  `~/.picoclaw/workspace/sessions/cli_default.json`  
  To change this, set the `SESSION_FILE` variable in your `.env` file:
  ```env
  SESSION_FILE=/path/to/your/session.json
  ```

- **PicoClaw Agent Path:**  
  The proxy server launches the PicoClaw agent from:  
  `/usr/local/bin/picoclaw`  
  If your PicoClaw binary is in a different location, set the `PICOCLAW_BIN` variable in your `.env` file:
  ```env
  PICOCLAW_BIN=/path/to/picoclaw
  ```

- **Port Configuration:**  
  The proxy server listens on port `3001` by default, and the frontend on port `5173`.  
  To change these, set the variables in your `.env` file:
  ```env
  PORT=4000
  VITE_PORT=5174
  ```

> **Note:** This project is primarily tested on Linux. Customizations might be needed for other operating systems.

## Requirements
- Node.js 18+
- A running [PicoClaw](https://github.com/sipeed/picoclaw) agent on your system

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Copy environment config

If you need custom configuration, copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` as needed for your setup.

### 3. Run the proxy server

```bash
pnpm run server
```

This starts an Express proxy that connects the UI to your PicoClaw agent (default: `localhost:3001`).

### 4. Start the Vite development server

```bash
pnpm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to use the chat UI.

> The Vite dev server automatically proxies `/chat` and `/session` requests to the backend proxy server.

### 5. Build for production

```bash
pnpm run build
```

- Output is placed in `dist/`.
- Use `pnpm run preview` or serve `dist/` with any static server.