import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  test: {
    environment: "node",
    setupFiles: "./src/setupTests.js",
    css: true,
    coverage: { reporter: ["text", "html", "lcov"] },
    globals: true,
  },
  plugins: [react()],
});
