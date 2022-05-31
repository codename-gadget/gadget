import type Entity from './Entity';
import type Query from './Query';


export interface WithWorld {
	world?: World;
}

/**
 * @internal
 */
export default class World {
	private entities = new Set<Entity>();
	private queries = new Set<Query>();


	public registerQuery( query: Query ): void {
		this.queries.add( query );
		this.entities.forEach( ( entity ) => {
			query.test( entity );
		} );
	}

	public unregisterQuery( query: Query ): void {
		this.queries.delete( query );
	}


	public registerEntity( entity: Entity ): void {
		this.entities.add( entity );
		// registerEntity is followed by entity.add(),
		// which calls this.updateQueries
	}

	public unregisterEntity( entity: Entity ): void {
		this.entities.delete( entity );
		// unregisterEntity is preceeded by entity.remove(),
		// which calls this.updateQueries
	}

	public updateQueries( entity: Entity ): void {
		this.queries.forEach( ( query ) => {
			query.test( entity );
		} );
	}
}
