import resolutionForLevel from './resolutionForLevel';


describe( 'resolutionForLevel', () => {
	it( 'should return correct resolution for power of two sizes', () => {
		expect( resolutionForLevel( 1024, 0 ) ).toEqual( 1024 );
		expect( resolutionForLevel( 1024, 1 ) ).toEqual( 512 );
		expect( resolutionForLevel( 1024, 2 ) ).toEqual( 256 );
		expect( resolutionForLevel( 1024, 3 ) ).toEqual( 128 );
		expect( resolutionForLevel( 1024, 4 ) ).toEqual( 64 );
		expect( resolutionForLevel( 1024, 5 ) ).toEqual( 32 );
		expect( resolutionForLevel( 1024, 6 ) ).toEqual( 16 );
		expect( resolutionForLevel( 1024, 7 ) ).toEqual( 8 );
		expect( resolutionForLevel( 1024, 8 ) ).toEqual( 4 );
		expect( resolutionForLevel( 1024, 9 ) ).toEqual( 2 );
		expect( resolutionForLevel( 1024, 10 ) ).toEqual( 1 );
	} );

	it( 'should return correct resolution for non power of two sizes', () => {
		expect( resolutionForLevel( 57, 0 ) ).toEqual( 57 );
		expect( resolutionForLevel( 57, 1 ) ).toEqual( 28 );
		expect( resolutionForLevel( 57, 2 ) ).toEqual( 14 );
		expect( resolutionForLevel( 57, 3 ) ).toEqual( 7 );
		expect( resolutionForLevel( 57, 4 ) ).toEqual( 3 );
		expect( resolutionForLevel( 57, 5 ) ).toEqual( 1 );

		expect( resolutionForLevel( 43, 0 ) ).toEqual( 43 );
		expect( resolutionForLevel( 43, 1 ) ).toEqual( 21 );
		expect( resolutionForLevel( 43, 2 ) ).toEqual( 10 );
		expect( resolutionForLevel( 43, 3 ) ).toEqual( 5 );
		expect( resolutionForLevel( 43, 4 ) ).toEqual( 2 );
		expect( resolutionForLevel( 43, 5 ) ).toEqual( 1 );
	} );
} );
