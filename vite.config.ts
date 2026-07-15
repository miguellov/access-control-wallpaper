import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/access-control-wallpaper/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: true,
  },
  publicDir: 'public',
})
