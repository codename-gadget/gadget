
/**
 * Enum specifying a uniform values type.
 */
export enum UniformType {
	float = 5126,
	floatVec2 = 35664,
	floatVec3 = 35665,
	floatVec4 = 35666,
	floatMat4 = 35676,
}


/**
 * Returns the number of components in a given type.
 *
 * @internal
 * @param type The `UniformType` to check.
 * @returns The number of components.
 */
export function componentInUniformType( type: UniformType ): number {
	switch ( type ) {
		case UniformType.float:
			return 1;

		case UniformType.floatVec2:
			return 2;

		case UniformType.floatVec3:
			return 3;

		case UniformType.floatVec4:
			return 4;

		case UniformType.floatMat4:
			return 16;

		default:
			throw new Error( `unsupported type ${type}` );
	}
}


/**
 * Returns the byte length of a given type.
 *
 * @internal
 * @param type The `UniformType` to check.
 * @returns The number of bytes in `type`.
 */
export function byteLengthOfUniformType( type: UniformType ): number {
	return componentInUniformType( type ) * 4;
}
