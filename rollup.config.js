import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import { babel } from '@rollup/plugin-babel';
import css from 'rollup-plugin-css-only';
import { string } from "rollup-plugin-string";
import testharness from './scripts/generateTestHarness.js';
import sveltePreprocess from 'svelte-preprocess';
import strip from '@rollup/plugin-strip';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';
import alias from '@rollup/plugin-alias';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import path from 'path';

const production = !process.env.ROLLUP_WATCH;
const assetsPath = process.env.ATOM_ASSETS_PATH || '/assets';

export default {
	output: {
		sourcemap: true,
		format: 'iife',
	},
	plugins: [
		nodePolyfills(),

		replace({
			__assetsPath__: assetsPath,
			__production__: `${production}`,
		}),

		alias({
			entries: [
			  { find: 'shared', replacement: path.resolve(__dirname, 'shared') },
			]
		}),

		string({
			include: "**/*.html",
		}),

		svelte({
			preprocess: sveltePreprocess({
				sourceMap: !production,
				scss: {
					includePaths: ['shared/styles'],
					prependData: '@import "mq.scss"; @import "fonts.scss";',
				},
				postcss: {
				  plugins: [require('autoprefixer')()]
				}
			 }),
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production
			},
		}),

		// Allow JSON files to be imported as JS modules
		json(),

		// we'll extract any component CSS out into
		// a separate file - better for performance
		css({ output: 'bundle.css' }),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),

		// Transpile JS for support on older browsers
		production && babel({
			extensions: [".js", ".mjs", ".html", ".svelte"],
			babelHelpers: 'bundled',
			exclude: [
				// don't transpile dev dependencies
				'node_modules/@babel/**', 
				'node_modules/@rollup/**', 
				'node_modules/aws-sdk/**', 
				'node_modules/node-fetch/**', 
				'node_modules/ora/**'],
			presets: [
				[
				  "@babel/preset-env",
				  {
					targets: "> 0.25%, not dead",
					useBuiltIns: "usage",
					corejs: "3",
					// debug: true,
				  },
				]
			],
		}),

		// Remove debugger statements and functions like assert.equal and console.log.
		production && strip(),

		!production && testharness(),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('build'),
	],
	watch: {
		clearScreen: true,
	}
};
