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
  optimizeDeps: {
    exclude: ["posthog-js"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
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

          // Leaflet maps — only loads on map-heavy pages (trip/shipment detail)
          "vendor-leaflet": ["leaflet", "react-leaflet", "react-leaflet-cluster", "leaflet.heat", "leaflet.markercluster"],

          // Recharts — only loads on dashboard / chart pages
          "vendor-recharts": ["recharts"],

          // TanStack Query (data fetching)
          "vendor-query": ["@tanstack/react-query"],

          // Framer Motion — animation library (kept out of the app shell)
          "vendor-motion": ["framer-motion"],

          // Forms + validation
          "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod", "class-variance-authority"],

          // Toast notifications
          "vendor-sonner": ["sonner"],

          // Radix UI + shadcn components (all grouped — large but stable)
          "vendor-ui": [
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-aspect-ratio",
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-collapsible",
            "@radix-ui/react-context-menu",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-hover-card",
            "@radix-ui/react-label",
            "@radix-ui/react-menubar",
            "@radix-ui/react-navigation-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-progress",
            "@radix-ui/react-radio-group",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slider",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-toggle",
            "@radix-ui/react-toggle-group",
            "@radix-ui/react-tooltip",
          ],

          // Lucide icons
          "vendor-icons": ["lucide-react"],
        },
      },
    },
  },
}));
