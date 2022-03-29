
/**
 * Converts a given string to a GLSL compatible symbol name.
 *
 * @param name - The input string.
 * @returns The GLSL compatible symbol name.
 * @internal
 */
export default function toGlName( name: string ): string {
	return name.replace( /[^a-z0-9]/gi, '_' );
}
