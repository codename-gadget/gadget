
/**
 * `UniformView` constructor props, where `T` represents
 * the `ArrayBufferView` type the uniform value is visible as.
 *
 * @internal
 */
export interface UniformViewProps<T> {
	view: T,
	invalidate: () => void;
	upload: () => Promise<void>;
}


/**
 * Representation of a uniform value contained in a UBO.
 *
 * @internal
 */
export default class UniformView<T extends ArrayBufferView> {
	/**
	 * `ArrayBufferView` representing the uniforms value.
	 *
	 * You may change the `ArrayBufferView`s contents, but not `value` itself.
	 */
	public readonly value: T;

	public constructor( {
		view,
		invalidate,
		upload,
	}: UniformViewProps<T> ) {
		this.value = view;
		this.invalidate = invalidate;
		this.upload = upload;
	}


	/**
	 * Marks the uniform as invalid, so that it will be uploaded
	 * the next time `upload()` is called.
	 */
	public invalidate: () => void;


	/**
	 * Uploads all ranges marked as invalid on the underlying buffer.
	 *
	 * Note that this will also upload all other invalidated uniforms contained in the same block.
	 */
	public upload: () => Promise<void>;
}
