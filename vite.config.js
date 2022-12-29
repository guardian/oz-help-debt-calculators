import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import Inspect from 'vite-plugin-inspect'
import path from "path";
import autoprefixer from "autoprefixer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    resolve: {
      alias: {
        shared: path.resolve(__dirname, "./shared"),
      },
    },
    css: {
      postcss: {
        plugins: [autoprefixer()],
      },
      devSourcemap: true,
    },
    plugins: [
      svelte({
        configFile: path.resolve(__dirname, "svelte.config.js"),
      }),
      Inspect(),
    ],
    root: path.resolve(__dirname, "atoms"),
    build: {
      sourcemap: true,
      lib: {
        entry: path.resolve(__dirname, `atoms/${mode}/main.js`),
        name: "atom",
        formats: ["iife"],
        fileName: (_) => "main.js",
      },
      target: "es2015",
      emptyOutDir: true,
      rollupOptions: {
        input: path.resolve(__dirname, `atoms/${mode}/main.js`),
        output: {
          dir: path.resolve(__dirname, `build/${mode}`),
        },
      },
    },
  };
});
