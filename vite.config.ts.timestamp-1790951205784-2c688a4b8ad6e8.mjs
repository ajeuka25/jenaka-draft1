// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.js";
import { fileURLToPath, URL } from "node:url";
var __vite_injected_original_import_meta_url = "file:///home/project/vite.config.ts";
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  define: {
    global: "globalThis"
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
    // Web3Auth dimuat lewat dynamic import saat user klik connect. Tanpa
    // include, Vite baru menemukannya belakangan lalu re-optimize di tengah
    // jalan, sehingga URL lama jadi 504 "Failed to fetch dynamically imported
    // module". Dengan include, semuanya di-prebundle sejak server start.
    include: [
      "ethers",
      "buffer",
      "@web3auth/no-modal",
      "@web3auth/base",
      "@web3auth/auth",
      "@web3auth/auth-adapter",
      "@web3auth/ethereum-provider",
      "@web3auth/ethereum-provider"
    ],
    esbuildOptions: {
      define: { global: "globalThis" }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tICdub2RlOnVybCc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgfSxcbiAgfSxcbiAgZGVmaW5lOiB7XG4gICAgZ2xvYmFsOiAnZ2xvYmFsVGhpcycsXG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGV4Y2x1ZGU6IFsnbHVjaWRlLXJlYWN0J10sXG4gICAgLy8gV2ViM0F1dGggZGltdWF0IGxld2F0IGR5bmFtaWMgaW1wb3J0IHNhYXQgdXNlciBrbGlrIGNvbm5lY3QuIFRhbnBhXG4gICAgLy8gaW5jbHVkZSwgVml0ZSBiYXJ1IG1lbmVtdWthbm55YSBiZWxha2FuZ2FuIGxhbHUgcmUtb3B0aW1pemUgZGkgdGVuZ2FoXG4gICAgLy8gamFsYW4sIHNlaGluZ2dhIFVSTCBsYW1hIGphZGkgNTA0IFwiRmFpbGVkIHRvIGZldGNoIGR5bmFtaWNhbGx5IGltcG9ydGVkXG4gICAgLy8gbW9kdWxlXCIuIERlbmdhbiBpbmNsdWRlLCBzZW11YW55YSBkaS1wcmVidW5kbGUgc2VqYWsgc2VydmVyIHN0YXJ0LlxuICAgIGluY2x1ZGU6IFtcbiAgICAgICdldGhlcnMnLFxuICAgICAgJ2J1ZmZlcicsXG4gICAgICAnQHdlYjNhdXRoL25vLW1vZGFsJyxcbiAgICAgICdAd2ViM2F1dGgvYmFzZScsXG4gICAgICAnQHdlYjNhdXRoL2F1dGgnLFxuICAgICAgJ0B3ZWIzYXV0aC9hdXRoLWFkYXB0ZXInLFxuICAgICAgJ0B3ZWIzYXV0aC9ldGhlcmV1bS1wcm92aWRlcicsXG4gICAgICAnQHdlYjNhdXRoL2V0aGVyZXVtLXByb3ZpZGVyJyxcbiAgICBdLFxuICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICBkZWZpbmU6IHsgZ2xvYmFsOiAnZ2xvYmFsVGhpcycgfSxcbiAgICB9LFxuICB9LFxufSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLG9CQUFvQjtBQUN0UCxPQUFPLFdBQVc7QUFDbEIsU0FBUyxlQUFlLFdBQVc7QUFGK0YsSUFBTSwyQ0FBMkM7QUFLbkwsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssY0FBYyxJQUFJLElBQUksU0FBUyx3Q0FBZSxDQUFDO0FBQUEsSUFDdEQ7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixRQUFRO0FBQUEsRUFDVjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLGNBQWM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBS3hCLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLGdCQUFnQjtBQUFBLE1BQ2QsUUFBUSxFQUFFLFFBQVEsYUFBYTtBQUFBLElBQ2pDO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
