import type { Plugin, RollupOptions } from 'rollup';
import { chromeExtension, simpleReloader } from 'rollup-plugin-chrome-extension';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import minifyPrivatesTransformer from 'ts-transformer-minify-privates';
import path from 'path';


export default {
	input: 'src/manifest.json',
	output: {
		dir: 'dist',
		format: 'esm',
		sourcemap: false,
		exports: 'auto',
	},
	cache: false,
	plugins: [
		typescript( {
			sourceMap: false,
			inlineSourceMap: false,
			outDir: 'dist',
			rootDir: path.join( __dirname, 'src' ),
			declaration: false,
			include: [
				'./**/*',
			],
			exclude: [
				'./**/*.test.ts',
			],
			transformers: {
				before: [
					{
						type: 'program',
						factory: ( program ) => minifyPrivatesTransformer( program ),
					},
				],
			},
		} ),
		replace( {
			preventAssignment: true,
			values: {
				__DEV_BUILD__: JSON.stringify( false ),
				'process.env.NODE_ENV': JSON.stringify( 'production' ),
			},
		} ),
		chromeExtension() as Plugin,
		simpleReloader() as Plugin,
		nodeResolve(),
		commonjs(),
		terser( {
			format: {
				comments: false,
			},
			mangle: {
				properties: {
					regex: /^_private_\w+/,
				},
			},
		} ),
	],
} as RollupOptions;
