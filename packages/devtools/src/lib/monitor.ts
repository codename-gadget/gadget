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
	 *
	 * @defaultValue `count`
	 */
	type?: 'count' | 'rate',
	/** Unit to display next to the total. */
	unit?: string,
}


/**
 * Registers a monitor.
 *
 * @param param0 - See {@linkcode MonitorProps}.
 * @example
 * ```typescript
 * import { registerMonitor } from '@gdgt/devtools';
 *
 * registerMonitor( {
 *   id: 'mygroup/mymonitor',
 *   name: 'My Monitor',
 *   type: 'rate',
 * } );
 * ```
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
 * Increments a given monitor by a given value.
 *
 * @param id - id of the monitor to increment.
 * @param amount - The amount to increment by.
 */
export function incrementMonitor( id: string, amount = 1 ): void {
	if ( __DEV_BUILD__ ) {
		send( {
			intent: 'increment_monitor',
			value: {
				id,
				value: amount,
			},
		} );
	}
}


/**
 * Decrements a given monitor by a given value.
 *
 * @param id - id of the monitor to decrement.
 * @param amount - The amount to decrement by.
 */
export function decrementMonitor( id: string, amount = 1 ): void {
	if ( __DEV_BUILD__ ) {
		send( {
			intent: 'decrement_monitor',
			value: {
				id,
				value: amount,
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
