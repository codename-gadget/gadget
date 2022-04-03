import { BufferDataType } from '../buffer/bufferEnums';
import resolutionForLevel from './resolutionForLevel';
import {
	TextureDataType,
	TextureBindingPoint,
} from './textureEnums';
import AbstractTexture2D, { Texture2DProps } from './AbstractTexture2D';


/**
 * Generic GPU texture store, wrapping `WebGLTexture`.
 *
 * @public
 */
export default class Texture extends AbstractTexture2D {
	public constructor( props: Texture2DProps ) {
		super(
			props,
			TextureBindingPoint.texture2D,
		);
	}


	/**
	 * Uploads an array of pixels to the GPU.
	 *
	 * @param pixelsPerLevel - An object containing the pixel data per level.
	 * @param type - The format the pixel data is in.
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
		type: BufferDataType | TextureDataType,
	): Promise<void> {
		await this.ready;

		const {
			gl, format, width, height,
		} = this;

		this.bindSync();

		Object.entries( pixelsPerLevel ).forEach( ([_level, srcData]) => {
			const level = parseInt( _level, 10 );
			const levelWidth = resolutionForLevel( width, level );
			const levelHeight = resolutionForLevel( height, level );

			// TODO: sanity checks

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
		} );

		gl.bindTexture( gl.TEXTURE_2D, null );
	}
}
