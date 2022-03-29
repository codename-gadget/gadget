/**
 * Reflection JSON output from spirv-cross
 */
export type SpirvReflection = {
	entryPoints: { name: string, mode: string }[],
	ubos: {
		type: string,
		name: string,
		block_size: number
	}[],
	inputs: {
		type: string,
		name: string,
		location: number,
	}[],
	outputs: {
		type: string,
		name: string,
		location: number,
	}[],
	types: Record<string, {
		name: string,
		members: {
			name: string,
			type: string,
			offset: number,
			array: [number],
			array_stride: number,
		}[],
	}>,
	textures: {
		type: string,
		name: string,
		set: number,
		binding: number,
	}[]
};
