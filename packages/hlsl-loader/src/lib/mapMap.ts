type KeyType<M> = M extends Map<infer K, unknown> ? K : never;

type ValueType<M> = M extends Map<unknown, infer V> ? V : never;


/**
 * Like Array.map, but for a Map.
 *
 * @param map - The Map to map. :\>
 * @param fn - Callback executed on each entry. The return value will be added to the collection.
 * @returns Array of values returned by the callback functions.
 * @internal
 */
export default function mapMap<M extends Map<unknown, unknown>, R>(
	map: M,
	fn: ( value: ValueType<M>, key: KeyType<M> ) => R,
): R[] {
	const collection: R[] = [];

	map.forEach( ( value, key ) => {
		collection.push( fn( value as ValueType<M>, key as KeyType<M> ) );
	} );

	return collection;
}
