import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/career-ops/',
  // Build output goes to tracker/dist (Vite default), gitignored; CI deploys it to Pages.
})
