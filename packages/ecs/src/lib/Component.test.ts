import declareComponent from './Component';


describe( 'declareComponent', () => {
	it( 'should provide a declaration with only a default value supplied', () => {
		const testComponent = declareComponent( () => ( {
			test: 'A',
		} ) );

		expect( testComponent ).toHaveSize( 2 );
		expect( testComponent[0]).toBeInstanceOf( Symbol );
		expect( testComponent[1]().test ).toBe( 'A' );
	} );

	it( 'should provide a declaration with identifier and default value supplied', () => {
		const testComponent = declareComponent( Symbol.for( 'test' ), () => ( {
			test: 'B',
		} ) );

		expect( testComponent ).toHaveSize( 2 );
		expect( testComponent[0]).toBe( Symbol.for( 'test' ) );
		expect( testComponent[1]().test ).toBe( 'B' );
	} );

	it( 'should reuse existing symbol, given a string identifier', () => {
		const testSymbol = Symbol.for( 'fizz' );

		const testComponent = declareComponent( 'fizz', () => ( {
			test: 'A',
		} ) );

		expect( testComponent[0]).toEqual( testSymbol );
	} );

	it( 'should throw on redeclaration', () => {
		declareComponent( 'buzz', () => ( {
			test: 'A',
		} ) );

		expect( () => {
			declareComponent( 'buzz', () => ( {
				test: 'A',
			} ) );
		} ).toThrow();
	} );
} );
