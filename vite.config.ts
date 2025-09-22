import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true, // Fail if port 3000 is in use instead of trying another port
    host: true,
  },
  css: {
    postcss: "./postcss.config.js",
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "i18n-vendor": [
            "i18next",
            "react-i18next",
            "i18next-browser-languagedetector",
            "i18next-http-backend",
          ],
        },
      },
    },
  },
});
