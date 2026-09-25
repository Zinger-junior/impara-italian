/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Client-only SPA. No backend: all data lives in IndexedDB (see src/db).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
  build: { outDir: "dist", sourcemap: true },
  test: {
    // Engine tests run in Node; DOM-dependent tests can opt into jsdom per-file.
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
