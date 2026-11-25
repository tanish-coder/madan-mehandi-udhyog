import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { smtpServerPlugin } from './src/server/smtpPlugin.ts'

export default defineConfig({
  plugins: [react(), smtpServerPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
