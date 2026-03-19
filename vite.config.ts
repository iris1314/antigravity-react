import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/antigravity-react/', // 絕對的子目錄名稱，徹底解決 GitHub Pages 找不到資源檔的白畫面
})
