/* eslint-disable no-restricted-syntax */
import {
	copyFile, readFile, rm, writeFile,
} from 'fs/promises';
// eslint-disable-next-line import/no-extraneous-dependencies
import glob from 'glob-promise';
import path from 'path';


// files to place in the build folder
const filesToCopy = [
	'../docs/public/404.html',
];


async function finishDocs(): Promise<void> {
	// typedoc produces HTML files with dots in their name,
	// which causes Cloudflare Pages to misbehave.
	// We need to go through all produced files, change the links and rename them if needed.
	// Additionally, the search index needs to be fixed as well.

	const htmlFiles = await glob( `${__dirname}/../docs/temp/**/*.html` );

	await Promise.all([
		...htmlFiles,
		// also fix the search index
		path.resolve( __dirname, '../docs/temp/assets/search.js' ),
	].map( async ( fileName ) => {
		let content = await readFile( fileName, { encoding: 'utf-8' } );

		// find all relative links (not starting with http), containing ".html"
		const links = content.matchAll( /(?<=href="|\\"url\\":\\")(?!http)[\w/.]+\.html(#\w*)?(?=\\"|"(>| ))/gm );

		for ( const [link] of links ) {
			const { name, ext } = path.parse( link );

			// produce a cleaned link (inlcuding the full path)
			// by replacing the name + ext part with cleaned one
			const cleanedLink = link.replace(
				name + ext,
				name.replace( '.', '-' ) + ext,
			);

			// finally, replace the entire link in the HTML source.
			content = content.replace( link, cleanedLink );
		}


		const { dir, name, ext } = path.parse( fileName );
		let outFileName = name;

		// the current file contains a dot in the name and needs to be renamed.
		if ( name.includes( '.' ) ) {
			outFileName = name.replace( '.', '-' );
			await rm( fileName );
		}

		await writeFile(
			path.join( dir, `${outFileName}${ext}` ),
			content,
			{ encoding: 'utf-8' },
		);
	} ) );


	// copy specified files to the build folder
	await Promise.all( filesToCopy.map( async ( file ) => {
		await copyFile(
			path.resolve( __dirname, file ),
			path.resolve( __dirname, '../docs/temp', path.basename( file ) ),
		);
	} ) );
}

finishDocs();
