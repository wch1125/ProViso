import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Single build target: the whole dashboard, served from proviso.finance.
 *
 * This previously built twice — a public marketing bundle and a separate
 * bundle gated behind Cloudflare Access — with a plugin that failed the build
 * if a demo module reached the public graph. That split was removed: it cost
 * real functionality and protected nothing, because any auth scheme still
 * hands the authenticated browser the entire bundle. What actually protects
 * the work is the proprietary licence and a private source repository.
 */
export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // The interpreter, built from the parent package into ../dist
      '@proviso': path.resolve(__dirname, '../dist'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
})
