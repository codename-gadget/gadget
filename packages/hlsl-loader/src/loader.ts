import type { LoaderContext } from 'webpack';
import { randomUUID } from 'crypto';
import {
	mkdir, readFile, rm, writeFile,
} from 'fs/promises';
import { exec as cbExec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

import type { HlslLoaderOptions } from './types/Options';
import type { SpirvReflection } from './types/SpirvReflection';
import * as optionsSchema from './schema/HlslLoaderOptions.json';
import execWithStdin from './lib/execWithStdin';
import dxcArgs from './lib/dxcArgs';
import spirvCrossArgs from './lib/spirvCrossArgs';
import { dxc, spirvCross } from './lib/binaries';
import mapMap from './lib/mapMap';
import toGlType from './lib/toGlType';
import toGlName from './lib/toGlName';
import introspectionForType from './lib/unwrapType';


const exec = promisify( cbExec );


/**
 * The loader function ran by webpack for each import
 *
 * @returns The converted JS source.
 */
export default async function load(): Promise<string> {
	const {
		resourcePath,
		getOptions,
		getLogger,
		context,
		utils: { contextify },
		mode: webpackMode,
	} = ( this as LoaderContext<HlslLoaderOptions> );

	const logger = getLogger();

	// options from loader config
	const loaderOptions = getOptions( optionsSchema as unknown ) || {};


	// merge options with defaults
	const options: Required<HlslLoaderOptions> = {
		exports: {
			vertexShader: {
				entry: 'vsMain',
				stage: 'vs_6_7',
			},
			fragmentShader: {
				entry: 'psMain',
				stage: 'ps_6_7',
			},
		},
		logGlsl: false,
		mangle: true,
		generateDeclarations: true,
		...loaderOptions,
	};


	if ( Object.keys( options.exports ).length < 1 ) {
		logger.warn(
			'\n[@gdgt/hlsl-loader] No exports configured \u2013 the loader will export nothing.',
		);

		return '';
	}

	// random UUID used for temp files
	const runId = randomUUID();

	// ensure that the temp directory exists
	await mkdir( path.resolve( './.temp' ) ).catch( ( err ) => {
		if ( err.code !== 'EEXIST' ) throw err;
	} );


	const spirvs = new Map<string, Buffer>();


	await Promise.all(
		Object.entries( options.exports )
			.map( async ([exportName, { entry, stage }], i ) => {
				// store output in temp file, since dxc does not support
				// outputting SPIR-V binary to stdout.
				const tmpFile = path.resolve( `./.temp/${runId}-${i}.spv` );

				const { stderr } = await exec([
					dxc,
					resourcePath,
					...dxcArgs,
					`-E ${entry}`,
					`-T ${stage}`,
					`-Fo ${tmpFile}`,
				].join( ' ' ) ).catch( ( e ) => e );

				if ( stderr ) {
					if ( stderr.indexOf( 'missing entry point' ) !== -1 ) {
						// entry point not found, this is expected – skip this one.
						return;
					}

					throw new Error( `dxc failed: ${stderr}` );
				}

				spirvs.set( exportName, await readFile( tmpFile ) );

				await rm( tmpFile );
			} ),
	);


	const attributes = new Map<string, {
		location: number,
		type: number,
	}>();
	const varyings = new Map<string, {
		location: number,
		type: number,
	}>();
	const fragOutputs = new Map<number, string>();
	const textures = new Map<string, {
		binding: number,
		type: number,
	}>();
	const exports = new Map<string, {
		spirv: Buffer,
		entry: string,
		mode: string,
	}>();
	const ubos: Record<string, unknown> = {};


	// gather reflection info on each SPIR-V file
	await Promise.all( mapMap( spirvs, async ( spirv, exportName ) => {
		const { stdout, stderr } = await execWithStdin(
			[
				spirvCross,
				...spirvCrossArgs,
				'--reflect',
			].join( ' ' ),
			spirv,
		);

		if ( stderr ) throw new Error( `SPIRV-Cross failed: ${stderr}` );

		const {
			entryPoints: [entry], ...reflection
		}: SpirvReflection = JSON.parse( stdout );


		// track shader for export
		exports.set(
			exportName,
			{
				spirv,
				entry: entry.name,
				mode: entry.mode,
			},
		);


		// gather interface variables
		if ( entry.mode === 'vert' ) {
			// during the vertex stage, input variables are vertex attributes ...
			reflection.inputs?.forEach( ( { type, name, location } ) => {
				attributes.set(
					options.mangle ? `_a${location}` : `_a_${toGlName( name )}`,
					{
						type: toGlType( type ),
						location,
					},
				);
			} );
			// ... and outputs are "varyings"
			reflection.outputs?.forEach( ( { type, name, location } ) => {
				varyings.set(
					options.mangle ? `_v${location}` : `_v_${toGlName( name )}`,
					{
						type: toGlType( type ),
						location,
					},
				);
			} );
		} else if ( entry.mode === 'frag' ) {
			// during the fragment stage, outputs are "fragOutputs"
			reflection.outputs?.forEach( ( { location } ) => {
				fragOutputs.set( location, `_o${location}` );
			} );
		}

		// track interface and buffer layout for all UBOs relevant to
		// the current shader

		const usedNames = new Set();

		reflection.ubos?.forEach( ( { type, name, block_size } ) => {
			// SPIRV-Cross doesn't count trailing padding bytes,
			// so the total block size ends up being incorrect.
			// Since we're using a std140 layout, we can compute
			// the actual block size by rounding to the next multiple of 16.
			const std140BlockSize = Math.ceil( block_size / 16 ) * 16;

			// HLSL uses registers for UBO identification, the provided names
			// are not guaranteed to be unique and need to be filtered out.
			if ( usedNames.has( name ) ) {
				logger.warn(
					`\n[@gdgt/hlsl-loader] Multiple cbuffers are named "${
						name.replace( /^type\./, '' )
					}".\n\tThis will result in incomplete introspection data for ${
						contextify( context, resourcePath )
					}`,
				);

				return;
			}

			usedNames.add( name );

			ubos[name] = {
				...introspectionForType( reflection, type ),
				'@blockSize': std140BlockSize,
			};
		} );

		// textures are tracked separately
		reflection.textures?.forEach( ( { type, name, binding } ) => {
			textures.set(
				name,
				{
					type: toGlType( type ),
					binding,
				},
			);
		} );
	} ) );


	const sources = new Map<string, string>();

	// compile the actual GLSL shaders
	await Promise.all( mapMap( exports, async ( { spirv, entry, mode }, exportName ) => {
		const isVert = mode === 'vert';
		const compileArgs = [
			...spirvCrossArgs,
			`--entry ${entry}`,
			`--stage ${mode}`,
		];

		// rename varyings to ensure compatibility
		varyings.forEach( ( { location }, name ) => {
			compileArgs.push( `--rename-interface-variable ${isVert ? 'out' : 'in'} ${location} ${name}` );
		} );

		if ( isVert ) {
			// rename attributes for consistency
			attributes.forEach( ( { location }, name ) => {
				compileArgs.push( `--rename-interface-variable in ${location} ${name}` );
			} );
		} else {
			// rename frag outputs for consistency
			fragOutputs.forEach( ( name, location ) => {
				compileArgs.push( `--rename-interface-variable out ${location} ${name}` );
			} );
		}

		const { stdout: src, stderr } = await execWithStdin(
			[
				spirvCross,
				...compileArgs,
			].join( ' ' ),
			spirv,
		);

		if ( stderr ) throw new Error( `SPIRV-Cross Error: ${stderr}` );

		sources.set( exportName, src );
	} ) );


	// dxc will output some wonky UBO symbol names:
	// UBOs are named 'type.myUbo' publicly and 'myUbo' internally. Ideally,
	// it should be the other way around.
	let currentUbo = 0;

	Object.keys( ubos ).forEach( ( name ) => {
		if ( name.startsWith( 'type.' ) ) {
			const publicName = toGlName( name );
			const instanceName = toGlName( name.replace( /^type\./g, '' ) );

			sources.forEach( ( src, exportName ) => {
				sources.set(
					exportName,
					src
					// replace the (internal) instance name with a generic one
						.replace(
							new RegExp( `(?<!\\w)${instanceName}(?!\\w)`, 'gm' ),
							options.mangle ? `_u${currentUbo}` : `_u_${instanceName}`,
						)
					// replace the wonky public name with the original instance name
						.replace(
							new RegExp( `(?<!\\w)${publicName}(?!\\w)`, 'gm' ),
							instanceName,
						),
				);
			} );

			const members = ubos[name];

			// rename the UBO in the introspection object
			delete ubos[name];
			ubos[instanceName] = members;

			currentUbo += 1;
		}
	} );


	if ( sources.size < 1 ) {
		logger.warn( `\nNo entry points found in ${
			contextify( context, resourcePath )
		}.\n\tLooking for the following functions: ${
			Object.entries( options.exports ).map( ( e ) => e[1].entry ).join( ', ' )
		}` );
	}


	// assemble JS source and type declarations

	const srcExports = [];
	const exportDeclarations = [
		'/* This file was auto-generated by @gdgt/hlsl-loader. Do not edit. */\n',
	];

	// and the introspection object as an object
	const introspectionExport = `export const introspection = ${
		JSON.stringify( {
			ubos,
			textures: Object.fromEntries( textures ),
			attributes: Object.fromEntries( attributes ),
		} )
	};`;

	srcExports.push( introspectionExport );
	exportDeclarations.push(
		'/**',
		' * Object containing static introspection data,',
		' * including UBO buffer layouts, vertex attributes and textures.',
		' */',
		introspectionExport,
	);


	// GLSL programs are exported as strings...
	sources.forEach( ( src, exportName ) => {
		srcExports.push( `export const ${exportName} = \`${src}\`;` );
		exportDeclarations.push(
			`\n/** GLES 3.0 source of \`${options.exports[exportName].entry}\` */`,
			`export const ${exportName}: string;`,
		);

		// output glsl source to console if desired
		if ( options.logGlsl && webpackMode !== 'production' ) {
			logger.clear();
			logger.info(
				`\n\n// export "${
					exportName
				}" (compiled from "${
					options.exports[exportName].entry
				}" in ${
					contextify( context, resourcePath )
				}):\n\n${
					src
				}`,
			);
		}
	} );

	// emit declarations if desired
	if ( options.generateDeclarations && webpackMode !== 'production' ) {
		await writeFile(
			`${resourcePath}.d.ts`,
			exportDeclarations.join( '\n' ),
		);
	}


	return srcExports.join( '\n' );
}
