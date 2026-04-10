import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 51783,
    host: '127.0.0.1',
    strictPort: false,
    middlewareMode: false,
    hmr: {
      host: 'localhost',
      port: 51783,
      protocol: 'ws',
    },
  },
});
