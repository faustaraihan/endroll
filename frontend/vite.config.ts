import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Keep in sync with the "@/*" path in tsconfig.app.json
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    // Honour the PORT env var (used by the preview/launch tooling) so the
    // dev server binds to the assigned port; fall back to Vite's default.
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
})
