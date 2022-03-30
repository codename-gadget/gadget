import path from 'path';


const isWindows = process.platform === 'win32';
const binaryPaths = new Map([
	['darwin', 'darwin/bin'],
	// ['win32', 'win32/bin'],
	['linux', 'linux/bin'],
]);


if ( !binaryPaths.has( process.platform ) ) {
	throw new Error( `Your current platform "${process.platform}" is not supported.` );
}


const binPath = path.resolve(
	__dirname,
	'../bin',
	binaryPaths.get( process.platform ),
);


export const dxc = path.resolve( binPath, `dxc${isWindows ? '.exe' : ''}` );

export const spirvCross = path.resolve( binPath, `spirv-cross${isWindows ? '.exe' : ''}` );
