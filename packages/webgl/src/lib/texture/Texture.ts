import { BufferDataType } from '../buffer/bufferEnums';
import ContextConsumer, { WithContext } from '../abstracts/ContextConsumer';
import { devLog } from '../utils/log';
import {
	inferFormatFromStorageFormat,
	TextureFormat,
	TextureStorageFormat,
	TextureDataType,
} from './textureEnums';


export interface TextureProps extends WithContext {
	/** The textures width in pixels. */
	width: number

	/** The textures height in pixels. */
	height: number

	/**
	 * The amount of mipmap levels.
	 * Level 0 represents the original texture.
	 *
	 * @default 1
	 */
	levels?: number

	/**
	 * How the data is stored in GPU memory.
	 *
	 * @default TextureStorageFormat.rgba8
	 */
	storageFormat?: TextureStorageFormat,
}


/**
 * Generic GPU texture store, wrapping `WebGLTexture`.
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
	 * @param pixels The pixel data.
	 * @param type The formate the pixel data is in.
	 * @param level The mipmap level to upload to. @default 0
	 */
	public async uploadPixels(
		pixels: ArrayBufferView,
		type: BufferDataType | TextureDataType,
		level = 0,
	): Promise<void> {
		await this.ready;

		const {
			gl, texture, format, width, height,
		} = this;
		const scalar = 1 / Math.max( 2 * level, 1 );
		const levelWidth = Math.round( width * scalar );
		const levelHeight = Math.round( height * scalar );

		// TODO: sanity checks

		gl.bindTexture( gl.TEXTURE_2D, texture );
		gl.texSubImage2D(
			gl.TEXTURE_2D,
			level,
			0,
			0,
			levelWidth,
			levelHeight,
			format,
			type,
			pixels,
			0,
		);
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
