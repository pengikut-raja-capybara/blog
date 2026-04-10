import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { compression } from 'vite-plugin-compression2'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), ViteImageOptimizer(), compression()],
  base: process.env.GITHUB_ACTIONS ? "/blog/" : "/",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router')) return 'router';
            if (id.includes('react') || id.includes('react-dom')) return 'react';
            if (id.includes('marked') || id.includes('dompurify')) return 'markdown';
            return 'vendor';
          }
        }
      }
    }
  }
})