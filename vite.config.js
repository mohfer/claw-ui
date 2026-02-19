import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/chat': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/session': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})
