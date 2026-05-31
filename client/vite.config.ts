import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Прокси на бэкенд: фронт и API становятся same-origin в dev,
// поэтому httpOnly refresh-cookie работает без sameSite:none/https.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      // именно '/t/' — иначе правило ловит SPA-роуты вроде /teach
      '/t/': { target: 'http://localhost:5000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
})
