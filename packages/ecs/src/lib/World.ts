import type Entity from './Entity';
import type Query from './Query';


export interface WithWorld {
	world?: World;
}

/**
 * @internal
 */
export default class World {
	private previousEntityId = -1;
	private entities = new Set<Entity>();
	private queries = new Set<Query>();

	public registerQuery( query: Query ): void {
		if ( this.isDestroyed() ) { throw new Error( 'The world is already destroyed!' ); }
		this.queries.add( query );
		this.entities.forEach( ( entity ) => {
			query.test( entity );
		} );
	}

	public unregisterQuery( query: Query ): void {
		if ( this.isDestroyed() ) { throw new Error( 'The world is already destroyed!' ); }
		this.queries.delete( query );
	}


	public registerEntity( entity: Entity ): number {
		if ( this.isDestroyed() ) { throw new Error( 'The world is already destroyed!' ); }
		this.entities.add( entity );
		this.previousEntityId += 1;

		return this.previousEntityId;
		// registerEntity is followed by entity.add(),
		// which calls this.updateQueries
	}

	public unregisterEntity( entity: Entity ): void {
		if ( this.isDestroyed() ) { throw new Error( 'The world is already destroyed!' ); }
		this.entities.delete( entity );
		// unregisterEntity is preceeded by entity.remove(),
		// which calls this.updateQueries
	}

	public updateQueries( entity: Entity ): void {
		if ( this.isDestroyed() ) { throw new Error( 'The world is already destroyed!' ); }
		this.queries.forEach( ( query ) => {
			query.test( entity );
		} );
	}

	public isDestroyed(): boolean {
		return !this.entities;
	}

	public destroy(): void {
		this.queries.forEach( ( query ) => query.destroy() );
		this.entities.forEach( ( entity ) => entity.destroy() );
		this.queries = null;
		this.entities = null;
	}
}
