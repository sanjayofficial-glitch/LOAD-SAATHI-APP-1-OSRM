import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [dyadComponentTagger(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Increase warning threshold (our chunks are intentionally split)
    chunkSizeWarningLimit: 800,

    rollupOptions: {
      output: {
        // Split vendor libraries into separate cached chunks.
        // Users download these ONCE and the browser caches them.
        // Only your app code re-downloads on updates.
        manualChunks: {
          // React core — almost never changes
          "vendor-react": ["react", "react-dom"],

          // React Router — stable
          "vendor-router": ["react-router-dom"],

          // Clerk auth — only loads once
          "vendor-clerk": ["@clerk/clerk-react"],

          // Supabase client
          "vendor-supabase": ["@supabase/supabase-js"],

          // TanStack Query (data fetching)
          "vendor-query": ["@tanstack/react-query"],

          // Radix UI + shadcn components (all grouped — large but stable)
          "vendor-ui": [
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-progress",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-slot",
            "@radix-ui/react-tabs",
          ],

          // Leaflet map
          "vendor-leaflet": ["leaflet", "react-leaflet"],

          // Lucide icons
          "vendor-icons": ["lucide-react"],

          // Lottie animation player
          "vendor-lottie": ["@dotlottie/react-player"],
        },
      },
    },
  },
}));
