import { BufferDataType } from '../buffer/bufferEnums';
import resolutionForLevel from './resolutionForLevel';
import {
	TextureDataType,
	TextureBindingPoint,
	TextureMinFilter,
} from './textureEnums';
import AbstractTexture2D, { Texture2DProps } from './AbstractTexture2D';
import { devLog } from '../utils/log';


export interface TextureProps extends Texture2DProps {
	/**
	 * Whether to clamp mipmap LOD to levels that have been uploaded,
	 * i.e. whether to show lower/higher res levels in place of empty ones.
	 *
	 * @defaultValue false
	 * @remarks For this to have a visible effect, the texture needs to be sampled
	 * with {@linkcode TextureProps.minFilter} set to any filter that takes mipmaps into account.
	 *
	 * Also, the texture cannot be used with a {@linkcode Sampler}.
	 */
	clampLodToUploadedLevels?: boolean;
}

/**
 * Generic GPU texture store, wrapping `WebGLTexture`.
 */
export default class Texture extends AbstractTexture2D {
	private clampLodToUploadedLevels = false;
	private clampedMinLod = Infinity;
	private clampedMaxLod = -Infinity;

	public constructor( props: TextureProps ) {
		super(
			props,
			TextureBindingPoint.texture2D,
		);

		if ( props.clampLodToUploadedLevels ) {
			this.clampLodToUploadedLevels = true;

			if (
				__DEV_BUILD__
                && !( props.minFilter === TextureMinFilter.linearMipmapLinear
                    || props.minFilter === TextureMinFilter.linearMipmapNearest
                    || props.minFilter === TextureMinFilter.nearestMipmapLinear
                    || props.minFilter === TextureMinFilter.nearestMipmapNearest )
			) {
				devLog( {
					msg: 'Using clampLodToUploadedLevels on a texture with its minFilter set to linear or nearest has no effect.',
				} );
			}
		}
	}


	/**
	 * Uploads an array of pixels to the GPU.
	 *
	 * @param pixelsPerLevel - An object containing the pixel data per level.
	 * @param type - The format the pixel data is in. Ignored for compressed formats.
	 *
	 * Defaults to {@linkcode BufferDataType.unsignedByte}
	 * @example Uploading a 2x2px red/black checkerboard texture and a 1x1px dark red mipmap.
	 * ```typescript
	 * import { Texture, BufferDataType } from '@gdgt/webgl';
	 *
	 *
	 * const myTexture = new Texture( {
	 *     width: 2,
	 *     height: 2,
	 *     levels: 2,
	 * } );
	 *
	 * await myTexture.uploadPixels(
	 *     {
	 *         0: new Uint8Array([
	 *             255, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 0, 0, 255,
	 *         ]),
	 *         1: new Uint8Array([128, 0, 0, 255]),
	 *     },
	 *     BufferDataType.unsignedByte,
	 * );
	 * ```
	 */
	public async uploadPixels(
		pixelsPerLevel: { [level: number]: ArrayBufferView },
		type: BufferDataType | TextureDataType = BufferDataType.unsignedByte,
	): Promise<void> {
		await this.ready;

		const {
			gl,
			format,
			width,
			height,
			clampLodToUploadedLevels,
			minLod,
			maxLod,
			isCompressed,
			isPreallocated,
		} = this;

		this.bindSync();

		Object.entries( pixelsPerLevel ).forEach( ([_level, srcData]) => {
			const level = parseInt( _level, 10 );
			const levelWidth = resolutionForLevel( width, level );
			const levelHeight = resolutionForLevel( height, level );

			if ( clampLodToUploadedLevels ) {
				this.clampedMinLod = Math.max( minLod, Math.min( level, this.clampedMinLod ) );
				this.clampedMaxLod = Math.min( maxLod, Math.max( level, this.clampedMaxLod ) );
			}

			// TODO: sanity checks

			if ( isCompressed && isPreallocated ) {
				// compressed and preallocated texture
				gl.compressedTexSubImage2D(
					gl.TEXTURE_2D,
					level,
					0,
					0,
					levelWidth,
					levelHeight,
					format,
					srcData,
					0,
				);
			} else if ( isCompressed ) {
				// compressed and non-preallocated texture
				gl.compressedTexImage2D(
					gl.TEXTURE_2D,
					level,
					format,
					levelWidth,
					levelHeight,
					0,
					srcData,
					0,
				);
			} else {
				// uncompressed and preallocated texture
				gl.texSubImage2D(
					gl.TEXTURE_2D,
					level,
					0,
					0,
					levelWidth,
					levelHeight,
					format,
					type,
					srcData,
					0,
				);
			}
		} );

		if ( clampLodToUploadedLevels ) {
			gl.texParameterf( gl.TEXTURE_2D, gl.TEXTURE_MIN_LOD, this.clampedMinLod );
			gl.texParameterf( gl.TEXTURE_2D, gl.TEXTURE_MAX_LOD, this.clampedMaxLod );
		}

		gl.bindTexture( gl.TEXTURE_2D, null );
	}
}
