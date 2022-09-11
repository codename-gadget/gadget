import { GroupProps } from '../lib/group';
import type { MonitorProps } from '../lib/monitor';


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


export type DevtoolMessage = {
	intent: 'send_registration'
};

export type WrappedDevtoolMessage = {
	type: 'gadget-devtools-message',
	message: DevtoolMessage,
};

export type WrappedDevtoolReport = {
	type: 'gadget-devtools-report',
	reports: DevtoolReport[]
	origin: string,
};
