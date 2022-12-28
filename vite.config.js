import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "shared": path.resolve(__dirname, "./shared"),
    },
  },
  plugins: [svelte()],
  root: "atoms/default",
  build: {
    target: "es2015",
    emptyOutDir: true,
    rollupOptions: {
        output: {
            sourcemap: false,
            format: 'iife',
            dir: path.resolve(__dirname, 'build'),
            // file: path.join(path.resolve(__dirname, 'build'), 'bundle.js'),
            // name: 'default'
        },
    }
  }
});
