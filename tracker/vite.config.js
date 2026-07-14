import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/career-ops/',
  build: {
    outDir: '../docs',
    // docs/ also holds project documentation + images, so DO NOT wipe it on build.
    // Only the app's index.html + assets/ get overwritten; stale hashed assets are
    // pruned manually.
    emptyOutDir: false,
  },
})
