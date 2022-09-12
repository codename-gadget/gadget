import { registerGroup } from '@gdgt/devtools';


export { default as World } from './lib/World';
export { default as defaultWorld } from './lib/defaultWorld';
export { default as Entity } from './lib/Entity';
export { default as Query, QueryProps, QueryResult } from './lib/Query';
export { default as declareComponent, ComponentDeclaration } from './lib/Component';


if ( __DEV_BUILD__ ) {
	registerGroup( {
		id: 'ecs',
		name: 'ECS',
	} );
}
