import type { WrappedDevtoolMessage, WrappedDevtoolReport } from '@gdgt/devtools';
import { Message } from '../types/message';


// inject worker proxy to forward messages from/to workers
const s = document.createElement( 'script' );

s.src = chrome.runtime.getURL( 'client/worker-proxy.js' );
document.head.appendChild( s );


let ready = false;

// connect to relay
const port = chrome.runtime.connect( {
	name: 'gadget-devtools',
} );

port.onMessage.addListener( ( msg: Message ) => {
	if ( msg.type === 'relay_ready' ) {
		// once a connection to the relay is established,
		// let it know that we're alive and ready
		port.postMessage( {
			type: 'client_ready',
		} as Message );
	} else if ( msg.type === 'devtools_ready' ) {
		// don't send messages until the devtools panel is ready
		ready = true;

		// instruct @gdgt/devtools to replay all registration
		// messages that were sent up until now
		postMessage( {
			type: 'gadget-devtools-message',
			message: {
				intent: 'send_registration',
			},
		} as WrappedDevtoolMessage );
	}
} );

port.onDisconnect.addListener( () => {
	ready = false;
	// eslint-disable-next-line no-console
	console.error( 'Gadget DevTools: Connection to devtools lost. Please reload the page.' );
} );


window.addEventListener( 'message', ( event: MessageEvent<WrappedDevtoolReport> ) => {
	// filter out unrelated messages
	if ( event.data?.type !== 'gadget-devtools-report' ) {
		return;
	}

	const msg: Message = {
		type: 'client_report',
		reports: event.data.reports,
		origin: event.data.origin,
	};

	if ( ready ) {
		// forward message to relay
		port.postMessage( msg );
	}
}, false );
