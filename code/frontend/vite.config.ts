import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  build: {
    outDir: "dist",
  },
  plugins: [react()],
  optimizeDeps: {
    include: ["lottie-react"],
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // 👇 ADD THIS
  test: {
    environment: "jsdom",
    setupFiles: "./src/setup-tests.ts",
    globals: true,
  },
});
