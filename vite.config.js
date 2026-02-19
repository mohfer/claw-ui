import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const frontendPort = parseInt(process.env.VITE_PORT) || 5173;
const backendPort = parseInt(process.env.PORT) || 3001;

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: frontendPort,
    proxy: {
      '/chat': {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true,
      },
      '/session': {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true,
      }
    }
  }
})
