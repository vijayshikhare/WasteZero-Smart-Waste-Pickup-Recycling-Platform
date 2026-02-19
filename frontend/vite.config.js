// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    // IMPORTANT: Proxy all /api requests to backend
    proxy: {
      // Proxy API calls to backend (port 5000)
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // keep /api prefix
      },
      // Proxy uploaded images/files
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },

    // Optional: open browser on start, use specific port
    port: 5173,
    open: true,
  },

  // Optional: better build output
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});