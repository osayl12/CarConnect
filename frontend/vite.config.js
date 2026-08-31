import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// In plain local dev the backend is reached at localhost:5000. Inside Docker
// Compose, containers can't see each other via localhost, so compose sets
// PROXY_TARGET=http://backend:5000 (the service name) for the frontend
// container instead.
const proxyTarget = process.env.PROXY_TARGET || 'http://localhost:5000';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': { target: proxyTarget, changeOrigin: true },
      '/uploads': { target: proxyTarget, changeOrigin: true },
    },
  },
})
