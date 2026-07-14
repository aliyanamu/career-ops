import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/career-ops/',
  build: {
    // dashboard/ holds ONLY the built app (gitignored, deployed to Pages via CI).
    outDir: '../dashboard',
    emptyOutDir: true,
  },
})
