import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig(({ mode }) => {
  const emitSourcemaps = mode === "development";

  return {
    // base: process.env.VITE_PUBLIC_URL ? `${process.env.VITE_PUBLIC_URL}/` : '/',
    build: {
      sourcemap: emitSourcemaps ? "inline" : false,
      minify: !emitSourcemaps,
    },
    plugins: [react(), tailwindcss()],
    base: "/",
    resolve: {
      alias: {
        // '@': path.resolve(__dirname, './src'),
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
    // server: {
    //   host: process.env.VITE_DEV_SERVER_HOST || "0.0.0.0",
    //   port: parseInt(process.env.PORT || "8443"),
    //   strictPort: true,
    // },
    // preview: {
    //   host: process.env.VITE_DEV_SERVER_HOST || "0.0.0.0",
    //   port: parseInt(process.env.PORT || "8443"),
    // },
  };
});
