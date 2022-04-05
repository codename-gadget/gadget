import Buffer, { BufferProps } from './Buffer';


type BufferSrcData = ArrayBuffer | SharedArrayBuffer;


interface SyncableBufferProps<T = BufferSrcData> extends Omit<BufferProps, 'size'> {
	/**
	 * `ArrayBuffer` or `SharedArrayBuffer` from which the buffer will be created.
	 */
	data: T,
	/**
	 * If true, the entire buffer will be treated as valid initially and
	 * ranges for up/downloading need to be marked with `invalidate()` manually.
	 *
	 * @defaultValue false
	 */
	initializeAsValid?: boolean;
}


/**
 * GPU data store with CPU-side data representation, enabling easy up/downloading.
 */
export default class SyncableBuffer<T extends BufferSrcData = BufferSrcData> extends Buffer {
	/** CPU-side representation of the data. */
	public readonly data: T;
	private dataView: DataView;
	private invalidStart: number;
	private invalidEnd: number;


	public constructor( {
		target,
		usage,
		data,
		context,
		initializeAsValid = false,
	}: SyncableBufferProps<T> ) {
		const size = data.byteLength;

		super( {
			target,
			usage,
			size,
			context,
		} );

		this.data = data;
		this.dataView = new DataView( data );

		this.resetInvalidatedRange();
		if ( !initializeAsValid ) this.invalidate();
	}


	/**
	 * Marks a given range of the buffer as invalid.
	 * If parts of the buffer have already been invalidated,
	 * the range containing all parts will be invalidated.
	 *
	 * @param start - First byte to invalidate. @defaultValue `0`
	 * @param end - Last byte to invalidate. @defaultValue `Infinity`
	 */
	public invalidate( start = 0, end = Infinity ): void {
		this.invalidStart = Math.max( 0, Math.min( start, this.invalidStart ) );
		this.invalidEnd = Math.min( this.size, Math.max( end, this.invalidEnd ) );
	}


	private resetInvalidatedRange(): void {
		this.invalidStart = this.size;
		this.invalidEnd = 0;
	}


	/**
	 * Uploads the range marked as invalid to the GPU buffer.
	 */
	public async upload(): Promise<void> {
		await this.ready;

		const {
			gl, dataView, target, invalidStart, invalidEnd,
		} = this;

		if ( invalidEnd - invalidStart > 0 ) {
			this.bind();
			gl.bufferSubData(
				target,
				invalidStart,
				dataView,
				invalidStart,
				invalidEnd - invalidStart,
			);
		}

		this.resetInvalidatedRange();
	}

	// TODO: download
}
