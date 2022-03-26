import { devLog } from '../utils/log';
import ContextConsumer, { WithContext } from '../abstracts/ContextConsumer';
import { BufferBindingPoint, BufferUsage } from './bufferEnums';


const devCheckBuffer = ( buffer: unknown ): void => {
	if ( __DEV_BUILD__ && buffer === null ) {
		devLog( {
			level: 'error',
			msg: 'Trying to access discarded buffer.',
		} );
	}
};


/**
 * @public
 */
export interface BufferProps extends WithContext {
	/**
	 * Enum specifying the binding point that the buffer will be bound to when bind() is called.
	 *
	 * @defaultValue BufferBindingPoint.arrayBuffer
	 */
	target?: BufferBindingPoint,

	/** Enum specifying the intended usage pattern. */
	usage: BufferUsage,

	/** The buffers size in bytes. */
	size: number
}


/**
 * Generic GPU data store wrapping WebGLBuffer.
 *
 * @public
 */
export default class Buffer extends ContextConsumer {
	private buffer: WebGLBuffer;
	protected target: BufferBindingPoint;

	/** The buffers size in bytes */
	public readonly size: number;


	public constructor( {
		target = BufferBindingPoint.arrayBuffer,
		usage,
		size,
		context,
	}: BufferProps ) {
		super( async () => {
			const { gl } = this;

			this.buffer = gl.createBuffer();

			// allocate empty buffer
			gl.bindBuffer( target, this.buffer );
			gl.bufferData( target, size, usage );
		}, context );

		this.target = target;
		this.size = size;
	}


	/** Returns the underlying WebGLBuffer once ready. */
	public async getBuffer(): Promise<WebGLBuffer> {
		await this.ready;

		if ( __DEV_BUILD__ ) {
			devCheckBuffer( this.buffer );
		}

		return this.buffer;
	}


	/**
	 * Returns the underlying WebGLBuffer if it has been initialized, or `null` otherwise.
	 * Use `getBuffer()` to wait until the buffer is ready.
	 *
	 * @returns `WebGLBuffer` if ready, `null` otherwise.
	 */
	public getBufferSync(): WebGLBuffer | null {
		const { buffer } = this;

		if ( buffer ) return buffer;

		if ( __DEV_BUILD__ ) {
			devLog( {
				level: 'error',
				msg: 'Attempting to access uninitialized buffer',
			} );
		}

		return null;
	}


	/**
	 * Binds the buffer to a target binding point.
	 *
	 * @param target - The binding point to bind to.
	 * If undefined, the target defined at instancing is used.
	 * @returns `true` if the buffer has successfully been bound, `false` otherwise.
	 */
	public bind( target = this.target ): boolean {
		const { gl, buffer } = this;

		if ( buffer ) {
			gl.bindBuffer( target, buffer );

			return true;
		}

		if ( __DEV_BUILD__ ) {
			devLog( {
				msg: 'Trying to bind buffer before it is ready. This is a noop.',
			} );
		}

		return false;
	}


	/**
	 * Flags the underlying WebGLBuffer for deletion.
	 * The buffer cannot be bound afterwards.
	 */
	public async delete(): Promise<void> {
		await this.ready;

		const { gl, buffer } = this;

		gl.deleteBuffer( buffer );
		this.buffer = null;
	}
}
