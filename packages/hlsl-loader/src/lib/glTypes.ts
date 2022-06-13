const glTypes: [string, number][] = [
	['float', 5126],
	['vec2', 35664],
	['vec3', 35665],
	['vec4', 35666],
	['mat4', 35676],
	['uint', 5125],
	['uvec2', 36294],
	['uvec3', 36295],
	['uvec4', 36296],
	['int', 5124],
	['ivec2', 35667],
	['ivec3', 35668],
	['ivec4', 35669],
	['sampler2D', 35678],
	['sampler3D', 35679],
	['samplerCube', 35680],
];

const strToEnum = new Map( glTypes );
const enumToStr = new Map( glTypes.map( ( t ) => t.reverse() as [number, string]) );


/**
 * Converts a string to the corresponding WebGL type enum.
 *
 * @param type - The type string to convert.
 * @returns The corresponding WebGL type enum.
 * @internal
 */
export function toGlEnum( type: string ): number {
	const num = strToEnum.get( type );

	if ( !num ) throw new Error( `Type currently not supported: ${type}` );

	return num;
}


/**
 * Converts a WebGL type enum to the corresponding string.
 *
 * @param type - The type enum to convert.
 * @returns The corresponding WebGL type string.
 * @internal
 */
export function toGlTypeString( type: number ): string {
	const str = enumToStr.get( type );

	if ( !str ) throw new Error( `Type currently not supported: ${type}` );

	return str;
}
