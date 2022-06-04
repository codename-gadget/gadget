import declareComponent from './Component';
import Entity from './Entity';


describe( 'Entity', () => {
	const xComponent = declareComponent( 'x', () => ( { x: 0 } ) );
	const yComponent = declareComponent( 'y', () => ( { y: 0 } ) );

	it( 'should report added components', () => {
		const entity = new Entity();

		entity.add( xComponent );

		expect( entity.has( xComponent ) ).toBeTrue();

		entity.destroy();
	} );


	it( 'should not report removed components', () => {
		const entity = new Entity([xComponent]);

		entity.remove( xComponent );

		expect( entity.has( xComponent ) ).toBeFalse();

		entity.destroy();
	} );


	it( 'should add components provided in constructor', () => {
		const entity = new Entity([xComponent, yComponent]);

		expect( entity.has( xComponent ) ).toBeTrue();
		expect( entity.has( yComponent ) ).toBeTrue();

		entity.destroy();
	} );


	it( 'should provide a frozen value when reading a component', () => {
		const entity = new Entity([xComponent, yComponent]);

		expect( Object.isFrozen( entity.get( xComponent ) ) ).toBeTrue();

		entity.destroy();
	} );


	it( 'should not provide a frozen value when reading a component mutably', () => {
		const entity = new Entity([xComponent, yComponent]);

		expect( Object.isFrozen( entity.getMutable( xComponent ) ) ).toBeFalse();

		entity.destroy();
	} );


	it( 'should hold changes to component', () => {
		const testComponent = declareComponent( () => ( { test: 1 } ) );

		const entity = new Entity([testComponent]);

		entity.getMutable( testComponent ).test = 10;

		expect( entity.get( testComponent ).test ).toBe( 10 );

		entity.destroy();
	} );


	it( 'should return undefined for components that are not present', () => {
		const entity = new Entity();

		expect( entity.get( xComponent ) ).toBeUndefined();
		expect( entity.getMutable( xComponent ) ).toBeUndefined();

		entity.destroy();
	} );


	it( 'should not overwrite existing components', () => {
		const testComponent = declareComponent( () => ( { test: 1 } ) );

		const entity = new Entity([testComponent]);

		entity.getMutable( testComponent ).test = 10;
		entity.add( testComponent );

		expect( entity.get( testComponent ).test ).toBe( 10 );

		entity.destroy();
	} );


	it( 'should remove all components when destroyed', () => {
		const entity = new Entity([xComponent, yComponent]);

		entity.destroy();

		expect( entity.has( xComponent ) ).toBeFalse();
		expect( entity.has( yComponent ) ).toBeFalse();
	} );


	it( 'should call mutation observer on getMutable', () => {
		const entity = new Entity([xComponent, yComponent]);
		const callback = jasmine.createSpy();

		entity.addMutationObserver( xComponent, callback );

		entity.getMutable( xComponent );
		entity.getMutable( yComponent );

		expect( callback ).toHaveBeenCalledOnceWith( entity );

		entity.destroy();
	} );


	it( 'should not call mutation observer after removal', () => {
		const entity = new Entity([xComponent, yComponent]);
		const callback = jasmine.createSpy();

		entity.addMutationObserver( xComponent, callback );
		entity.removeMutationObserver( xComponent, callback );

		const removeObserver = entity.addMutationObserver( yComponent, callback );

		removeObserver();

		entity.getMutable( xComponent );
		entity.getMutable( yComponent );

		expect( callback ).not.toHaveBeenCalled();

		entity.destroy();
	} );


	it( 'should not call mutation observer when adding/removing components', () => {
		const entity = new Entity([yComponent]);
		const callback = jasmine.createSpy();

		entity.addMutationObserver( xComponent, callback );
		entity.addMutationObserver( yComponent, callback );

		entity.remove( yComponent );
		entity.add( xComponent );

		expect( callback ).not.toHaveBeenCalled();

		entity.destroy();
	} );


	it( 'should track mutations for components added after the observer', () => {
		const entity = new Entity();
		const callback = jasmine.createSpy();

		entity.addMutationObserver( xComponent, callback );

		entity.add( xComponent );
		entity.getMutable( xComponent );

		expect( callback ).toHaveBeenCalledOnceWith( entity );

		entity.destroy();
	} );


	it( 'should not add the same mutation observer twice', () => {
		const entity = new Entity([xComponent]);
		const callback = jasmine.createSpy();

		entity.addMutationObserver( xComponent, callback );
		entity.addMutationObserver( xComponent, callback );

		entity.getMutable( xComponent );

		expect( callback ).toHaveBeenCalledOnceWith( entity );

		entity.destroy();
	} );


	it( 'should handle a non-existent mutation observer being removed', () => {
		const entity = new Entity([xComponent]);
		const callback = jasmine.createSpy();

		expect( () => {
			entity.removeMutationObserver( xComponent, callback );
			entity.destroy();
		} ).not.toThrow();
	} );
} );
