import ContextConsumer, { WithContext } from '../abstracts/ContextConsumer';
import { devLog } from '../utils/log';
import {
	inferFormatFromStorageFormat,
	TextureBindingPoint,
	TextureFormat,
	TextureStorageFormat,
} from './textureEnums';


export interface Texture2DProps extends WithContext {
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
	 * @defaultValue {@link TextureStorageFormat.rgba8}
	 */
	storageFormat?: TextureStorageFormat,
}


/**
 * Generic GPU texture store, wrapping `WebGLTexture`.
 *
 * @internal
 */
export default abstract class AbstractTexture2D extends ContextConsumer {
	private texture: WebGLTexture;
	protected width: number;
	protected height: number;
	protected format: TextureFormat;


	public constructor(
		{
			width = 0,
			height = 0,
			levels = 1,
			storageFormat = TextureStorageFormat.rgba8,
			context,
		}: Texture2DProps,
		private bindingPoint: TextureBindingPoint,
	) {
		super(
			async () => {
				const { gl } = this;
				const texture = gl.createTexture();

				gl.bindTexture( bindingPoint, texture );
				gl.texStorage2D( bindingPoint, levels, storageFormat, width, height );
				gl.bindTexture( bindingPoint, null );


				this.texture = texture;
				this.width = width;
				this.height = height;
				this.format = inferFormatFromStorageFormat( storageFormat );
			},
			context,
		);
	}


	public abstract uploadPixels( ...args: unknown[]): Promise<void>;


	/**
	 * Generates a complete mip-chain.
	 */
	public async generateMipmaps(): Promise<void> {
		await this.ready;

		const { gl, texture, bindingPoint } = this;

		gl.bindTexture( bindingPoint, texture );
		gl.generateMipmap( bindingPoint );
		gl.bindTexture( bindingPoint, null );
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
	 * If ready, binds the texture to the relevant binding point.
	 *
	 * @returns `true` if the texture has been successfully bound, `false` otherwise.
	 */
	public bindSync(): boolean {
		const { gl, texture, bindingPoint } = this;

		if ( texture ) {
			gl.bindTexture( bindingPoint, texture );

			return true;
		}

		if ( __DEV_BUILD__ ) {
			devLog( {
				msg: 'Trying to bind texture before it is ready. This is a noop.',
			} );
		}

		return false;
	}


	/**
	 * Flags the underlying `WebGLTexture` object for deletion.
	 */
	public async delete(): Promise<void> {
		await this.ready;

		const { gl, texture } = this;

		gl.deleteTexture( texture );
	}
}
