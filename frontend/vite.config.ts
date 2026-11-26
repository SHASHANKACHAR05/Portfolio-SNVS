import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('three')) return 'vendor-three';
          if (id.includes('ogl')) return 'vendor-ogl';
          if (id.includes('framer-motion') || id.includes('motion')) return 'vendor-motion';
          if (id.includes('gsap') || id.includes('lenis')) return 'vendor-gsap';
          if (id.includes('lucide-react')) return 'vendor-icons';
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      }
    }
  }
})
