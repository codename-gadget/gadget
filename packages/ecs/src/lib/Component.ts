export type ComponentDeclaration<T = object> = [symbol, T];

let unnamedComponentCount = 0;
const identifiers = new Set<symbol>();

/**
 * Declares a new component.
 *
 * @param defaultValue - The components default value. This is the value
 * the component has when added to an {@linkcode Entity}.
 * @returns The component declaration.
 */
function declareComponent<T extends Record<string | symbol, unknown>>(
	defaultValue: T,
): ComponentDeclaration<T>;

/**
 * Declares a new component.
 *
 * @param identifier - A unique identifier. If a `string` is provided,
 * you'll need to ensure that it is unique manually.
 * @param defaultValue - The components default value. This is the value
 * the component has when added to an {@linkcode Entity}.
 * @returns The component declaration.
 */
function declareComponent<T extends Record<string | symbol, unknown>>(
	identifier: symbol | string,
	defaultValue: T,
): ComponentDeclaration<T>;

/**
 * Declares a new component.
 *
 * @param identifierOrDefaultValue - Either a unique identifier (if a `string` is provided,
 * you'll need to ensure that it is unique manually), or the components default value.
 * @param defaultValueOrUndefined - Either the components default value (this is the value
 * the component has when added to an {@linkcode Entity}), or `undefined`.
 * @returns The component declaration.
 */
function declareComponent<T extends Record<string | symbol, unknown>>(
	identifierOrDefaultValue: symbol | string | T,
	defaultValueOrUndefined?: T | undefined,
): ComponentDeclaration<T> {
	let symbol: symbol;
	let defaultValue: T;

	if ( defaultValueOrUndefined ) {
		defaultValue = defaultValueOrUndefined;

		if ( typeof identifierOrDefaultValue === 'symbol' ) {
			symbol = identifierOrDefaultValue;
		} else if ( typeof identifierOrDefaultValue === 'string' ) {
			symbol = Symbol.for( identifierOrDefaultValue );
		}
	} else {
		defaultValue = identifierOrDefaultValue as T;
	}

	if ( !symbol ) {
		symbol = Symbol( __DEV_BUILD__ ? `Unnamed Component ${unnamedComponentCount += 1}` : '' );
	}

	if ( identifiers.has( symbol ) ) {
		if ( __DEV_BUILD__ ) {
			throw new Error( `A component with the identifier "${symbol.description}" already exists and cannot be redeclared.` );
		} else {
			throw new Error( 'Redeclaration' );
		}
	}

	identifiers.add( symbol );

	return [symbol, { ...defaultValue }];
}


export default declareComponent;
