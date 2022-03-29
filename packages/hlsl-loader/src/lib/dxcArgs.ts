const dxcArgs = [
	// convert to SPIR-V
	'-spirv',

	// export additional info used in reflection
	'-fspv-reflect',

	// produce SPIR-V compatible with Vulkan 1.2 (SPIR-V 1.3)
	'-fspv-target-env=vulkan1.2',

	// Pack matrices in row-major order.
	// Counterintuitively, this produces default OpenGL column-major matrices after conversion.
	'-Zpr',

	// force strict std140 layout
	'-fvk-use-gl-layout',

	// maximum optimisation level
	'-O3',
];

export default dxcArgs;
