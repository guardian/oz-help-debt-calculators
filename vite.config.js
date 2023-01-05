import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import Inspect from 'vite-plugin-inspect'
import path from "path";
import autoprefixer from "autoprefixer";
import { viteStaticCopy } from 'vite-plugin-static-copy';
import replace from '@rollup/plugin-replace';
import { testHarness } from "./scripts/testHarness.js";

const assetsPath = process.env.ATOM_ASSETS_PATH || "";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    resolve: {
      alias: {
        '$lib': path.resolve(__dirname, "src/lib"),
        '$assets': path.resolve(__dirname, "src/assets"),
      },
    },
    esbuild: {
      // remove console.log and debugger statements from production builds
      drop: ["debugger"],
      pure: ["console.log", "console.error", "console.warn", "console.debug", "console.trace"],
    },
    css: {
      postcss: {
        plugins: [autoprefixer()],
      },
      devSourcemap: true,
    },
    plugins: [
      replace({
        values: {
          __assetsPath__: assetsPath,
        },
        preventAssignment: true,
      }),

      svelte({
        configFile: path.resolve(__dirname, "svelte.config.js"),
      }),

      // TODO: only run on serve
      testHarness(),

      // TODO: only run on build
      viteStaticCopy({
        targets: [
          {
            src: path.resolve(__dirname, `src/atoms/${mode}/main.html`),
            dest: path.resolve(__dirname, `build/${mode}`)
          },
          {
            src: path.resolve(__dirname, 'src/assets/**/*'),
            dest: path.resolve(__dirname, `build/assets`)
          }
        ]
      }),
      
      Inspect(),
    ],
    root: path.resolve(__dirname, "src/atoms"),
    publicDir: path.resolve(__dirname, "src/assets"),
    build: {
      copyPublicDir: false,
      sourcemap: true,
      lib: {
        entry: path.resolve(__dirname, `src/atoms/${mode}/app.js`),
        name: "atom",
        formats: ["iife"],
        fileName: (_) => "app.js",
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
