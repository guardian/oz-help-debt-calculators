import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";
import autoprefixer from "autoprefixer";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      shared: path.resolve(__dirname, "./shared"),
    },
  },
  css: {
    postcss: {
      plugins: [autoprefixer()],
    },
  },
  plugins: [
    svelte({
      configFile: path.resolve(__dirname, "svelte.config.js"),
    }),
  ],
  root: path.resolve(__dirname, "atoms"),
  build: {
    lib: {
      entry: path.resolve(__dirname, "atoms/default/main.js"),
      name: "atom",
      formats: ["iife"],
      fileName: (format) => "main.js",
    },
    target: "es2015",
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, "atoms/default/main.js"),
      output: {
        sourcemap: true,
        dir: path.resolve(__dirname, "build/default"),
      },
    },
  },
});
