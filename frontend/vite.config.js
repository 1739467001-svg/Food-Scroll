import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// base：部署到 GitHub Pages 等子路径时需要设置。通过 VITE_BASE 注入，
// 例如 GitHub Pages 仓库 food-scroll 对应 base="/food-scroll/"。
// 本地开发/Docker 部署不设置该变量时默认为根路径 "/"。
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
