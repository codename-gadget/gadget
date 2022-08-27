import ContextConsumer, { WithContext } from '../abstracts/ContextConsumer';
import { devLog } from '../utils/log';
import { getSamplingParams, SamplingParams } from './samplingParams';
import {
	inferFormatFromStorageFormat,
	TextureBindingPoint,
	TextureFormat,
	TextureStorageFormat,
} from './textureEnums';


export interface Texture2DProps extends WithContext, SamplingParams {
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
	 * @defaultValue {@linkcode TextureStorageFormat.rgba8}
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
	protected format: TextureFormat;
	protected minLod: number;
	protected maxLod: number;
	/** Texture width in pixels. */
	public readonly width: number;
	/** Texture height in pixels. */
	public readonly height: number;


	public constructor(
		{
			width = 0,
			height = 0,
			levels = 1,
			storageFormat = TextureStorageFormat.rgba8,
			context,
			...samplingParams
		}: Texture2DProps,
		private bindingPoint: TextureBindingPoint,
	) {
		const {
			minFilter,
			magFilter,
			wrapS,
			wrapT,
			wrapR,
			minLod,
			maxLod,
			compareMode,
			compareFunc,
		} = getSamplingParams( samplingParams );


		super(
			async () => {
				const { gl } = this;
				const texture = gl.createTexture();

				gl.bindTexture( bindingPoint, texture );
				gl.texStorage2D( bindingPoint, levels, storageFormat, width, height );
				gl.texParameteri( bindingPoint, gl.TEXTURE_MIN_FILTER, minFilter );
				gl.texParameteri( bindingPoint, gl.TEXTURE_MAG_FILTER, magFilter );
				gl.texParameteri( bindingPoint, gl.TEXTURE_WRAP_S, wrapS );
				gl.texParameteri( bindingPoint, gl.TEXTURE_WRAP_T, wrapT );
				gl.texParameteri( bindingPoint, gl.TEXTURE_WRAP_R, wrapR );
				gl.texParameterf( bindingPoint, gl.TEXTURE_MIN_LOD, minLod );
				gl.texParameterf( bindingPoint, gl.TEXTURE_MAX_LOD, maxLod );
				gl.texParameteri( bindingPoint, gl.TEXTURE_COMPARE_MODE, compareMode );
				gl.texParameteri( bindingPoint, gl.TEXTURE_COMPARE_FUNC, compareFunc );
				gl.bindTexture( bindingPoint, null );


				this.texture = texture;
			},
			context,
		);

		this.width = width;
		this.height = height;
		this.format = inferFormatFromStorageFormat( storageFormat );
		this.minLod = minLod;
		this.maxLod = maxLod;
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
	 * Returns the underlying `WebGLTexture` object if ready, or `null` otherwise.
	 * Use `getTexture()` to wait until the texture is ready.
	 *
	 * @returns `WebGLTexture` if ready, `null` otherwise.
	 */
	public getTextureSync(): WebGLTexture | null {
		if ( this.texture ) {
			return this.texture;
		}

		if ( __DEV_BUILD__ ) {
			devLog( {
				msg: 'Trying to get texture before it is ready. This is a noop.',
			} );
		}

		return null;
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
