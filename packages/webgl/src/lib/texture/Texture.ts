import { BufferDataType } from '../buffer/bufferEnums';
import ContextConsumer, { WithContext } from '../abstracts/ContextConsumer';
import { devLog } from '../utils/log';
import resolutionForLevel from './resolutionForLevel';
import {
	inferFormatFromStorageFormat,
	TextureFormat,
	TextureStorageFormat,
	TextureDataType,
} from './textureEnums';


/**
 * @public
 */
export interface TextureProps extends WithContext {
	/** The textures width in pixels. */
	width: number

	/** The textures height in pixels. */
	height: number

	/**
	 * The amount of mipmap levels.
	 * Level 0 represents the original texture.
	 *
	 * @defaultValue 1
	 */
	levels?: number

	/**
	 * How the data is stored in GPU memory.
	 *
	 * @defaultValue TextureStorageFormat.rgba8
	 */
	storageFormat?: TextureStorageFormat,
}


/**
 * Generic GPU texture store, wrapping `WebGLTexture`.
 *
 * @public
 */
export default class Texture extends ContextConsumer {
	private texture: WebGLTexture;
	private width: number;
	private height: number;
	private format: TextureFormat;


	public constructor( {
		width = 0,
		height = 0,
		levels = 1,
		storageFormat = TextureStorageFormat.rgba8,
		context,
	}: TextureProps ) {
		super(
			async () => {
				const { gl } = this;
				const texture = gl.createTexture();

				gl.bindTexture( gl.TEXTURE_2D, texture );
				gl.texStorage2D( gl.TEXTURE_2D, levels, storageFormat, width, height );
				gl.bindTexture( gl.TEXTURE_2D, null );


				this.texture = texture;
				this.width = width;
				this.height = height;
				this.format = inferFormatFromStorageFormat( storageFormat );
			},
			context,
		);
	}


	/**
	 * Generates a complete mip-chain.
	 */
	public async generateMipmaps(): Promise<void> {
		await this.ready;

		const { gl, texture } = this;

		gl.bindTexture( gl.TEXTURE_2D, texture );
		gl.generateMipmap( gl.TEXTURE_2D );
		gl.bindTexture( gl.TEXTURE_2D, null );
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
			gl, texture, format, width, height,
		} = this;

		gl.bindTexture( gl.TEXTURE_2D, texture );

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


	/**
	 * Returns the underlying `WebGLTexture` object once ready.
	 *
	 * @returns The underlying `WebGLTexture` object.
	 */
	public async getTexture(): Promise<WebGLTexture> {
		await this.ready;

		return this.texture;
	}


	/**
	 * If ready, binds the texture to `gl.TEXTURE_2D`.
	 *
	 * @returns `true` if the texture has been successfully bound, `false` otherwise.
	 */
	public bindSync(): boolean {
		const { gl, texture } = this;

		if ( texture ) {
			gl.bindTexture( gl.TEXTURE_2D, texture );

			return true;
		}

		if ( __DEV_BUILD__ ) {
			devLog( {
				msg: 'Trying to bind texture before it is ready. This is a noop.',
			} );
		}

		return false;
	}
}
