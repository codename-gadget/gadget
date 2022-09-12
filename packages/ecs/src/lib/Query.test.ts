import declareComponent from './Component';
import defaultWorld from './defaultWorld';
import Entity from './Entity';
import Query from './Query';
import World from './World';


describe( 'Query', () => {
	const componentA = declareComponent( 'A', () => ( { a: 1 } ) );
	const componentB = declareComponent( 'B', () => ( { b: 1 } ) );
	const componentC = declareComponent( 'C', () => ( { c: 1 } ) );

	const abcEntity = new Entity([componentA, componentB, componentC]);
	const abEntity = new Entity([componentA, componentB]);
	const bcEntity = new Entity([componentC, componentB]);
	const acEntity = new Entity([componentC, componentA]);

	it( 'should return matching entities', () => {
		const query = new Query( {
			has: [componentA, componentC],
		} );

		const { entities } = query.collect();

		expect( entities ).toContain( abcEntity );
		expect( entities ).toContain( acEntity );
		expect( entities ).not.toContain( abEntity );
		expect( entities ).not.toContain( bcEntity );

		query.destroy();
	} );

	it( 'should return matching entities created after query creation', () => {
		const query = new Query( {
			has: [componentA, componentC],
		} );

		const componentD = declareComponent( 'D', () => ( { d: 1 } ) );
		const acdEntity = new Entity([componentC, componentA, componentD]);
		const { entities } = query.collect();


		expect( entities ).toContain( abcEntity );
		expect( entities ).toContain( acEntity );
		expect( entities ).toContain( acdEntity );
		expect( entities ).not.toContain( abEntity );
		expect( entities ).not.toContain( bcEntity );

		acdEntity.destroy();
		query.destroy();
	} );

	it( 'should return entities matching after mutation', () => {
		const testEntity = new Entity([componentB]);

		const query = new Query( { has: [componentB, componentC] } );

		expect( query.collect().entities ).not.toContain( testEntity );

		testEntity.add( componentC );

		expect( query.collect().entities ).toContain( testEntity );

		query.destroy();
		testEntity.destroy();
	} );

	it( 'should not return entities disqualified by mutation', () => {
		const testEntity = new Entity([componentB, componentC]);

		const query = new Query( { has: [componentB, componentC] } );

		expect( query.collect().entities ).toContain( testEntity );

		testEntity.remove( componentC );

		expect( query.collect().entities ).not.toContain( testEntity );

		query.destroy();
		testEntity.destroy();
	} );

	it( 'should return a stable entity set', () => {
		const query = new Query( { has: [componentB, componentC] } );

		const { entities } = query.collect();

		const testEntity = new Entity([componentB, componentC]);

		expect( entities ).not.toContain( testEntity );

		query.destroy();
		testEntity.destroy();
	} );

	it( 'should list added entities if configured', () => {
		const query = new Query( { has: [componentB, componentC], trackAdded: true } );
		const testEntity = new Entity([componentB, componentC]);

		expect( query.collect().added ).toContain( testEntity );

		query.destroy();
		testEntity.destroy();
	} );

	it( 'should list removed entities if configured', () => {
		const query = new Query( { has: [componentB, componentC], trackRemoved: true } );
		const testEntity = new Entity([componentB, componentC]);

		query.collect();

		testEntity.remove( componentB );

		expect( query.collect().removed ).toContain( testEntity );

		query.destroy();
		testEntity.destroy();
	} );

	it( 'should list destroyed entities as removed', () => {
		const query = new Query( { has: [componentB, componentC], trackRemoved: true } );
		const testEntity = new Entity([componentB, componentC]);

		query.collect();

		testEntity.destroy();

		expect( query.collect().removed ).toContain( testEntity );

		query.destroy();
	} );

	it( 'should not list destroyed entities as qualified', () => {
		const query = new Query( { has: [componentB, componentC] } );
		const testEntity = new Entity([componentB, componentC]);

		query.collect();

		testEntity.destroy();

		expect( query.collect().entities ).not.toContain( testEntity );

		query.destroy();
	} );


	it( 'should not list destroyed entities as mutated', () => {
		const query = new Query( { has: [componentB, componentC], trackMutated: [componentB] } );
		const testEntity = new Entity([componentB, componentC]);

		query.collect();

		testEntity.getMutable( componentB );
		testEntity.destroy();

		expect( query.collect().mutated ).not.toContain( testEntity );

		query.destroy();
	} );


	it( 'should handle entities added/removed multiple times', () => {
		const query = new Query( {
			has: [componentB, componentC],
			trackRemoved: true,
			trackAdded: true,
		} );
		const testEntityA = new Entity([componentB, componentC]);
		const testEntityB = new Entity([componentC]);

		const testEntityC = new Entity([componentB, componentC]);
		const testEntityD = new Entity([componentC]);

		query.collect();

		testEntityA.remove( componentB );
		testEntityA.add( componentB );

		testEntityB.add( componentB );
		testEntityB.remove( componentB );

		testEntityC.remove( componentB );
		testEntityC.add( componentB );
		testEntityC.remove( componentB );

		testEntityD.add( componentB );
		testEntityD.remove( componentB );
		testEntityD.add( componentB );

		const result = query.collect();

		expect( result.removed ).toContain( testEntityA );
		expect( result.added ).toContain( testEntityA );
		expect( result.entities ).toContain( testEntityA );

		expect( result.removed ).not.toContain( testEntityB );
		expect( result.added ).not.toContain( testEntityB );
		expect( result.entities ).not.toContain( testEntityB );

		expect( result.removed ).toContain( testEntityC );
		expect( result.added ).not.toContain( testEntityC );
		expect( result.entities ).not.toContain( testEntityC );

		expect( result.removed ).not.toContain( testEntityD );
		expect( result.added ).toContain( testEntityD );
		expect( result.entities ).toContain( testEntityD );

		query.destroy();
		testEntityA.destroy();
		testEntityB.destroy();
		testEntityC.destroy();
		testEntityD.destroy();
	} );

	it( 'should only list entities added/removed since last collect()', () => {
		const query = new Query( {
			has: [componentB, componentC],
			trackRemoved: true,
			trackAdded: true,
		} );

		const testEntityA = new Entity([componentB, componentC]);
		const testEntityB = new Entity([componentC]);
		const testEntityC = new Entity([componentB, componentC]);
		const testEntityD = new Entity([componentC]);

		query.collect();

		testEntityC.remove( componentB );
		testEntityD.add( componentB );

		query.collect();

		testEntityA.remove( componentB );
		testEntityB.add( componentB );

		const result = query.collect();

		expect( result.added.size ).toBe( 1 );
		expect( result.added ).toContain( testEntityB );
		expect( result.removed.size ).toBe( 1 );
		expect( result.removed ).toContain( testEntityA );

		query.destroy();
		testEntityA.destroy();
		testEntityB.destroy();
		testEntityC.destroy();
		testEntityD.destroy();
	} );

	it( 'should initially list all matching entities as added', () => {
		const query = new Query( {
			has: [componentB, componentC],
			trackAdded: true,
		} );

		const result = query.collect();

		expect( result.added ).toContain( abcEntity );
		expect( result.added ).toContain( bcEntity );

		query.destroy();
	} );


	it( 'should list mutated entities if configured', () => {
		const query = new Query( {
			has: [componentB, componentC],
			trackMutated: [componentB],
		} );
		const testEntity = new Entity([componentB, componentC]);
		const testEntity2 = new Entity([componentB, componentC]);

		testEntity.getMutable( componentB );

		const result = query.collect();

		expect( result.mutated ).toContain( testEntity );
		expect( result.mutated.size ).toBe( 1 );

		query.destroy();
		testEntity.destroy();
		testEntity2.destroy();
	} );


	it( 'should only list mutations to specified components', () => {
		const query = new Query( {
			has: [componentB, componentC],
			trackMutated: [componentB],
		} );

		const testEntity = new Entity([componentB, componentC]);

		testEntity.getMutable( componentC );

		const result = query.collect();

		expect( result.mutated ).not.toContain( testEntity );
		expect( result.mutated.size ).toBe( 0 );

		query.destroy();
		testEntity.destroy();
	} );


	it( 'should only list mutations since last collect()', () => {
		const query = new Query( {
			has: [componentB],
			trackMutated: [componentB],
		} );

		const testEntity = new Entity([componentB]);
		const testEntity2 = new Entity([componentB]);

		testEntity.getMutable( componentB );

		query.collect();

		testEntity2.getMutable( componentB );

		const result = query.collect();

		expect( result.mutated.size ).toBe( 1 );
		expect( result.mutated ).toContain( testEntity2 );

		query.destroy();
		testEntity.destroy();
		testEntity2.destroy();
	} );


	it( 'should not list mutations if entity was not listed in last result', () => {
		const query = new Query( {
			has: [componentB],
			trackMutated: [componentB],
		} );

		const testEntity = new Entity();

		query.collect();

		testEntity.add( componentB );
		testEntity.getMutable( componentB );
		testEntity.remove( componentB );

		const result = query.collect();

		expect( result.mutated.size ).toBe( 0 );

		query.destroy();
		testEntity.destroy();
	} );


	it( 'should not list mutations of removed entities', () => {
		const query = new Query( {
			has: [componentB, componentC],
			trackMutated: [componentB],
		} );

		const testEntity = new Entity([componentB, componentC]);

		testEntity.remove( componentC );
		testEntity.getMutable( componentB );

		const result = query.collect();

		expect( result.mutated.size ).toBe( 0 );

		query.destroy();
		testEntity.destroy();
	} );


	it( 'should not list entities mutated before they qualified', () => {
		const query = new Query( {
			has: [componentB, componentC],
			trackMutated: [componentB],
		} );

		const testEntity = new Entity([componentB]);

		testEntity.getMutable( componentB );
		testEntity.add( componentC );

		const result = query.collect();

		expect( result.mutated.size ).toBe( 0 );

		query.destroy();
		testEntity.destroy();
	} );

	it( 'should report being destroyed correctly', () => {
		const query = new Query( {
			has: [componentB, componentC],
		} );

		expect( query.isDestroyed() ).toBeFalse();

		query.destroy();

		expect( query.isDestroyed() ).toBeTrue();
	} );


	it( 'should only list qualifiying entities in the same world', () => {
		const world = new World();
		const query = new Query( {
			has: [componentB, componentC],
			world,
		} );
		const bcEntityInCustomWorld = new Entity([
			componentB,
			componentC,
		], world );

		const result = query.collect();

		expect( result.entities ).toContain( bcEntityInCustomWorld );
		expect( result.entities ).not.toContain( bcEntity );

		world.destroy();
	} );

	it( 'should query defaultWorld by default', () => {
		const query = new Query( {
			has: [componentB, componentC],
		} );
		const bcEntityInDefaultWorld = new Entity([
			componentB,
			componentC,
		], defaultWorld );

		const result = query.collect();

		expect( result.entities ).toContain( bcEntityInDefaultWorld );

		bcEntityInDefaultWorld.destroy();
		query.destroy();
	} );
} );
