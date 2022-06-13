/**
 * Error thrown when a symbol is missing from the compiled program.
 *
 * @internal
 */
export default class SymbolMissingError extends Error {
	public constructor( name: string, kind: string, info = '' ) {
		super( `The ${kind} called "${name}" ${info ? `(${info}) ` : ''}is unexpectedly missing after converting to GLES3.0. \n`
                    + 'This is likely due to a naming conflict.\nPlease make sure you\'re following symbol naming conventions.'
                    + ' (avoid names starting with "gl_" or an underscore)\n' );
	}
}
