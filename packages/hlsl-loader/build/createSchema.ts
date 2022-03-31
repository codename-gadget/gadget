// eslint-disable-next-line import/no-extraneous-dependencies
import { createGenerator } from 'ts-json-schema-generator';
import { writeFileSync, mkdirSync, existsSync } from 'fs';


// Generate JSON schemas from TS types
// and put them in ./schema/

const generator = createGenerator( {
	path: './src/types/Options.ts',
	tsconfig: './build/tsconfig-schema.json',
	expose: 'none',
	type: '*',
} );

const writeSchema = ( type: string ): void => {
	const schema = generator.createSchema( type );
	const definition = schema.definitions['*'] as Record<string, unknown>;

	delete schema.definitions;
	delete schema.$ref;

	const flattened = { ...schema, ...definition };

	writeFileSync(
		`./src/schema/${type}.json`,
		JSON.stringify( flattened, null, 2 ),
	);
};


if ( !existsSync( './src/schema' ) ) mkdirSync( './src/schema' );

writeSchema( 'HlslLoaderOptions' );
