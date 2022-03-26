import {
	readdir,
	readFile, rm, writeFile,
} from 'fs/promises';
import * as path from 'path';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
	Extractor,
	ExtractorConfig,
	ExtractorResult,
	IConfigFile,
	ExtractorLogLevel,
} from '@microsoft/api-extractor';
import { exec as execCb } from 'child_process';
import { promisify } from 'util';


const exec = promisify( execCb );


const docModelDir = path.resolve( __dirname, '../docs_temp/' );


async function fixSymbolNames( p: string ): Promise<void> {
	await writeFile(
		p,
		( await readFile( p, { encoding: 'utf-8' } ) )
			.replace( /(?<=\w)_2(?!\w)/gm, '' ),
	);
}


async function extractApi(): Promise<void> {
	await Promise.all(
		( await readdir(
			path.resolve( __dirname, '../packages' ),
			{ withFileTypes: true },
		) )
			.filter( ( dir ) => dir.isDirectory() )
			.map( async ( dir ) => {
				const packageDir = path.resolve( __dirname, '../packages', dir.name );
				const pkgJsonPath = path.join( packageDir, 'package.json' );
				const { name, typings } = JSON.parse(
					await readFile(
						pkgJsonPath,
						{ encoding: 'utf-8' },
					),
				);

				if ( !typings ) {
					// eslint-disable-next-line no-console
					console.warn( `No typings found for ${name}, skipping.` );

					return;
				}

				const unscopedName = ( name as string ).replace( '@gdgt/', '' );
				const typingsPath = path.resolve( packageDir, typings );
				const configPath = path.resolve( packageDir, 'api-extractor.json' );
				const docModelPath = path.resolve( docModelDir, `${unscopedName}.api.json` );

				const config: IConfigFile = {
					mainEntryPointFilePath: typingsPath,
					apiReport: {
						enabled: false,
					},
					docModel: {
						enabled: true,
						apiJsonFilePath: docModelPath,
					},
					dtsRollup: {
						enabled: true,
						untrimmedFilePath: typingsPath,
					},
					tsdocMetadata: {
						enabled: false,
					},
					messages: {
						compilerMessageReporting: {
							default: {
								logLevel: ExtractorLogLevel.Warning,
							},
						},
						extractorMessageReporting: {
							default: {
								logLevel: ExtractorLogLevel.Warning,
							},
							'ae-forgotten-export': {
								logLevel: ExtractorLogLevel.None,
								addToApiReportFile: true,
							},
						},
						tsdocMessageReporting: {
							default: {
								logLevel: ExtractorLogLevel.Warning,
							},
						},
					},
					compiler: {
						skipLibCheck: true,
					},
				};

				// write config to file, because api-extractor won't provide sensible defaults otherwise.
				await writeFile( configPath, JSON.stringify( config ) );

				const extractorConfig: ExtractorConfig = ExtractorConfig.loadFileAndPrepare(
					configPath,
				);

				const extractorResult: ExtractorResult = Extractor.invoke(
					extractorConfig,
					{
						// Equivalent to the "--verbose" command-line parameter
						showVerboseMessages: true,
						typescriptCompilerFolder: path.resolve(
							__dirname,
							'../node_modules/typescript/',
						),
					},
				);


				// remove temporary api-extractor config file
				rm( configPath );

				if ( !extractorResult.succeeded ) {
					process.exitCode = 1;

					throw new Error( 'API extraction failed.' );
				}

				// remove lib dir containing .d.ts files, since they have been bundled.
				rm(
					path.join( path.dirname( typingsPath ), 'lib' ),
					{ recursive: true },
				).catch( ( err ) => {
					if ( err.code !== 'ENOENT' ) throw err;
				} );

				// api-extractor has a bug where it will add '_2' some symbol names
				// They need to be fixed to match the actual symbols.
				await fixSymbolNames( typingsPath );
				await fixSymbolNames( docModelPath );
			} ),
	);

	await exec( `npx @microsoft/api-documenter markdown --input-folder ${
		docModelDir
	} --output-folder ${
		path.resolve( __dirname, '../docs/' )
	}` );

	await rm(
		docModelDir,
		{ recursive: true },
	);
}

extractApi();
