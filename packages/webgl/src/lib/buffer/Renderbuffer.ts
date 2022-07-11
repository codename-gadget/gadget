import ContextConsumer, { WithContext } from '../abstracts/ContextConsumer';
import { TextureStorageFormat } from '../texture/textureEnums';
import { devLog } from '../utils/log';


export interface RenderbufferProps extends WithContext {
	width: number;
	height: number;
	samples?: number;
	storageFormat?: TextureStorageFormat
}

/**
 * A GPU buffer that can be rendered to but can't be sampled.
 * For use with a {@linkcode Framebuffer}.
 */
export default class Renderbuffer extends ContextConsumer {
	private renderbuffer: WebGLRenderbuffer;

	public constructor( {
		width = 0,
		height = 0,
		samples = 1,
		storageFormat = TextureStorageFormat.rgba8,
		context,
	}: RenderbufferProps ) {
		super( async () => {
			const { gl } = this;

			const renderbuffer = gl.createRenderbuffer();

			gl.bindRenderbuffer( gl.RENDERBUFFER, renderbuffer );

			if ( samples > 1 ) {
				gl.renderbufferStorageMultisample(
					gl.RENDERBUFFER,
					samples,
					storageFormat,
					width,
					height,
				);
			} else {
				gl.renderbufferStorage(
					gl.RENDERBUFFER,
					storageFormat,
					width,
					height,
				);
			}

			this.renderbuffer = renderbuffer;
		}, context );
	}


	/** Returns the underlying `WebGLRenderbuffer` once ready. */
	public async getBuffer(): Promise<WebGLRenderbuffer> {
		await this.ready;

		if ( __DEV_BUILD__ && this.renderbuffer === null ) {
			devLog( {
				level: 'error',
				msg: 'Attempting to access deleted renderbuffer.',
			} );
		}

		return this.renderbuffer;
	}


	/**
	 * Returns the underlying `WebGLRenderbuffer` if it has been initialized, or `null` otherwise.
	 * Use `getBuffer()` to wait until the buffer is ready.
	 *
	 * @returns `WebGLRenderbuffer` if ready, `null` otherwise.
	 */
	public getBufferSync(): WebGLRenderbuffer | null {
		const { renderbuffer } = this;

		if ( renderbuffer ) return renderbuffer;

		if ( __DEV_BUILD__ ) {
			devLog( {
				level: 'error',
				msg: `Attempting to access ${renderbuffer === null ? 'deleted' : 'uninitialized'} renderbuffer.`,
			} );
		}

		return null;
	}


	/**
	 * Binds the renderbuffer to the `gl.RENDERBUFFER` binding point.
	 *
	 * @returns `true` if the buffer has successfully been bound, `false` otherwise.
	 */
	public bindSync(): boolean {
		const { gl, renderbuffer } = this;

		if ( !renderbuffer ) {
			if ( __DEV_BUILD__ ) {
				devLog( {
					msg: `Trying to bind renderbuffer that ${renderbuffer === null ? 'has been deleted' : 'is not ready yet'}.`,
				} );
			}

			return false;
		}

		gl.bindRenderbuffer( gl.RENDERBUFFER, renderbuffer );

		return true;
	}


	/**
	 * Flags the underlying `WebGLRenderbuffer` for deletion.
	 * The buffer cannot be bound afterwards.
	 */
	public async delete(): Promise<void> {
		await this.ready;

		const { gl, renderbuffer } = this;

		gl.deleteRenderbuffer( renderbuffer );
		this.renderbuffer = null;
	}
}
