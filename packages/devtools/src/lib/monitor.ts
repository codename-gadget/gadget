import send from './accumulator';


export interface MonitorProps {
	/**
	 * The monitors (globally unique) id.
	 *
	 * @remarks
	 * You can group multiple monitors together by adding a "namespace" to the id.
	 * See {@linkcode registerGroup}.
	 */
	id: string,
	/** The monitors human-readable name. */
	name: string,
	/**
	 * How the monitored number should be displayed – `count` displaying a simple total,
	 * while `rate` shows increase per second.
	 */
	type?: 'count' | 'rate',
	/** Unit to display next to the total. */
	unit?: string,
}


/**
 * Registers a monitor.
 *
 * @param param0 - See {@linkcode MonitorProps}.
 */
export function registerMonitor( {
	id, name, type = 'count', unit = '',
}: MonitorProps ): void {
	if ( __DEV_BUILD__ ) {
		send( {
			intent: 'register_monitor',
			value: {
				id,
				name,
				type,
				unit,
			},
		} );
	}
}


/**
 * Increments a given monitor by 1.
 *
 * @param id - id of the monitor to increment.
 */
export function incrementMonitor( id: string ): void {
	if ( __DEV_BUILD__ ) {
		send( {
			intent: 'increment_monitor',
			value: {
				id,
			},
		} );
	}
}


/**
 * Decrements a given monitor by 1.
 *
 * @param id - id of the monitor to decrement.
 */
export function decrementMonitor( id: string ): void {
	if ( __DEV_BUILD__ ) {
		send( {
			intent: 'decrement_monitor',
			value: {
				id,
			},
		} );
	}
}


/**
 * Updates a monitor to a given value.
 *
 * @param id - id of the monitor to update.
 * @param value - The new value.
 */
export function updateMonitor( id: string, value: number ): void {
	if ( __DEV_BUILD__ ) {
		send( {
			intent: 'update_monitor',
			value: {
				id,
				value,
			},
		} );
	}
}
