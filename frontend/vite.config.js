// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'   // ← this line is critical

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),   // ← add this (can pass options if needed later)
  ],
  server: {
    port: 5173,   // optional
  },
})