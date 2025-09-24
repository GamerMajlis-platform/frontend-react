import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";

// Avoid TS error when @types/node is not installed in this environment
declare const process: {
  cwd(): string;
  env: Record<string, string | undefined>;
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env vars for the current mode; allow specifying VITE_DEV_PORT to force a dev port.
  const env = loadEnv(mode, process.cwd(), "");
  const portFromEnv = env.VITE_DEV_PORT ? Number(env.VITE_DEV_PORT) : undefined;

  // Default developer-friendly behavior: if no VITE_DEV_PORT is set, start at 3000
  // and allow Vite to auto-increment to the next free port (3001, 3002...). If
  // VITE_DEV_PORT is explicitly set we honor it and enable strictPort so startup
  // fails if that port is unavailable.
  const defaultBasePort = 3000;
  const initialPort = portFromEnv ?? defaultBasePort;
  const strict = Boolean(portFromEnv);

  return {
    plugins: [react()],
    server: {
      // Use explicit port if provided; otherwise start at defaultBasePort (3000)
      // and allow auto-increment when occupied.
      port: initialPort,
      strictPort: strict,
      host: true,
    },
    css: {
      postcss: "./postcss.config.js",
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // React core libraries
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-vendor";
            }
            // Router
            if (id.includes("react-router")) {
              return "router-vendor";
            }
            // i18n libraries
            if (id.includes("i18next")) {
              return "i18n-vendor";
            }
            // Icons libraries
            if (id.includes("lucide-react") || id.includes("react-icons")) {
              return "icons-vendor";
            }
            // Large page components
            if (
              id.includes("/src/pages/Home.tsx") ||
              id.includes("/src/pages/Profile.tsx")
            ) {
              return "pages-heavy";
            }
            if (
              id.includes("/src/pages/Chat.tsx") ||
              id.includes("/src/pages/Events.tsx")
            ) {
              return "pages-interactive";
            }
            // Services and utilities
            if (
              id.includes("/src/services/") ||
              id.includes("/src/hooks/") ||
              id.includes("/src/lib/")
            ) {
              return "utils";
            }
            // UI components
            if (
              id.includes("/src/components/shared/") ||
              id.includes("/src/components/media/")
            ) {
              return "ui-components";
            }
            // Everything else goes to main
            return undefined;
          },
        },
        // Better tree shaking
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
      },
      // Reduce chunk size warning limit to encourage better splitting
      chunkSizeWarningLimit: 500,
      // Enable source maps for better debugging in development
      sourcemap: mode === "development",
    },
    // Performance optimizations
    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom"],
      exclude: ["@vite/client", "@vite/env"],
    },
  };
});
