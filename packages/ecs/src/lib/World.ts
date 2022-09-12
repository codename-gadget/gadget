import type Entity from './Entity';
import type Query from './Query';


export interface WithWorld {
	world?: World;
}

/**
 * A {@linkcode World} represents a collection of {@linkcode Entity}s
 * and can be queried using a {@linkcode Query}.
 */
export default class World {
	private previousEntityId = -1;
	private entities = new Set<Entity>();
	private queries = new Set<Query>();


	/**
	 * Registers a new query to the world.
	 *
	 * @param query - The query to register
	 * @internal
	 */
	public registerQuery( query: Query ): void {
		if ( this.isDestroyed() ) { throw new Error( 'The world is already destroyed!' ); }
		this.queries.add( query );
		this.entities.forEach( ( entity ) => {
			query.test( entity );
		} );
	}


	/**
	 * Unregisters a query from the world.
	 *
	 * @param query - The query to unregister.
	 * @internal
	 */
	public unregisterQuery( query: Query ): void {
		if ( this.isDestroyed() ) { throw new Error( 'The world is already destroyed!' ); }
		this.queries.delete( query );
	}


	/**
	 * Registers a new entity to the world.
	 *
	 * @param entity - The entity to register.
	 * @returns The unique entity id.
	 * @internal
	 */
	public registerEntity( entity: Entity ): number {
		if ( this.isDestroyed() ) { throw new Error( 'The world is already destroyed!' ); }
		this.entities.add( entity );
		this.previousEntityId += 1;

		return this.previousEntityId;
		// registerEntity is followed by entity.add(),
		// which calls this.updateQueries
	}


	/**
	 * Unregisters an entity from the world.
	 *
	 * @param entity - The entity to register,
	 * @internal
	 */
	public unregisterEntity( entity: Entity ): void {
		if ( this.isDestroyed() ) { throw new Error( 'The world is already destroyed!' ); }
		this.entities.delete( entity );
		// unregisterEntity is preceeded by entity.remove(),
		// which calls this.updateQueries
	}


	/**
	 * Tests a given entity against all querys.
	 *
	 * @param entity - The entity to test.
	 * @internal
	 */
	public updateQueries( entity: Entity ): void {
		if ( this.isDestroyed() ) { throw new Error( 'The world is already destroyed!' ); }
		this.queries.forEach( ( query ) => {
			query.test( entity );
		} );
	}


	/**
	 * Returns whether {@linkcode World.destroy} has been called on the world.
	 *
	 * @returns `true` if the world was destroyed, `false` otherwise.
	 */
	public isDestroyed(): boolean {
		return !this.entities;
	}


	/**
	 * Destorys the world, including all {@linkcode Entity}s
	 * and {@linkcode Query}s that are part of it.
	 *
	 * The world cannot be used after.
	 */
	public destroy(): void {
		this.queries.forEach( ( query ) => query.destroy() );
		this.entities.forEach( ( entity ) => entity.destroy() );
		this.queries = null;
		this.entities = null;
	}
}
