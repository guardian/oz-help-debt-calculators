import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import sveltePreprocess from 'svelte-preprocess';
import path from 'path';
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "shared": path.resolve(__dirname, "./shared"),
    },
  },
  css: {
    postcss: {
      plugins: [
        autoprefixer()
      ],
    }
  },
  plugins: [svelte({
    preprocess: sveltePreprocess({
        sourceMap: false,
        scss: {
            includePaths: ['shared/styles'],
            prependData: '@import "mq.scss"; @import "fonts.scss";',
        },
     }),
  })],
  root: path.resolve(__dirname, "atoms"),
  build: {
    lib: {
        entry: path.resolve(__dirname, 'atoms/default/main.js'),
        name: 'atom',
        formats: ['iife'],
        fileName: (format) => 'main.js',
    },
    target: "es2015",
    emptyOutDir: true,
    rollupOptions: {
        input: path.resolve(__dirname, 'atoms/default/main.js'),
        output: {
            sourcemap: true,
            dir: path.resolve(__dirname, 'build/default'),
        },
    }
  }
});
