export type ComponentDeclaration<T = object> = [symbol, () => T];

let unnamedComponentCount = 0;
const identifiers = new Set<symbol>();

/**
 * Declares a new component.
 *
 * @param defaultValueFactory - A function returning the components default value.
 * This is the value the component has when added to an {@linkcode Entity}.
 * @returns The component declaration.
 */
function declareComponent<T extends Record<string | symbol, unknown>>(
	defaultValueFactory: () => T,
): ComponentDeclaration<T>;

/**
 * Declares a new component.
 *
 * @param identifier - A unique identifier. If a `string` is provided,
 * you'll need to ensure that it is unique manually.
 * @param defaultValueFactory -  A function returning the components default value.
 * This is the value the component has when added to an {@linkcode Entity}.
 * @returns The component declaration.
 */
function declareComponent<T extends Record<string | symbol, unknown>>(
	identifier: symbol | string,
	defaultValueFactory: () => T,
): ComponentDeclaration<T>;

/**
 * Declares a new component.
 *
 * @param identifierOrDefaultValueFactory - Either a unique identifier (if a `string` is provided,
 * you'll need to ensure that it is unique manually), or the components default value.
 * @param defaultValueFactoryOrUndefined - Either the components default value (this is the value
 * the component has when added to an {@linkcode Entity}), or `undefined`.
 * @returns The component declaration.
 */
function declareComponent<T extends Record<string | symbol, unknown>>(
	identifierOrDefaultValueFactory: symbol | string | ( () => T ),
	defaultValueFactoryOrUndefined?: ( () => T ) | undefined,
): ComponentDeclaration<T> {
	let symbol: symbol;
	let defaultValueFactory: () => T;

	if ( defaultValueFactoryOrUndefined ) {
		defaultValueFactory = defaultValueFactoryOrUndefined;

		if ( typeof identifierOrDefaultValueFactory === 'symbol' ) {
			symbol = identifierOrDefaultValueFactory;
		} else if ( typeof identifierOrDefaultValueFactory === 'string' ) {
			symbol = Symbol.for( identifierOrDefaultValueFactory );
		}
	} else {
		defaultValueFactory = identifierOrDefaultValueFactory as () => T;
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

	return [symbol, defaultValueFactory];
}


export default declareComponent;
