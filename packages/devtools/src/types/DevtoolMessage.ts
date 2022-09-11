import { GroupProps } from '../lib/group';
import type { MonitorProps } from '../lib/monitor';


/**
 * @internal
 */
export type DevtoolReport = {
	intent: 'register_monitor',
	value: Required<MonitorProps>,
} | {
	intent: 'register_group',
	value: Required<GroupProps>,
} | {
	intent: 'increment_monitor',
	value: {
		id: string
	},
} | {
	intent: 'decrement_monitor',
	value: {
		id: string
	},
} | {
	intent: 'update_monitor',
	value: {
		id: string,
		value: number
	},
} | {
	intent: 'register_client',
	value: {
		location: string,
	}
};


/**
 * @internal
 */
export type DevtoolMessage = {
	intent: 'send_registration'
};


/**
 * @internal
 */
export type WrappedDevtoolMessage = {
	type: 'gadget-devtools-message',
	message: DevtoolMessage,
};


/**
 * @internal
 */
export type WrappedDevtoolReport = {
	type: 'gadget-devtools-report',
	reports: DevtoolReport[]
	origin: string,
};
