import { devLog } from '../utils/log';


/**
 * Returns the resolution of a texture at a given mipmap level.
 *
 * @param level0Resolution - The textures original resolution
 * @param level - The mipmap level in question.
 * @returns The resolution at the given mipmap level.
 * @internal
 */
export default function resolutionForLevel(
	level0Resolution: number,
	level: number,
): number {
	const scalar = 1 / Math.max( 2 ** level, 1 );
	const resolution = Math.floor( level0Resolution * scalar );

	if ( __DEV_BUILD__ ) {
		if ( resolution < 1 ) {
			devLog( {
				msg: `Level ${level} for a texture with a resolution of ${level0Resolution} does not exist.`,
			} );
		}
	}

	return resolution;
}
