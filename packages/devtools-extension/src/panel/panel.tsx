import React from 'react';
import * as ReactDOM from 'react-dom/client';
import { Message } from '../types/message';
import Layout from '../components/Layout';
import useGlobalStore from '../stores/global';


const relay = chrome.runtime.connect( {
	name: 'gadget-devtools-panel',
} );

relay.onMessage.addListener( ( msg: Message ) => {
	if ( msg.type === 'client_ready' ) {
		useGlobalStore.getState().resetMonitors();
	}

	if ( msg.type === 'client_report' ) {
		const { origin } = msg;

		if ( origin && !( origin in useGlobalStore.getState().origins ) ) {
			useGlobalStore.getState().addOrigin( origin );
		}

		msg.reports.forEach( ( report ) => {
			const { intent, value } = report;

			if ( intent === 'register_client' ) {
				useGlobalStore.setState( {
					isConnected: true,
				} );

				return;
			}

			if ( intent === 'register_group' ) {
				useGlobalStore.getState().updateGroupConfig( value.id, value );

				return;
			}

			if ( !useGlobalStore.getState().monitors[value.id]) {
				useGlobalStore.getState().addMonitor( value.id );
			}

			const monitorController = useGlobalStore.getState().monitors[value.id].controller;


			switch ( intent ) {
				case 'decrement_monitor':
					monitorController.decrement( origin, value.value );
					break;

				case 'increment_monitor':
					monitorController.increment( origin, value.value );

					break;

				case 'update_monitor':
					monitorController.set( origin, value.value );

					break;


				case 'register_monitor':
					useGlobalStore.getState().updateMonitorConfig( value.id, value );
					break;

				default:
					break;
			}
		} );
	}
} );

relay.postMessage( {
	type: 'init',
	tabId: chrome.devtools.inspectedWindow.tabId,
} as Message );


const root = ReactDOM.createRoot( document.getElementById( 'root' ) );


root.render( <Layout /> );
