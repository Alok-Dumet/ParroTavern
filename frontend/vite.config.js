import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
      proxy: {
      '/api/v1': {
          target: `http://localhost:3000`,
          changeOrigin: true
      },
      }
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress only this specific warning
        if (
          warning.message.includes('PURE')
        ) return;

        warn(warning); // default warning handler
      }
    }
  }
})
