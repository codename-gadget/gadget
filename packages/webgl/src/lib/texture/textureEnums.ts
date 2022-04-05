/**
 * Enum representation of the sampler dimensionality.
 *
 * @internal
 */
export enum SamplerType {
	sampler2D = 35678,
	sampler3D = 35679,
	samplerCube = 35680,
}


/**
 * Enum representation of available texture binding points.
 *
 * @internal
 */
export enum TextureBindingPoint {
	texture2D = 3553,
	texture3D = 32879,
	textureCube = 34067,
}


/**
 * Enum representation of all six cubemap face directions.
 *
 * @internal
 */
export enum TextureCubeFace {
	/** Side facing the `+x` direction */
	px = 34069,

	/** Side facing the `-x` direction */
	nx = 34070,

	/** Side facing the `+y` direction */
	py = 34071,

	/** Side facing the `-y` direction */
	ny = 34072,

	/** Side facing the `+z` direction */
	pz = 34073,

	/** Side facing the `-z` direction */
	nz = 34074,
}

export type CubeOf<T> = {
	px: T;
	nx: T;
	py: T;
	ny: T;
	pz: T;
	nz: T;
};


/**
 * Returns the matching enum for a given cube face id.
 *
 * @param id - Cube face id string.
 * @returns The matching enum representation.
 * @internal
 */
export function inferFace( id: string ): TextureCubeFace {
	switch ( id ) {
		case 'nx':
			return TextureCubeFace.nx;

		case 'px':
			return TextureCubeFace.px;

		case 'ny':
			return TextureCubeFace.ny;

		case 'py':
			return TextureCubeFace.py;

		case 'nz':
			return TextureCubeFace.nz;

		case 'pz':
			return TextureCubeFace.pz;

		default:
			return undefined;
	}
}


/**
 * Texture magnification filter.
 */
export enum TextureMagFilter {
	linear = 9729,
	nearest = 9728,
}


/**
 * Texture minification filter.
 *
 * Note that `*Mipmap*` options need mipmaps to be present on the sampled texture.
 * Either define them manually or generate them automatically
 * by calling `generateMipmaps()` on your texture.
 */
export enum TextureMinFilter {
	linear = 9729,
	nearest = 9728,
	nearestMipmapNearest = 9984,
	linearMipmapNearest = 9985,
	nearestMipmapLinear = 9986,
	linearMipmapLinear = 9987,
}


/**
 * Comparison operator used when the texture comparison mode
 * is set to `TextureCompareMode.compareRefToTexture`
 */
export enum TextureCompareFunc {
	never = 512,
	always = 519,
	less = 513,
	lessOrEqual = 515,
	equal = 514,
	notEqual = 517,
	greaterOrEqual = 518,
	greater = 516,
}


/**
 * Texture comparison mode for currently bound depth textures.
 */
export enum TextureCompareMode {
	none = 0,

	/**
	 * Compare the textures `r` component to the currently bound depth texture when sampling.
	 * The result of the comparison is assigned to the red channel.
	 */
	compareRefToTexture = 34894,
}


/**
 * Texture wrapping mode
 */
export enum TextureWrap {
	repeat = 10497,
	mirroredRepeat = 33648,
	clampToEdge = 33071,
}


/**
 * Special data types for texture uploading.
 */
export enum TextureDataType {
	unsignedShort565 = 33635,
	unsignedShort4444 = 32819,
	unsignedShort5551 = 32820,
	unsignedInt2101010Rev = 33640,
	unsignedInt10f11f11fRev = 35899,
	unsignedInt5999Rev = 35902,
	unsignedInt248 = 34042,
	float32UnsignedInt248Rev = 36269,
}


/**
 * Texture format – which channels are present.
 */
export enum TextureFormat {
	alpha = 6406,
	luminance = 6409,
	luminanceAlpha = 6410,
	red = 6403,
	redInteger = 36244,
	rg = 33319,
	rgInteger = 33320,
	rgb = 6407,
	rgbInteger = 36248,
	rgba = 6408,
	rgbaInteger = 36249,
}


/**
 * Texture storage format – how the data is stored in GPU memory.
 */
