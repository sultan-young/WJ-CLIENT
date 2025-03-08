import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://192.168.1.4:5000', // 后端开发服务器地址
        changeOrigin: true
      }
    }
  },
})