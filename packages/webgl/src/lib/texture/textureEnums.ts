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
	depthComponent = 6402,
	depthStencil = 34041,
	stencil = 6146,
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
	depthComponent16 = 33189,
	depthComponent24 = 33190,
	depthComponent32f = 36012,
	depth24Stencil8 = 35056,
	depth32fStencil8 = 36013,
	stencilIndex8 = 36168,
}


/**
 * Texture compression format.
 *
 * @remarks
 * Descriptions pulled from {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants#constants_defined_in_webgl_extensions | MDN}.
 */
export enum CompressedTextureStorageFormat {

	// WEBGL_compressed_texture_s3tc

	/** A DXT1-compressed image in an RGB image format. */
	rgbS3tcDxt1 = 0x83f0,

	/** A DXT1-compressed image in an RGB image format with a simple on/off alpha value. */
	rgbaS3tcDxt1 = 0x83f1,

	/**
	 * A DXT3-compressed image in an RGBA image format.
	 * Compared to a 32-bit RGBA texture, it offers 4:1 compression.
	 */
	rgbaS3tcDxt3 = 0x83f2,

	/**
	 * A DXT5-compressed image in an RGBA image format.
	 * It also provides a 4:1 compression, but differs to the DXT3 compression in
	 * how the alpha compression is done.
	 */
	rgbaS3tcDxt5 = 0x83f3,


	// WEBGL_compressed_texture_s3tc_srgb

	/** A DXT1-compressed image in an sRGB image format. */
	srgbS3tcDxt1 = 0x8c4c,

	/** A DXT1-compressed image in an sRGB image format with a simple on/off alpha value. */
	srgbAlphaS3tcDxt1 = 0x8c4d,

	/** A DXT3-compressed image in an sRGBA image format. */
	srgbAlphaS3tcDxt3 = 0x8c4e,

	/** A DXT5-compressed image in an sRGBA image format. */
	srgbAlphaS3tcDxt5 = 0x8c4f,


	// WEBGL_compressed_texture_etc

	/** One-channel (red) unsigned format compression. */
	r11Eac = 0x9270,

	/** One-channel (red) signed format compression. */
	signedR11Eac = 0x9271,

	/** Two-channel (red and green) unsigned format compression. */
	rg11Eac = 0x9272,

	/** Two-channel (red and green) signed format compression. */
	signedRg11Eac = 0x9273,

	/** Compresses RGB8 data with no alpha channel. */
	rgb8Etc2 = 0x9274,

	/** Compresses sRGB8 data with no alpha channel. */
	srgb8Etc2 = 0x9275,

	/**
	 * Similar to {@linkcode CompressedTextureStorageFormat.rgb8Etc2},
	 * but with ability to punch through the alpha channel,
	 * which means to make it completely opaque or transparent.
	 */
	rgb8PunchthroughAlpha1Etc2 = 0x9276,

	/**
	 * Similar to {@linkcode CompressedTextureStorageFormat.srgb8Etc2},
	 * but with ability to punch through the alpha channel,
	 * which means to make it completely opaque or transparent.
	 */
	srgb8PunchthroughAlpha1Etc2 = 0x9277,

	/**
	 * Compresses sRGBA8 data. The RGB part is encoded the same as
	 * {@linkcode CompressedTextureStorageFormat.rgb8Etc2},
	 * but the alpha part is encoded separately.
	 */
	rgba8Etc2Eac = 0x9278,

	/**
	 * Compresses sRGBA8 data. The RGB part is encoded the same as
	 * {@linkcode CompressedTextureStorageFormat.srgb8Etc2},
	 * but the alpha part is encoded separately.
	 */
	srgb8Alpha8Etc2Eac = 0x9279,


	// WEBGL_compressed_texture_pvrtc

	/** RGB compression in 4-bit mode. One block for each 4×4 pixels. */
	rgbPvrtc4bppv1 = 0x8c00,

	/** RGB compression in 2-bit mode. One block for each 8×4 pixels. */
	rgbPvrtc2bppv1 = 0x8c01,

	/** RGBA compression in 4-bit mode. One block for each 4×4 pixels. */
	rgbaPvrtc4bppv1 = 0x8c02,

	/** RGBA compression in 2-bit mode. One block for each 8×4 pixels. */
	rgbaPvrtc2bppv1 = 0x8c03,


	// WEBGL_compressed_texture_astc
	rgbaAstc4x4 = 0x93b0,
	rgbaAstc5x4 = 0x93b1,
	rgbaAstc5x5 = 0x93b2,
	rgbaAstc6x5 = 0x93b3,
	rgbaAstc6x6 = 0x93b4,
	rgbaAstc8x5 = 0x93b5,
	rgbaAstc8x6 = 0x93b6,
	rgbaAstc8x8 = 0x93b7,
	rgbaAstc10x5 = 0x93b8,
	rgbaAstc10x6 = 0x93b9,
	rgbaAstc10x8 = 0x93ba,
	rgbaAstc10x10 = 0x93bb,
	rgbaAstc12x10 = 0x93bc,
	rgbaAstc12x12 = 0x93bd,
	srgb8Alpha8Astc4x4 = 0x93d0,
	srgb8Alpha8Astc5x4 = 0x93d1,
	srgb8Alpha8Astc5x5 = 0x93d2,
	srgb8Alpha8Astc6x5 = 0x93d3,
	srgb8Alpha8Astc6x6 = 0x93d4,
	srgb8Alpha8Astc8x5 = 0x93d5,
	srgb8Alpha8Astc8x6 = 0x93d6,
	srgb8Alpha8Astc8x8 = 0x93d7,
	srgb8Alpha8Astc10x5 = 0x93d8,
	srgb8Alpha8Astc10x6 = 0x93d9,
	srgb8Alpha8Astc10x8 = 0x93da,
	srgb8Alpha8Astc10x10 = 0x93db,
	srgb8Alpha8Astc12x10 = 0x93dc,
	srgb8Alpha8Astc12x12 = 0x93dd,


