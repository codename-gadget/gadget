import send from './accumulator';


export interface GroupProps {
	/**
	 * The groups id, i.e. its "namespace".
	 *
	 * If a groups id is `"example"`, a monitor with
	 * an id of `"example/mymonitor"` will be listed in that group.
	 */
	id: string,
	/** The groups human-readable name. */
	name: string,
}


/**
 * Registers a monitor group.
 *
 * @param param0 - See {@linkcode GroupProps}
 */
export function registerGroup( { id, name }: GroupProps ): void {
	if ( __DEV_BUILD__ ) {
		send( {
			intent: 'register_group',
			value: {
				id,
				name,
			},
		} );
	}
}
