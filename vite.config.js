import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import Inspect from 'vite-plugin-inspect'
import path from "path";
import autoprefixer from "autoprefixer";
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { testHarness } from "./scripts/testHarness.js";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    resolve: {
      alias: {
        '$lib': path.resolve(__dirname, "src/lib"),
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
      testHarness(),
      viteStaticCopy({
        targets: [
          {
            src: path.resolve(__dirname, `src/atoms/${mode}/main.html`),
            dest: path.resolve(__dirname, `build/${mode}`)
          }
        ]
      }),
      Inspect(),
    ],
    root: path.resolve(__dirname, "src/atoms"),
    build: {
      sourcemap: true,
      lib: {
        entry: path.resolve(__dirname, `src/atoms/${mode}/app.js`),
        name: "atom",
        formats: ["iife"],
        fileName: (_) => "main.js",
      },
      target: "es2015",
      emptyOutDir: true,
      rollupOptions: {
        input: path.resolve(__dirname, `src/atoms/${mode}/app.js`),
        output: {
          dir: path.resolve(__dirname, `build/${mode}`),
        },
      },
    },
  };
});
