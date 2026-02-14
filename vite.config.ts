import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { crx } from '@crxjs/vite-plugin'
import path from 'path'
import manifest from './public/manifest.json'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    crx({ manifest })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
