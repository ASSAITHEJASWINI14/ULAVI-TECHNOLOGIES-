import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    proxy: {
      '/transcribe': { target: 'http://localhost:8000', changeOrigin: true },
      '/send-email': { target: 'http://localhost:8000', changeOrigin: true },
      '/history': { target: 'http://localhost:8000', changeOrigin: true },
      '/email-outbox': { target: 'http://localhost:8000', changeOrigin: true },
      '/smtp-config': { target: 'http://localhost:8000', changeOrigin: true },
      '/api': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
});
