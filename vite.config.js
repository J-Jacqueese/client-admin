import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 打包后希望 html/js/css 都在同一层目录下（不落到 assets/ 子目录），并且 html 命名为 model.html
  // base 使用相对路径，便于通过 /model.html 直接访问
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    // 让打包产物（js/css/图片字体等）尽量都落到 dist 根目录
    // 注：某些 Vite 版本如果不接受空字符串，可改成 assetsDir: '.'
    assetsDir: '',
    rollupOptions: {
      // 入口 HTML 改为 model.html，从而打包输出文件名也是 model.html
      input: 'model.html',
      output: {
        entryFileNames: '[name]-[hash].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]'
      }
    }
  },
  server: {
    port: 5174,
    proxy: {
      // 开发环境代理到后端的 /model_api 前缀
      '/model_api': {
        // 如果配置了 VITE_API_PROXY_TARGET 就走环境变量，否则默认直连线上接口
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:3000/model_api/',
        changeOrigin: true
      }
    }
  }
})
