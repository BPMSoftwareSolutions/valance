import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    // Configure middleware to serve plugin files correctly
    middlewareMode: false,
    fs: {
      // Allow serving files from the plugins directory
      allow: ['..', 'public/plugins', 'public/json-components']
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  // Ensure static assets are served correctly
  publicDir: 'public',
  // Configure how SPA fallback works
  appType: 'spa'
})
