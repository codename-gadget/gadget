import declareComponent from './Component';
import Entity from './Entity';
import Query from './Query';
import World from './World';


describe( 'World', () => {
	const aComponent = declareComponent( 'a', () => ( { a: 0 } ) );
	const bComponent = declareComponent( 'b', () => ( { b: 0 } ) );

	it( 'should report being destroyed correctly', () => {
		const world = new World();

		expect( world.isDestroyed() ).toBeFalse();

		world.destroy();

		expect( world.isDestroyed() ).toBeTrue();
	} );

	it( 'should destroy contained entities', () => {
		const world = new World();
		const entityA = new Entity([], world );
		const entityB = new Entity([], world );

		entityA.add( aComponent );
		entityB.add( bComponent );

		world.destroy();

		expect( entityA.isDestroyed() ).toBeTrue();
		expect( entityB.isDestroyed() ).toBeTrue();
	} );

	it( 'should destroy contained queries', () => {
		const world = new World();
		const queryA = new Query( { has: [aComponent, bComponent], world } );
		const queryB = new Query( { has: [aComponent, bComponent], world } );


		world.destroy();

		expect( queryA.isDestroyed() ).toBeTrue();
		expect( queryB.isDestroyed() ).toBeTrue();
	} );

	it( 'should not destroy uncontained queries and enities', () => {
		const world = new World();
		const queryA = new Query( { has: [aComponent, bComponent] } );
		const entityA = new Entity([]);

		world.destroy();

		expect( queryA.isDestroyed() ).toBeFalse();
		expect( entityA.isDestroyed() ).toBeFalse();

		queryA.destroy();
		entityA.destroy();
	} );

	it( 'should throw when interacted with after destruction', () => {
		const world = new World();

		world.destroy();

		expect( () => new Entity([], world ) ).toThrow();
		expect( () => new Query( { has: [bComponent], world } ) ).toThrow();
	} );
} );
