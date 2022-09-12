import declareComponent from './Component';
import Entity from './Entity';
import World from './World';


describe( 'World', () => {
	const aComponent = declareComponent( 'a', () => ( { a: 0 } ) );
	const bComponent = declareComponent( 'b', () => ( { b: 0 } ) );

	it( 'should destroy', () => {
		const world = new World();

		world.destroy();

		expect( world.isDestroyed() ).toBe( true );
	} );

	it( 'should destroy entities', () => {
		const world = new World();

		const entityA = new Entity([], world );
		const entityB = new Entity([], world );

		entityA.add( aComponent );
		entityB.add( bComponent );

		world.destroy();

		expect( world.isDestroyed() ).toBe( true );
		expect( entityA.isDestroyed() ).toBe( true );
		expect( entityB.isDestroyed() ).toBe( true );
	} );

	it( 'should throw if destroyed', () => {
		const world = new World();

		world.destroy();

		expect( () => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const entity = new Entity([], world );
		} ).toThrow();
	} );
} );
