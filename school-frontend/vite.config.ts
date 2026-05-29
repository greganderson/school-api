import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/students': 'http://localhost:8000',
      '/instructors': 'http://localhost:8000',
      '/courses': 'http://localhost:8000',
      '/course': 'http://localhost:8000',
    },
  },
})
