/**
 * Enum specifying the type of data provided to the buffer.
 */
export enum BufferDataType {
	/**
	 * 8 bit integers.
	 * Mostly used with `Int8Array`.
	 * Ranging `-128` to `127`.
	 */
	byte = 5120,

	/**
	 * 8 bit unsigned integers.
	 * Mostly used with `Uint8Array` or `Uint8ClampedArray`.
	 * Ranging `0` to `255`.
	 */
	unsignedByte = 5121,

	/**
	 * 16 bit integers.
	 * Mostly used with `Int16Array`.
	 * Ranging `-32768` to `32767`.
	 */
	short = 5122,

	/**
	 * 16 bit unsigned integers.
	 * Mostly used with `Uint16Array`.
	 * Ranging `0` to `65535`
	 */
	unsignedShort = 5123,

	/**
	 * 32 bit integers.
	 * Mostly used with `Int32Array`.
	 * Ranging `-2147483648` to `2147483647`.
	 */
	int = 5124,

	/**
	 * 32 bit unsigned integers.
	 * Mostly used with `Uint32Array`.
	 * Ranging `0` to `4294967295`.
	 */
	unsignedInt = 5125,

	/**
	 * 32 bit floats.
	 * Mostly used with `Float32Array`.
	 * Ranging `1.175e-38` to `3.4e+38`
	 */
	float = 5126,

	/**
	 * 16 bit floats.
	 * Mostly used with `Int16Array`.
	 * Ranging `6.1e-5` to `6.55e+4`
	 */
	halfFloat = 5131,
}


/**
 * Infers the byte length of a single item in a buffer of the given type.
 *
 * @param type The buffers data type.
 * @returns The amount of bytes consituting a member.
 */
export function byteLengthPerMember( type: BufferDataType ): number {
	switch ( type ) {
		case BufferDataType.float:
		case BufferDataType.int:
		case BufferDataType.unsignedInt:
			return 4;

		case BufferDataType.halfFloat:
		case BufferDataType.short:
		case BufferDataType.unsignedShort:
			return 2;

		case BufferDataType.byte:
		case BufferDataType.unsignedByte:
			return 1;

		default:
			throw new Error( `unknown type ${type}` );
	}
}


/**
 * Enum specifying a buffer binding point.
 * Descriptions pulled from [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindBuffer)
 */
export enum BufferBindingPoint {
	/**
	 * Buffer containing vertex attributes, such as vertex coordinates,
	 * texture coordinate data, or vertex color data.
	 */
	arrayBuffer = 34962,

	/**
	 * Buffer used for element indices.
	 */
	elementArrayBuffer = 34963,

	/**
	 * Buffer for copying from one buffer object to another.
	 */
	copyReadBuffer = 36662,

	/**
	 * Buffer for copying from one buffer object to another.
	 */
	copyWriteBuffer = 36663,

	/**
	 * Buffer for transform feedback operations.
	 */
	transformFeedbackBuffer = 35982,

	/**
	 * Buffer used for storing uniform blocks.
	 */
	uniformBuffer = 35345,

	/**
	 * Buffer used for pixel transfer operations.
	 */
	pixelPackBuffer = 35051,

	/**
	 * Buffer used for pixel transfer operations.
	 */
	pixelUnpackBuffer = 35052,
}


/**
 * A enum specifying the intended usage pattern of the data store for optimization purposes.
 * Descriptions pulled from [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData).
 */
export enum BufferUsage {
	/**
	 * The contents are intended to be specified once by the application,
	 * and used many times as the source for WebGL drawing and image specification commands.
	 */
	staticDraw = 35044,

	/**
	 * The contents are intended to be respecified repeatedly by the application,
	 * and used many times as the source for WebGL drawing and image specification commands.
	 */
	dynamicDraw = 35048,

	/**
	 * The contents are intended to be specified once by the application, and used
	 * at most a few times as the source for WebGL drawing and image specification commands.
	 */
	streamDraw = 35040,

	/**
	 * The contents are intended to be specified once by reading data from WebGL,
	 * and queried many times by the application.
	 */
	staticRead = 35045,

	/**
	 * The contents are intended to be respecified repeatedly by reading data from WebGL,
	 * and queried many times by the application.
	 */
	dynamicRead = 35049,

	/**
	 * The contents are intended to be specified once by reading data from WebGL,
	 * and queried at most a few times by the application
	 */
	streamRead = 35041,

	/**
	 * The contents are intended to be specified once by reading data from WebGL,
	 * and used many times as the source for WebGL drawing and image specification commands.
	 */
	staticCopy = 35046,

	/**
	 * The contents are intended to be respecified repeatedly by reading data from WebGL,
	 * and used many times as the source for WebGL drawing and image specification commands.
	 */
	dynamicCopy = 35050,

	/**
	 * The contents are intended to be specified once by reading data from WebGL, and used
	 * at most a few times as the source for WebGL drawing and image specification commands.
	 */
	streamCopy = 35042,
}
