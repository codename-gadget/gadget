import {
	registerMonitor, updateMonitor,
} from '@gdgt/devtools';
import type Entity from './Entity';
import type Query from './Query';


export interface WithWorld {
	world?: World;
}

if ( __DEV_BUILD__ ) {
	registerMonitor( {
		id: 'ecs/entity_count',
		type: 'count',
		name: 'Entities',
	} );
	registerMonitor( {
		id: 'ecs/query_count',
		type: 'count',
		name: 'Queries',
	} );
}

/**
 * @internal
 */
export default class World {
	private previousEntityId = -1;
	private entities = new Set<Entity>();
	private queries = new Set<Query>();


	public registerQuery( query: Query ): void {
		this.queries.add( query );
		this.entities.forEach( ( entity ) => {
			query.test( entity );
		} );

		if ( __DEV_BUILD__ ) {
			updateMonitor( 'ecs/query_count', this.queries.size );
		}
	}

	public unregisterQuery( query: Query ): void {
		this.queries.delete( query );

		if ( __DEV_BUILD__ ) {
			updateMonitor( 'ecs/query_count', this.queries.size );
		}
	}


	public registerEntity( entity: Entity ): number {
		this.entities.add( entity );
		this.previousEntityId += 1;

		if ( __DEV_BUILD__ ) {
			updateMonitor( 'ecs/entity_count', this.entities.size );
		}

		return this.previousEntityId;
		// registerEntity is followed by entity.add(),
		// which calls this.updateQueries
	}

	public unregisterEntity( entity: Entity ): void {
		this.entities.delete( entity );

		if ( __DEV_BUILD__ ) {
			updateMonitor( 'ecs/entity_count', this.entities.size );
		}
		// unregisterEntity is preceeded by entity.remove(),
		// which calls this.updateQueries
	}

	public updateQueries( entity: Entity ): void {
		this.queries.forEach( ( query ) => {
			query.test( entity );
		} );
	}
}
