import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Output directory at project root to satisfy Vercel's default "dist" expectation
    outDir: '../dist',
  },
})
