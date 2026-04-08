import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    proxy: {
      // Dev proxy — all /api/* requests are forwarded to the local backend
      '/api': {
        target: 'https://real-estate-app-1-h2v7.onrender.com',
        changeOrigin: true,
      },
    },
  },

  build: {
    // Output directory (default is dist)
    outDir: 'dist',
    // Warn if any chunk exceeds 600 KB
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split vendor code into a separate chunk for better caching
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});
