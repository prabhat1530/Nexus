import { defineConfig, createLogger } from 'vite';
import react from '@vitejs/plugin-react';

// Custom logger that silences proxy errors
const logger = createLogger();
const origError = logger.error.bind(logger);
logger.error = (msg, options) => {
  if (typeof msg === 'string' && msg.includes('proxy')) return;
  origError(msg, options);
};

export default defineConfig({
  plugins: [react()],
  customLogger: logger,
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', () => {});
          proxy.on('proxyReq', (p, req) => { req.on('error', () => {}); });
          proxy.on('proxyRes', (p) => { p.on('error', () => {}); });
        },
      },
      '/socket.io': {
        target: 'http://127.0.0.1:5001',
        ws: true,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', () => {});
          proxy.on('proxyReq', (p, req) => { req.on('error', () => {}); });
          proxy.on('proxyRes', (p) => { p.on('error', () => {}); });
        },
      },
      '/uploads': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', () => {});
        },
      },
    },
  },
});
