import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'circular-natal-horoscope-js': 'circular-natal-horoscope-js/dist/index.js',
    },
  },
  optimizeDeps: {
    include: ['circular-natal-horoscope-js'],
  },
})
