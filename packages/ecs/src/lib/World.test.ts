import declareComponent from './Component';
import Entity from './Entity';
import World from './World';


describe( 'World', () => {
	const aComponent = declareComponent( 'a', () => ( { a: 0 } ) );
	const bComponent = declareComponent( 'b', () => ( { b: 0 } ) );

	it( 'should have a unique id', () => {
		const worldA = new World( 'A' );
		const worldB = new World( 'B' );

		expect( worldA.id ).toBe( 'A' );
		expect( worldB.id ).toBe( 'B' );

		World.destroyAll();
	} );

	it( 'should generate random id', () => {
		const world = new World();

		expect( world.id ).not.toBe( undefined );
		expect( world.id ).not.toBe( null );

		World.destroyAll();
	} );

	it( 'should destroy', () => {
		const world = new World();

		expect( World.getWorld( world.id ) ).toBe( world );

		world.destroy();

		expect( World.getWorld( world.id ) ).toBe( undefined );

		World.destroyAll();
	} );

	it( 'should destroy entities', () => {
		const world = new World( 'A' );

		const entityA = new Entity([], world );
		const entityB = new Entity([], world );

		entityA.add( aComponent );
		entityB.add( bComponent );

		world.destroy();

		expect( World.isDestroyed( world ) ).toBe( true );
		expect( Entity.isDestroyed( entityA ) ).toBe( true );
		expect( Entity.isDestroyed( entityB ) ).toBe( true );

		World.destroyAll();
	} );

	it( 'should throw if destroyed', () => {
		const world = new World();

		world.destroy();

		expect( () => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const entity = new Entity([], world );
		} ).toThrow();

		World.destroyAll();
	} );
} );
