import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  },
  server: {
    port: 3003
  }
})
