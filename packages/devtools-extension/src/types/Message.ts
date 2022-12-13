import type { DevtoolReport } from '@gdgt/devtools';


export type Message = {
	type: 'init',
	tabId: number,
} | {
	type: 'relay_ready',
} | {
	type: 'client_ready',
} | {
	type: 'devtools_ready',
} | {
	type: 'client_report',
	reports: DevtoolReport[],
	origin: string,
};

