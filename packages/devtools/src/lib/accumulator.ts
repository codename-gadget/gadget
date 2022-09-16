import type {
	DevtoolReport, WrappedDevtoolMessage, WrappedDevtoolReport,
} from '../types/DevtoolMessage';


// queue reports over the duration of one frame to bundle them
let reports: DevtoolReport[];
let timeout: number | NodeJS.Timeout | null = null;

// collect all registration messages to resend
let registerMessages: DevtoolReport[];
// collect the latest update message per monitor to resend
let updateMessages: Record<string, DevtoolReport>;


if ( __DEV_BUILD__ ) {
	reports = [];
	registerMessages = [];
	updateMessages = {};

	const sendClientRegistration = (): void => {
		postMessage( {
			type: 'gadget-devtools-report',
			reports: [
				{
					intent: 'register_client',
					value: {
						// eslint-disable-next-line no-restricted-globals
						location: location.origin + location.pathname,
					},
				},
				...registerMessages,
				...Object.values( updateMessages ),
			],
			// eslint-disable-next-line no-restricted-globals
			origin: location.origin + location.pathname,
		} as WrappedDevtoolReport );
	};

	// eslint-disable-next-line no-restricted-globals
	addEventListener( 'message', ( event: MessageEvent<WrappedDevtoolMessage> ) => {
		if ( event.data?.type !== 'gadget-devtools-message' ) {
			return;
		}

		if ( event.data.message.intent === 'send_registration' ) {
			sendClientRegistration();
		}
	} );

	// immediately send registration to account for scripts that are added after
	// registration has already been requested. (e.g. workers)
	sendClientRegistration();
}

function delay( callback: () => void ): number | NodeJS.Timeout {
	if ( typeof requestAnimationFrame !== 'undefined' ) {
		return requestAnimationFrame( callback );
	}

	return setTimeout( callback, 16 );
}

/**
 * Queues a message for sending.
 * Bundles together all messages send during a frame.
 *
 * @param msg - The message to send.
 * @internal
 */
export default function send( msg: DevtoolReport ): void {
	if ( __DEV_BUILD__ ) {
		reports.push( msg );

		if ( msg.intent.includes( 'register' ) ) {
			// store all registration messages for resending
			registerMessages.push( msg );
		} else if ( msg.intent === 'update_monitor' ) {
			// store the latest update message per monitor to resend
			updateMessages[msg.value.id] = msg;
		}

		if ( timeout === null ) {
			timeout = delay( () => {
				timeout = null;
				postMessage( {
					type: 'gadget-devtools-report',
					reports: [
						...reports,
					],
					// eslint-disable-next-line no-restricted-globals
					origin: location.origin + location.pathname,
				} as WrappedDevtoolReport );
				reports.length = 0;
			} );
		}
	}
}
