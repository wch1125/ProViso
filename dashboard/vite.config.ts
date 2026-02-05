import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => ({
  // Use /ProViso/ base path for production (GitHub Pages), / for dev
  base: mode === 'production' ? '/ProViso/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Allow importing from parent proviso package
      '@proviso': path.resolve(__dirname, '../dist'),
    },
  },
  // Optimize dependencies - include proviso interpreter
  optimizeDeps: {
    include: [],
  },
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React vendor bundle
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Charting library (large)
          'vendor-charts': ['recharts'],
          // Icons library
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
}))
