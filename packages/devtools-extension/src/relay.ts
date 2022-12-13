import { Message } from './types/Message';


const devtoolConnections = new Map<number, chrome.runtime.Port>();
const clientConnections = new Map<number, chrome.runtime.Port>();
const waitingClients = new Set<number>();

chrome.runtime.onConnect.addListener( ( port ) => {
	// listen for messages from devtool tab and content script
	const listener = ( message: Message ): void => {
		const tabId = message.type === 'init' ? message.tabId : port.sender.tab?.id;
		let isInit = false;

		if ( message.type === 'init' ) {
			// message coming from devtool tab,
			// specifying the tab from which client updates will originate
			devtoolConnections.set( tabId, port );
			isInit = true;
		} else if ( message.type === 'client_report' || message.type === 'client_ready' ) {
			// message from a content script,
			// forward to the relevant devtool tab
			devtoolConnections.get( tabId )?.postMessage( message );
		}

		if ( message.type === 'client_ready' ) {
			// the client is alive and ready, store its port and add it to the waiting list
			clientConnections.set( tabId, port );
			waitingClients.add( tabId );
		}

		// if we have both a client waiting and a devtools panel for the same tab,
		// tell both that we're ready.
		// An exception to this is if the panel has been opened and closed –
		// in that case we won't have a waiting client. To mitigate this, we also send
		// the ready message every time the devtools panel is (re-)initialized.
		if ( ( waitingClients.has( tabId ) || isInit ) && devtoolConnections.has( tabId ) ) {
			waitingClients.delete( tabId );

			clientConnections.get( tabId )?.postMessage( {
				type: 'devtools_ready',
			} as Message );
		}
	};

	port.onMessage.addListener( listener );

	port.postMessage( {
		type: 'relay_ready',
	} as Message );

	port.onDisconnect.addListener( ( disconnectedPort ) => {
		disconnectedPort.onMessage.removeListener( listener );
		devtoolConnections.forEach( ( p, id ) => {
			if ( p === disconnectedPort ) {
				devtoolConnections.delete( id );
			}
		} );

		clientConnections.forEach( ( p, id ) => {
			if ( p === disconnectedPort ) {
				clientConnections.delete( id );
				waitingClients.delete( id );
			}
		} );
	} );
} );
