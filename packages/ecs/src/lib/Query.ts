import { ComponentDeclaration } from './Component';
import defaultWorld from './defaultWorld';
import type Entity from './Entity';


export interface QueryProps<C extends ComponentDeclaration[] = ComponentDeclaration[]> {
	/** The components an {@linkcode Entity} needs to have to match the {@linkcode Query}. */
	has: C,

	/** Whether to list {@linkcode Entity}s added since the last `collect()` in the query result. */
	trackAdded?: boolean,

	/** Whether to list {@linkcode Entity}s removed since the last `collect()` in the query result. */
	trackRemoved?: boolean,

	/**
	 * Components that, if changed, cause the owning {@linkcode Entity} to
	 * be listed as `mutated` in the query result.
	 */
	trackMutated?: C[number][],
}


/**
 * The result returned when you call {@linkcode Query.collect}, consisting of
 * multiple `Set`s of {@linkcode Entity}s:
 *
 * - `entities` contains all entities matching the query at
 * the time {@linkcode Query.collect} was called.
 *
 * - `added` is only present if the query was constructed with `trackAdded: true`
 * and contains all entities newly matching the query, since the last
 * time {@linkcode Query.collect} was called.
 *
 * - `removed` is only present if the query was constructed with `trackRemoved: true`
 * and contains all entities no longer matching the query, since the last
 * time {@linkcode Query.collect} was called.
 *
 * - `mutated` is only present if the query was constructed with
 * the {@linkcode QueryProps.trackMutated} option and contains all entities with changes
 * to any of the components listed in {@linkcode QueryProps.trackMutated}, since the last
 * time {@linkcode Query.collect} was called.
 *
 * @example The result of a {@linkcode Query} with all tracking options enabled looks like this:
 * ```typescript
 * {
 *   entities: Set<Entity>,
 *   added: Set<Entity>,
 *   removed: Set<Entity>,
 *   mutated: Set<Entity>,
 * }
 * ```
 */
export type QueryResult<P extends QueryProps = QueryProps
& { trackAdded: true, trackRemoved: true, trackMutated: [] }> = (
	( P extends { trackAdded: true } ? { added: Set<Entity> } : object ) &
	( P extends { trackRemoved: true } ? { removed: Set<Entity> } : object ) &
	( P extends { trackMutated: ComponentDeclaration[] } ? { mutated: Set<Entity> } : object ) &
	{
		entities: Set<Entity>
	}
);


/**
 * A {@linkcode Query} represents a collection of {@linkcode Entity}s matching a
 * given set of criteria. It can also provide deltas relative to the previous result.
 *
 * @typeParam P - The {@linkcode QueryProps} the {@linkcode Query} was constructed with.
 */
export default class Query<P extends QueryProps = QueryProps> {
	// TODO: make configurable
	private world = defaultWorld;
	private nextResult: QueryResult<P>;
	private previousResult: QueryResult<P>;
	private has: ComponentDeclaration[] = [];
	private trackAdded: boolean;
	private trackRemoved: boolean;
	private trackMutated: ComponentDeclaration[] | null;


	/**
	 * Constructs a new {@linkcode Query}. See {@linkcode QueryProps} for options.
	 *
	 * @param param0 - see {@linkcode QueryProps}
	 */
	public constructor( {
		has,
		trackAdded = false,
		trackRemoved = false,
		trackMutated,
	}: P ) {
		this.has = has;
		this.trackAdded = trackAdded;
		this.trackRemoved = trackRemoved;
		this.trackMutated = trackMutated || null;


		// TODO: this could be less of an eyesore
		const [result, lastResult]: QueryResult<P>[] = Array( 2 )
			.fill( 0 )
			.map( () => {
				const r: QueryResult<{ has: [] }> = {
					entities: new Set<Entity>(),
				};

				if ( trackAdded ) {
					( r as QueryResult<P & { trackAdded: true }> ).added = new Set();
				}
				if ( trackRemoved ) {
					( r as QueryResult<P & { trackRemoved: true }> ).removed = new Set();
				}
				if ( trackMutated ) {
					( r as QueryResult<P & { trackMutated: [] }> ).mutated = new Set();
				}

				return r as QueryResult<P>;
			} );

		this.nextResult = result;
		this.previousResult = lastResult;

		this.flagMutation = this.flagMutation.bind( this );

		this.world.registerQuery( this );
	}


	/**
	 * Method used internally to test entities against the query.
	 * You should probably not use this.
	 *
	 * @internal
	 * @param entity - The entity to test.
	 */
	public test( entity: Entity ): void {
		let qualifies = true;

		for ( let i = 0; i < this.has.length; i += 1 ) {
			if ( !entity.has( this.has[i]) ) {
				qualifies = false;
				break;
			}
		}

		if ( qualifies ) {
			this.add( entity );
		} else {
			this.remove( entity );
		}
	}


	private add( entity: Entity ): void {
		const { entities, added } = this.nextResult as QueryResult;

		// this looks ugly but ensures that entities.has is
		// only called if actually needed
		if (
			( this.trackAdded || this.trackMutated )
            && !entities.has( entity )
		) {
			if ( this.trackAdded ) {
				added.add( entity );
			}

			this.trackMutated?.forEach( ( declaration ) => {
				entity.addMutationObserver( declaration, this.flagMutation );
			} );
		}

		entities.add( entity );
	}


	private remove( entity: Entity ): void {
		const {
			entities, added, removed, mutated,
		} = this.nextResult as QueryResult;

		// this looks ugly but ensures that entities.has is
		// only called if actually needed
		if ( this.trackRemoved || this.trackMutated ) {
			if ( this.previousResult.entities.has( entity ) ) {
				if ( this.trackRemoved ) {
					removed.add( entity );
				}
			} else if ( this.trackMutated ) {
				mutated.delete( entity );
			}
		}

		if ( this.trackAdded ) {
			added.delete( entity );
		}

		this.trackMutated?.forEach( ( declaration ) => {
			entity.removeMutationObserver( declaration, this.flagMutation );
		} );

		entities.delete( entity );
	}


	private flagMutation( entity: Entity ): void {
		const { mutated } = this.nextResult as QueryResult;

		mutated.add( entity );
	}


	// returned result is only valid until .collect() is called again.
	// maybe an additional safeguard is needed in dev mode.

	/**
	 * Returns the query result at this point in time.
	 *
	 * @remarks Note, that __only__ the result of the __most recent call__
	 * to {@linkcode Query.collect} is valid. Previous results are unstable
	 * and will yield incorrect results.
	 * @returns The query result.
	 */
	public collect(): QueryResult<P> {
		// swap result objects
		const frozenResult = this.nextResult;

		this.nextResult = this.previousResult;
		this.previousResult = frozenResult;


		const {
			entities, added, removed, mutated,
		} = this.nextResult as QueryResult;

		// move entities over to next result
		entities.clear();

		// eslint-disable-next-line no-restricted-syntax
		for ( const entity of frozenResult.entities ) {
			entities.add( entity );
		}

		// clear added/removed/mutated of next result
		added?.clear();
		removed?.clear();
		mutated?.clear();

		return frozenResult;
	}


	/**
	 * Destroys the {@linkcode Query}, clearing all previous results and
	 * preventing it from being updated in the future.
	 */
	public destroy(): void {
		([this.previousResult, this.nextResult] as QueryResult[]).forEach(
			( {
				entities, added, removed, mutated,
			} ) => {
				entities.clear();
				added?.clear();
				removed?.clear();
				mutated?.clear();
			},
		);

		this.previousResult = null;
		this.nextResult = null;

		this.world.unregisterQuery( this );
	}
}