export enum TextureStorageFormat {
	alpha = 6406,
	luminance = 6409,
	luminanceAlpha = 6410,
	r8 = 33321,
	r8snorm = 36756,
	rg8 = 33323,
	rg8snorm = 36757,
	rgb8 = 32849,
	rgb8snorm = 36758,
	rgb565 = 36194,
	rgba4 = 32854,
	rgb5a1 = 32855,
	rgba8 = 32856,
	rgba8snorm = 36759,
	rgb10a2 = 32857,
	rgb10a2ui = 36975,
	srgb8 = 35905,
	srgb8alpha8 = 35907,
	r16f = 33325,
	rg16f = 33327,
	rgb16f = 34843,
	rgba16f = 34842,
	r32f = 33326,
	rg32f = 33328,
	rgb32f = 34837,
	rgba32f = 34836,
	r11fg11fb10f = 35898,
	rgb9e5 = 35901,
	r8i = 33329,
	r8ui = 33330,
	r16i = 33331,
	r16ui = 33332,
	r32i = 33333,
	r32ui = 33334,
	rg8i = 33335,
	rg8ui = 33336,
	rg16i = 33337,
	rg16ui = 33338,
	rg32i = 33339,
	rg32ui = 33340,
	rgb8i = 36239,
	rgb8ui = 36221,
	rgb16i = 36233,
	rgb16ui = 36215,
	rgb32i = 36227,
	rgb32ui = 36209,
	rgba8i = 36238,
	rgba8ui = 36220,
	rgba16i = 36232,
	rgba16ui = 36214,
	rgba32i = 36226,
	rgba32ui = 36208,
}


/**
 * Returns the matching texture format for a given storage format.
 *
 * @internal
 * @param storage - The texture storage format.
 * @returns The matching texture format.
 */
export function inferFormatFromStorageFormat( storage: TextureStorageFormat ): TextureFormat {
	switch ( storage ) {
		case TextureStorageFormat.alpha:
			return TextureFormat.alpha;

		case TextureStorageFormat.luminance:
			return TextureFormat.luminance;

		case TextureStorageFormat.luminanceAlpha:
			return TextureFormat.luminanceAlpha;

		case TextureStorageFormat.r8:
		case TextureStorageFormat.r16f:
		case TextureStorageFormat.r32f:
			return TextureFormat.red;

		case TextureStorageFormat.r8snorm:
		case TextureStorageFormat.r8i:
		case TextureStorageFormat.r8ui:
		case TextureStorageFormat.r16i:
		case TextureStorageFormat.r16ui:
		case TextureStorageFormat.r32i:
		case TextureStorageFormat.r32ui:
			return TextureFormat.redInteger;

		case TextureStorageFormat.rg8:
		case TextureStorageFormat.rg16f:
		case TextureStorageFormat.rg32f:
			return TextureFormat.rg;

		case TextureStorageFormat.rg8snorm:
		case TextureStorageFormat.rg8i:
		case TextureStorageFormat.rg8ui:
		case TextureStorageFormat.rg16i:
		case TextureStorageFormat.rg16ui:
		case TextureStorageFormat.rg32i:
		case TextureStorageFormat.rg32ui:
			return TextureFormat.rgInteger;

		case TextureStorageFormat.rgb8:
		case TextureStorageFormat.rgb565:
		case TextureStorageFormat.srgb8:
		case TextureStorageFormat.rgb16f:
		case TextureStorageFormat.rgb32f:
		case TextureStorageFormat.r11fg11fb10f:
		case TextureStorageFormat.rgb9e5:
			return TextureFormat.rgb;

		case TextureStorageFormat.rgb8snorm:
		case TextureStorageFormat.rgb8i:
		case TextureStorageFormat.rgb8ui:
		case TextureStorageFormat.rgb16i:
		case TextureStorageFormat.rgb16ui:
		case TextureStorageFormat.rgb32i:
		case TextureStorageFormat.rgb32ui:
			return TextureFormat.rgbInteger;

		case TextureStorageFormat.rgba4:
		case TextureStorageFormat.rgb5a1:
		case TextureStorageFormat.rgba8:
		case TextureStorageFormat.rgb10a2:
		case TextureStorageFormat.srgb8alpha8:
		case TextureStorageFormat.rgba16f:
		case TextureStorageFormat.rgba32f:
			return TextureFormat.rgba;

		case TextureStorageFormat.rgba8snorm:
		case TextureStorageFormat.rgb10a2ui:
		case TextureStorageFormat.rgba8i:
		case TextureStorageFormat.rgba8ui:
		case TextureStorageFormat.rgba16i:
		case TextureStorageFormat.rgba16ui:
		case TextureStorageFormat.rgba32i:
		case TextureStorageFormat.rgba32ui:
			return TextureFormat.rgbaInteger;

		default:
			return undefined;
	}
}
