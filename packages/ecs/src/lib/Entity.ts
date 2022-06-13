/* eslint-disable no-console */
import type { ComponentDeclaration } from './Component';
import defaultWorld from './defaultWorld';


// ideally, Entities should keep a type of added components around,
// to facilitate autocomplete/verification when getting/removing components.

/**
 * The Entity representation, which can carry mulitple components and appear in {@linkcode Query}s.
 */
export default class Entity {
	// TODO: make configurable
	private world = defaultWorld;
	private components: Record<symbol, unknown> = {};
	private mutationObservers: Record<symbol, Set<( entity: Entity ) => void>> = {};


	/**
	 * Constructs a new {@linkcode Entity} and adds the given components to it.
	 *
	 * @param declarations - The components to add.
	 */
	public constructor( declarations: ComponentDeclaration[] = []) {
		this.world.registerEntity( this );

		this.add( ...declarations );
	}


	/**
	 * Adds one or more components to the entity.
	 *
	 * @param declarations - The components to add.
	 */
	public add( ...declarations: ComponentDeclaration[]): void {
		if ( __DEV_BUILD__ && !this.components ) {
			console.error( 'ERROR: trying to access destroyed entity.' );
		}

		declarations.forEach( ( declaration ) => {
			const [symbol, defaultValueFactory] = declaration;

			if ( this.components[symbol]) {
				if ( __DEV_BUILD__ ) {
					console.warn(
						`WARNING: component "${symbol.description}" already exists. This is a noop.`,
					);
				}

				return;
			}

			this.components[symbol] = defaultValueFactory();
		} );

		this.world.updateQueries( this );
	}


	/**
	 * Removes one or more given components from the entity.
	 *
	 * @param declarations - The components to remove.
	 */
	public remove( ...declarations: ComponentDeclaration[]): void {
		if ( __DEV_BUILD__ && !this.components ) {
			console.error( 'ERROR: trying to access destroyed entity.' );
		}

		declarations.forEach( ( declaration ) => {
			const [symbol] = declaration;

			if ( this.components[symbol] === undefined ) {
				if ( __DEV_BUILD__ ) {
					console.warn(
						`WARNING: Removing component "${symbol.description}", which is not present.`,
					);
				}

				return;
			}

			delete this.components[symbol];
		} );

		this.world.updateQueries( this );
	}


	/**
	 * Checks whether a given component exists on the entity.
	 *
	 * @param declaration - The component to check for.
	 * @returns `true` if the component exists, `false` otherwise.
	 */
	public has( declaration: ComponentDeclaration ): boolean {
		if ( !this.components ) {
			if ( __DEV_BUILD__ ) {
				console.warn( 'WARNING: accessing destroyed entity.' );
			}

			return false;
		}

		const [symbol] = declaration;

		return this.components[symbol] !== undefined;
	}


	/**
	 * Returns the __readonly__ value of a given component.
	 *
	 * @remarks If you need to alter the component value, see {@linkcode Entity.getMutable}.
	 * @param declaration - The component to get the value of.
	 * @returns The __readonly__ value.
	 */
	public get<T>( declaration: ComponentDeclaration<T> ): Readonly<T> | undefined {
		if ( __DEV_BUILD__ && !this.components ) {
			console.error( 'ERROR: trying to read from destroyed entity.' );
		}

		const [symbol] = declaration;

		if ( __DEV_BUILD__ ) {
			if ( this.components[symbol] === undefined ) {
				console.warn(
					`WARNING: Reading component "${symbol.description}", which is undefined.`,
				);

				return undefined;
			}

			// return a frozen object for pure objects in dev mode to prevent mutation.
			// This is skipped in prod mode due to pref implications.
			if ( Object.prototype.toString.call( this.components[symbol]) === '[object Object]' ) {
				return Object.freeze( { ...( this.components[symbol] as object ) } ) as T;
			}

			return this.components[symbol] as T;
		}

		return this.components[symbol] as T;
	}


	/**
	 * Returns the __mutable__ value of a given component.
	 *
	 * @remarks The component is considered mutated after this, regardless of whether
	 * its value actually changed. {@linkcode Entity.getMutable} should only be used if
	 * you're actually planning to change the value.
	 * @param declaration - The component to get the value of.
	 * @returns The __mutable__ value.
	 */
	public getMutable<T>( declaration: ComponentDeclaration<T> ): T | undefined {
		if ( __DEV_BUILD__ && !this.components ) {
			console.error( 'ERROR: trying to access destroyed entity.' );
		}

		const [symbol] = declaration;

		if ( __DEV_BUILD__ && this.components[symbol] === undefined ) {
			console.warn(
				`WARNING: Accessing component "${symbol.description}", which is undefined.`,
			);
		}

		this.mutationObservers[symbol]?.forEach( ( observer ) => observer( this ) );

		return this.components[symbol] as T;
	}


	/**
	 * Registers a given callback to be run upon mutation to given component.
	 *
	 * Note, that due to current implementation details, the callback might run
	 * __before__ the actual change takes place.
	 *
	 * @remarks "Mutation" means, that the value of a component changed.
	 * Addition and removal of a component is not considered a mutation.
	 * @param declaration - The component to observe.
	 * @param callback - The callback to run on mutation.
	 * @returns A removal callback, that, if run, removes the mutation observer.
	 */
	public addMutationObserver(
		declaration: ComponentDeclaration,
		callback: ( entity: Entity ) => void,
	): () => void {
		if ( __DEV_BUILD__ && !this.components ) {
			console.error( 'ERROR: trying to observe destroyed entity.' );
		}

		const [symbol] = declaration;

		if ( !this.mutationObservers[symbol]) {
			this.mutationObservers[symbol] = new Set();
		}

		if ( __DEV_BUILD__ && this.mutationObservers[symbol].has( callback ) ) {
			console.warn(
				`WARNING: attempting to add the same mutation observer twice for component "${
					symbol.description
				}", this is a noop.`,
			);
		}

		this.mutationObservers[symbol].add( callback );

		return () => {
			this.removeMutationObserver( declaration, callback );
		};
	}


	/**
	 * Removes a mutation observer.
	 *
	 * @param declaration - The component being observed.
	 * @param callback - The callback to remove.
	 */
	public removeMutationObserver(
		declaration: ComponentDeclaration,
		callback: ( entity: Entity ) => void,
	): void {
		if ( __DEV_BUILD__ && !this.components ) {
			console.error( 'ERROR: trying to access destroyed entity.' );
		}

		const [symbol] = declaration;

		this.mutationObservers[symbol]?.delete( callback );
	}


	/**
	 * Destorys the entity, removing all components.
	 */
	public destroy(): void {
		// TODO: this is very ugly, is there a better way?
		this.remove(
			...Object.getOwnPropertySymbols(
				this.components,
			).map(
				( symbol ) => [symbol],
			) as unknown as ComponentDeclaration[],
		);

		this.world.unregisterEntity( this );

		this.components = null;
		this.mutationObservers = null;
	}
}
