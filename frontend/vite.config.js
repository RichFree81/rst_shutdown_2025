import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
export default defineConfig({
    root: resolve(__dirname, "."),
    plugins: [react()],
    server: { port: 5173, open: true },
    build: { outDir: "dist" },
    resolve: { alias: { "@": resolve(__dirname, "src") } }
});