	// EXT_texture_compression_bptc

	/**
	 * Compresses 8-bit fixed-point data. Each 4x4 block of texels consists of
	 * 128 bits of RGBA or image data.
	 * See also {@link https://learn.microsoft.com/en-gb/windows/win32/direct3d11/bc7-format | BC7} format.
	 */
	rgbaBptcUnorm = 0x8e8c,

	/**
	 * Compresses 8-bit fixed-point data. Each 4x4 block of texels consists of
	 * 128 bits of SRGB_ALPHA or image data.
	 * See also {@link https://learn.microsoft.com/en-gb/windows/win32/direct3d11/bc7-format | BC7} format.
	 */
	srgbAlphaBptcUnorm = 0x8e8d,

	/**
	 * Compresses high dynamic range signed floating point values.
	 * Each 4x4 block of texels consists of 128 bits of RGB data.
	 * It only contains RGB data, so the returned alpha value is 1.0.
	 *
	 * See also {@link https://learn.microsoft.com/en-gb/windows/win32/direct3d11/bc6h-format | BC6H} format.
	 */
	rgbBptcSignedFloat = 0x8e8e,

	/**
	 * Compresses high dynamic range unsigned floating point values.
	 * Each 4x4 block of texels consists of 128 bits of RGB data.
	 * It only contains RGB data, so the returned alpha value is 1.0.
	 *
	 * See also {@link https://learn.microsoft.com/en-gb/windows/win32/direct3d11/bc6h-format | BC6H} format.
	 */
	rgbBptcUnsignedFloat = 0x8e8f,


	// EXT_texture_compression_rgtc

	/**
	 * Each 4x4 block of texels consists of 64 bits of unsigned red image data.
	 * See also {@link https://learn.microsoft.com/en-gb/windows/win32/direct3d10/d3d10-graphics-programming-guide-resources-block-compression#bc4 | BC4 unsigned}.
	 */
	redRgtc1 = 0x8dbb,

	/**
	 * Each 4x4 block of texels consists of 64 bits of signed red image data.
	 * See also {@link https://learn.microsoft.com/en-gb/windows/win32/direct3d10/d3d10-graphics-programming-guide-resources-block-compression#bc4 | BC4 signed}.
	 */
	signedRedRgtc1 = 0x8dbc,

	/**
	 * Each 4x4 block of texels consists of 64 bits of compressed unsigned red image data
	 * followed by 64 bits of compressed unsigned green image data.
	 * See also {@link https://learn.microsoft.com/en-gb/windows/win32/direct3d10/d3d10-graphics-programming-guide-resources-block-compression#bc5 | BC5 unsigned}.
	 */
	redGreenRgtc2 = 0x8dbd,

	/**
	 * Each 4x4 block of texels consists of 64 bits of compressed signed red image data
	 * followed by 64 bits of compressed signed green image data.
	 * See also {@link https://learn.microsoft.com/en-gb/windows/win32/direct3d10/d3d10-graphics-programming-guide-resources-block-compression#bc5 | BC5 signed}.
	 */
	signedRedGreenRgtc2 = 0x8dbe,


	// WEBGL_compressed_texture_etc1

	/** Compresses 24-bit RGB data with no alpha channel. */
	rgbEtc1 = 0x8d64,
}


/**
 * Returns the matching texture format for a given storage format.
 *
 * @internal
 * @param storage - The texture storage format.
 * @returns The matching texture format or `undefined` if there
 * is none (e.g. for compressed formats).
 */
export function inferFormatFromStorageFormat(
	storage: TextureStorageFormat | CompressedTextureStorageFormat,
): TextureFormat {
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

		case TextureStorageFormat.depthComponent16:
		case TextureStorageFormat.depthComponent24:
		case TextureStorageFormat.depthComponent32f:
			return TextureFormat.depthComponent;

		case TextureStorageFormat.depth24Stencil8:
		case TextureStorageFormat.depth32fStencil8:
			return TextureFormat.depthStencil;

		case TextureStorageFormat.stencilIndex8:
			return TextureFormat.stencil;

		default:
			return undefined;
	}
}


/**
 * Indicates whether pre-allocation via texStorage is supported for the given format.
 *
 * @internal
 * @param storage - The texture storage format to check.
 * @returns Whether pre-allocation via texStorage is supported.
 */
export function checkPreallocationSupport(
	storage: TextureStorageFormat | CompressedTextureStorageFormat,
): boolean {
	switch ( storage ) {
		case CompressedTextureStorageFormat.rgbEtc1:
			return false;

		default:
			return true;
	}
}
