/* eslint-disable no-console */

let recentLogs: Set<unknown>;
let omitedMessages = 0;

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

	/** Stuff to log inside collapsable groups. */
	groups?: Record<string, {
		/**
		 * Whether to log the group in an expanded state.
		 *
		 * @defaultValue false
		 */
		expanded?: boolean;

		/** Stuff to log. Arrays will be unrolled and logged line by line. */
		content: unknown;
	}>
}


/**
 * Logs a verbose error or warning to console, which will be omitted from prod builds.
 *
 * @param props - DevLogProps
 */
export function devLog( props: DevLogProps ): void {
	// exclude code from prod build.
	// ideally each devLog call should be wrapped as well
	if ( __DEV_BUILD__ ) {
		const serialized = JSON.stringify( props );

		if ( recentLogs.has( serialized ) ) {
			omitedMessages += 1;

			return;
		}
		recentLogs.add( serialized );

		const {
			msg,
			level = 'warn',
			groups,
		} = props;
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

		if ( groups ) {
			Object.entries( groups ).forEach( ([label, { expanded, content }]) => {
				( expanded ? console.group : console.groupCollapsed )( label );
				if ( Array.isArray( content ) ) {
					content.forEach( ( c ) => console.log( c ) );
				} else {
					console.log( content );
				}
				console.groupEnd();
			} );
			console.log( '\n' );
		}
	}
}


if ( __DEV_BUILD__ ) {
	recentLogs = new Set();

	setInterval( () => {
		if ( omitedMessages > 0 ) {
			devLog( {
				msg: `omited ${omitedMessages} duplicate messages.`,
				level: 'info',
			} );
		}
		omitedMessages = 0;
		recentLogs.clear();
	}, 4000 );
}


/**
 * Logs a short, generic error to console, along with a reference to the dev build.
 *
 * @param subject - Optional subject of the error.
 */
export function prodLog( subject = '' ): void {
	console.error( `[gadget] ${subject} error. \n(Use dev build for more info)` );
}
