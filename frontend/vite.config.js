import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      process: 'process/browser',
      buffer: 'buffer',
      events: 'events/',
      util: 'util/',
    },
  },
  define: {
    'process.env': {},  // tránh lỗi process.env
    global: 'window',   // một số lib mong có global
  },
  optimizeDeps: {
    include: ['buffer', 'process', 'events', 'util'],
  },
})