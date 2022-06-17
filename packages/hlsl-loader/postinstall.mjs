import { symlinkSync } from 'fs';
import { resolve } from 'path';


try {
	symlinkSync(
		resolve( 'bin/darwin/lib/libdxcompiler.dylib' ),
		resolve( 'bin/darwin/lib/libdxcompiler.3.7.dylib' ),
	);

	symlinkSync(
		resolve( 'bin/linux/lib/libdxcompiler.so' ),
		resolve( 'bin/linux/lib/libdxcompiler.so.3.7' ),
	);
} catch ( e ) {
	if ( e.code !== 'EEXIST' ) {
		throw e;
	}
}
