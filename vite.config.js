import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: [
        "**/venv/**",
        "**/backend-flask/**",
        "**/.git/**",
        "**/dist/**",
      ],
    },
    // Useful for local dev networking if needed
    host: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'], // Sometimes helps with very large icon sets if pre-bundling is slow
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./frontend/src"),
    },
  },
});
