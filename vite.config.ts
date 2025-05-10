import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Port de ton frontend
    proxy: {
      '/api': {
        target: 'http://localhost:5180', // URL de ton backend en HTTP
        changeOrigin: true,
        secure: false,
      },
    },
  },
});