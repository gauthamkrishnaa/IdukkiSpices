import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";

const htmlPages = Object.fromEntries(
  readdirSync(process.cwd())
    .filter((file) => file.endsWith(".html") && !file.startsWith("google"))
    .map((file) => [file.replace(/\.html$/, ""), resolve(process.cwd(), file)])
);

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: { input: htmlPages }
  },
  server: {
    proxy: {
      "/api": "http://127.0.0.1:3000"
    }
  }
});
