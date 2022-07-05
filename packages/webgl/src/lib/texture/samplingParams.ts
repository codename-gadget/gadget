
import {
	TextureCompareFunc, TextureCompareMode, TextureMagFilter, TextureMinFilter, TextureWrap,
} from './textureEnums';


export interface SamplingParams {
	/**
	 * The texture minification filter.
	 *
	 * @defaultValue {@linkcode TextureMinFilter.linear}
	 */
	minFilter?: TextureMinFilter,

	/**
	 * The texture magnification filter.
	 *
	 * @defaultValue {@linkcode TextureMagFilter.linear}
	 */
	magFilter?: TextureMagFilter,

	/**
	 * Texture wrapping mode for the `s`/`x` coordinate.
	 *
	 * @defaultValue {@linkcode TextureWrap.clampToEdge}
	 */
	wrapS?: TextureWrap,

	/**
	 * Texture wrapping mode for the `t`/`y` coordinate.
	 *
	 * @defaultValue {@linkcode TextureWrap.clampToEdge}
	 */
	wrapT?: TextureWrap,

	/**
	 * Texture wrapping mode for the `r`/`z` coordinate.
	 *
	 * @defaultValue {@linkcode TextureWrap.clampToEdge}
	 */
	wrapR?: TextureWrap,

	/**
	 * The minimum level-of-detail.
	 *
	 * @defaultValue -1000
	 */
	minLod?: number,

	/**
	 * The maximum level-of-detail.
	 *
	 * @defaultValue 1000
	 */
	maxLod?: number,

	/**
	 * The texture comparison mode.
	 *
	 * @defaultValue {@linkcode TextureCompareMode.none}
	 */
	compareMode?: TextureCompareMode,

	/**
	 * The texture comparison function.
	 *
	 * @defaultValue {@linkcode TextureCompareFunc.lessOrEqual}
	 */
	compareFunc?: TextureCompareFunc,
}


/**
 * Returns a full `SamplingParams` object from a partial one, falling back to defaults if necessary.
 *
 * @internal
 * @param param0 - The partial `SamplingParams` object.
 * @returns A full `SamplingParams` object.
 */
export function getSamplingParams( {
	minFilter = TextureMinFilter.linear,
	magFilter = TextureMagFilter.linear,
	wrapS = TextureWrap.clampToEdge,
	wrapT = TextureWrap.clampToEdge,
	wrapR = TextureWrap.clampToEdge,
	minLod = -1000,
	maxLod = 1000,
	compareMode = TextureCompareMode.none,
	compareFunc = TextureCompareFunc.lessOrEqual,
}: SamplingParams ): Required<SamplingParams> {
	return {
		minFilter,
		magFilter,
		wrapS,
		wrapT,
		wrapR,
		minLod,
		maxLod,
		compareMode,
		compareFunc,
	};
}
