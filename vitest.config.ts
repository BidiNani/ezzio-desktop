import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    include: [
      "src/**/*.{test,spec}.{ts,tsx,js,jsx}",
      "test/**/*.{test,spec}.{ts,tsx,js,jsx}",
      "tests/**/*.{test,spec}.{ts,tsx,js,jsx}",
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/e2e/**",
      "**/.{idea,git,cache,output,temp}/**",
    ],
  },
});