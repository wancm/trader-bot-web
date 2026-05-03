import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const here = import.meta.dirname;

export default defineConfig({
  envDir: 'configs',
  envPrefix: 'VITE_',
  server: {
    port: 5173,
    strictPort: true,
    open: false,
    // The portfolio-manager /ws endpoint uses coder/websocket with default
    // AcceptOptions, which enforces same-origin. Browser connections from
    // :5173 → :8081 get HTTP 403. Proxy through Vite so the browser sees
    // ws://localhost:5173/ws (same-origin to the dev server) and the
    // proxied request looks same-origin to the backend.
    proxy: {
      '/ws': {
        target: 'ws://localhost:8081',
        ws: true,
        changeOrigin: true,
        headers: { origin: 'http://localhost:8081' },
      },
    },
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        home: resolve(here, 'index.html'),
        logViewer: resolve(here, 'log-viewer/index.html'),
      },
    },
  },
});
