import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    // Web3Auth dimuat lewat dynamic import saat user klik connect. Tanpa
    // include, Vite baru menemukannya belakangan lalu re-optimize di tengah
    // jalan, sehingga URL lama jadi 504 "Failed to fetch dynamically imported
    // module". Dengan include, semuanya di-prebundle sejak server start.
    include: [
      'ethers',
      '@web3auth/no-modal',
      '@web3auth/base',
      '@web3auth/auth',
      '@web3auth/auth-adapter',
    ],
    esbuildOptions: {
      define: { global: 'globalThis' },
    },
  },
});