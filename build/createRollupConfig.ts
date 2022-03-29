/* eslint-disable import/no-extraneous-dependencies */
import type { RollupOptions } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';
import minifyPrivatesTransformer from 'ts-transformer-minify-privates';
import path from 'path';
import * as lernaInfo from '../lerna.json';


/**
 * Creates a rollup config for compiling both a prod and dev versions.
 *
 * @param name - Entry file name without extension
 * @param withDevBuild - Whether to build a second version at
 * `./dist/dev` with `__DEV_BUILD__` enabled
 * @returns The rollup config
 */
export default function createRollupConfig(
	name: string,
	withDevBuild = false,
): RollupOptions[] {
	const config = ( isDevVersion: boolean ): RollupOptions => {
		const outDir = isDevVersion ? './dev/dist' : './dist';

		return {
			input: `./src/${name}.ts`,
			output: {
				dir: outDir,
				format: 'esm',
				sourcemap: isDevVersion,
			},
			external: [
				'gl-matrix',
			],
			cache: false,
			plugins: [
				json(),
				typescript( {
					sourceMap: false,
					inlineSourceMap: isDevVersion,
					outDir,
					declarationDir: outDir,
					rootDir: path.join( __dirname, 'src' ),
					declaration: true,
					include: [
						'./**/*',
					],
					exclude: [
						'./**/*.test.ts',
					],
					transformers: isDevVersion ? {} : {
						before: [
							{
								type: 'program',
								factory: ( program ) => minifyPrivatesTransformer( program ),
							},
						],
					},
				} ),
				replace( {
					preventAssignment: false,
					values: {
						__DEV_BUILD__: JSON.stringify( isDevVersion ),
						__VERSION__: JSON.stringify( lernaInfo.version ),
					},
				} ),
				...( isDevVersion ? [
					copy( {
						targets: [
							{ src: './package.json', dest: './dev' },
						],
					} ),
				] : [
					terser( {
						format: {
							comments: isDevVersion ? 'some' : false,
						},
						mangle: {
							properties: {
								regex: /^_private_\w+/,
							},
						},
					// compress: {
					// drop_console: !isDevVersion,
					// },
					} ),
				]),
			],
		};
	};

	const configs = [config( false )];

	if ( withDevBuild ) configs.push( config( true ) );

	return configs;
}
