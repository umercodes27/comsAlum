import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      state : path.resolve(__dirname, 'src/state'),
      components: path.resolve(__dirname, 'src/components'),
      scenes: path.resolve(__dirname, 'src/scenes'),
      assets: path.resolve(__dirname, 'src/assets'),
      hooks: path.resolve(__dirname, 'src/hooks'),
    },
  },
})
