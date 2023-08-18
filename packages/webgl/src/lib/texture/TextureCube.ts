import { BufferDataType } from '../buffer/bufferEnums';
import resolutionForLevel from './resolutionForLevel';
import {
	TextureDataType,
	TextureBindingPoint,
	CubeOf,
	inferFace,
} from './textureEnums';
import AbstractTexture2D, { Texture2DProps } from './AbstractTexture2D';


export type TextureCubeProps = Omit<Texture2DProps, 'height'>;


/**
 * Generic GPU texture store, wrapping `WebGLTexture`.
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
	 * @param type - The format the pixel data is in. Ignored for compressed formats.
	 *
	 * Defaults to {@linkcode BufferDataType.unsignedByte}
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
		type: BufferDataType | TextureDataType = BufferDataType.unsignedByte,
	): Promise<void> {
		await this.ready;

		const {
			gl, width,
		} = this;

		this.bindSync();

		Object.entries( pixelsPerLevel ).forEach( ([_level, cube]) => {
			const level = parseInt( _level, 10 );
			const levelWidth = resolutionForLevel( width, level );

			Object.entries( cube ).forEach( ([face, srcData]) => {
				// TODO: sanity checks

				this.uploadLevelSync(
					inferFace( face ),
					level,
					levelWidth,
					levelWidth,
					type,
					srcData,
				);
			} );
		} );

		gl.bindTexture( gl.TEXTURE_CUBE_MAP, null );
	}
}
