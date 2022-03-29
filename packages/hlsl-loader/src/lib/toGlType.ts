/**
 * Converts a string to the corresponding WebGL type enum.
 *
 * @param type - The type string to convert.
 * @returns The corresponding WebGL type enum.
 * @internal
 */
export default function toGlType( type: string ): number {
	switch ( type ) {
		case 'float':
			return 5126;

		case 'vec2':
			return 35664;

		case 'vec3':
			return 35665;

		case 'vec4':
			return 35666;

		case 'mat4':
			return 35676;

		case 'uint':
			return 5125;

		case 'uvec2':
			return 36294;

		case 'uvec3':
			return 36295;

		case 'uvec4':
			return 36296;

		case 'int':
			return 5124;

		case 'ivec2':
			return 35667;

		case 'ivec3':
			return 35668;

		case 'ivec4':
			return 35669;

		case 'sampler2D':
			return 35678;

		case 'sampler3D':
			return 35679;

		case 'samplerCube':
			return 35680;

		default:
			throw new Error( `Type currently not supported: ${type}` );
	}
}
