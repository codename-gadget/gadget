/* eslint-disable no-console */
interface DevLogProps {
	/**
	 * the message to log
	 */
	msg: string;

	/**
	 * Whether to log a warning, error or info.
	 *
	 * @defaultValue 'warn'
	 */
	level?: 'info' | 'warn' | 'error';

	/** Stuff to log inside a collapsable group. Arrays will be unrolled and logged line by line. */
	groupContent?: unknown;

	/**
	 * The group's label. Only relevant if groupContent is set.
	 *
	 * @defaultValue 'more info'
	 */
	groupLabel?: string;

	/**
	 * Whether to log the group in an expanded state.
	 *
	 * @defaultValue false
	 */
	expanded?: boolean;
}


/**
 * Logs a verbose error or warning to console, which will be omitted from prod builds.
 *
 * @param props - DevLogProps
 */
export function devLog( {
	msg,
	level = 'warn',
	groupContent,
	groupLabel = 'more info',
	expanded,
}: DevLogProps ): void {
	// exclude code from prod build.
	// ideally each devLog call should be wrapped as well
	if ( __DEV_BUILD__ ) {
		const log = `%c☢%c [DEV]%c ${msg}`;
		const styles = [
			'background: orange; color: black; padding: 0 .4em; border-radius: .25em;',
			'color: grey;',
			'',
		];

		switch ( level ) {
			case 'error':
				console.error( log, ...styles );
				break;

			case 'info':
				console.info( log, ...styles );
				break;

			default:
				console.warn( log, ...styles );
				break;
		}

		if ( groupContent ) {
			( expanded ? console.group : console.groupCollapsed )( groupLabel );
			if ( Array.isArray( groupContent ) ) {
				groupContent.forEach( ( c ) => console.log( c ) );
			} else {
				console.log( groupContent );
			}
			console.groupEnd();
		}
	}
}


/**
 * Logs a short, generic error to console, along with a reference to the dev build.
 *
 * @param subject - Optional subject of the error.
 */
export function prodLog( subject = '' ): void {
	console.error( `[gadget] ${subject} error. \n(Use dev build for more info)` );
}
