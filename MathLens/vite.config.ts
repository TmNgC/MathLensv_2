import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1',
  },
  build: {
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: [
            { name: 'three', test: /node_modules[/\\](three|@react-three)[/\\]/ },
            { name: 'math', test: /node_modules[/\\](mathjs|mathlive|math-json)[/\\]/ },
            { name: 'katex', test: /node_modules[/\\]katex[/\\]/ },
            { name: 'vendor', test: /node_modules/ },
          ],
        },
      },
    },
  },
})
