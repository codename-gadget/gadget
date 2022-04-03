import { BufferDataType } from '../buffer/bufferEnums';
import resolutionForLevel from './resolutionForLevel';
import {
	TextureDataType,
	TextureBindingPoint,
	CubeOf,
	inferFace,
} from './textureEnums';
import AbstractTexture2D, { Texture2DProps } from './AbstractTexture2D';


/**
 * @public
 */
export type TextureCubeProps = Omit<Texture2DProps, 'height'>;


/**
 * Generic GPU texture store, wrapping `WebGLTexture`.
 *
 * @public
 */
export default class TextureCube extends AbstractTexture2D {
	public constructor( props: TextureCubeProps ) {
		super(
			{
				height: props.width,
				...props,
			},
			TextureBindingPoint.textureCube,
		);
	}


	/**
	 * Uploads an array of pixels to the GPU.
	 *
	 * @param pixelsPerLevel - An object containing the pixel data per level and face.
	 * @param type - The format the pixel data is in.
	 * @example Uploading data for level 0 of the side facing forward (positive Z)
	 * and level 1 of the side facing left (negative X):
	 * ```typescript
	 * await myCubemap.uploadPixels(
	 *     {
	 *         0: {
	 *             pz: new Uint8Array([
	 *                 // ...
	 *             ]),
	 *         },
	 *         1: {
	 *             nx: new Uint8Array([
	 *                 // ...
	 *             ]),
	 *         },
	 *     },
	 *     BufferDataType.unsignedByte,
	 * );
	 * ```
	 */
	public async uploadPixels(
		pixelsPerLevel: { [level: number]: Partial<CubeOf<ArrayBufferView>> },
		type: BufferDataType | TextureDataType,
	): Promise<void> {
		await this.ready;

		const {
			gl, format, width,
		} = this;

		this.bindSync();

		Object.entries( pixelsPerLevel ).forEach( ([_level, cube]) => {
			const level = parseInt( _level, 10 );
			const levelWidth = resolutionForLevel( width, level );

			Object.entries( cube ).forEach( ([face, srcData]) => {
				// TODO: sanity checks

				gl.texSubImage2D(
					inferFace( face ),
					level,
					0,
					0,
					levelWidth,
					levelWidth,
					format,
					type,
					srcData,
					0,
				);
			} );
		} );

		gl.bindTexture( gl.TEXTURE_CUBE_MAP, null );
	}
}
