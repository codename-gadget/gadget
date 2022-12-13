import type { WrappedDevtoolMessage, WrappedDevtoolReport } from '@gdgt/devtools';


// forward devtool messages from/to workers
window.Worker = class ProxiedWorker extends Worker {
	public constructor( ...props: ConstructorParameters<typeof Worker> ) {
		super( ...props );
		this.addEventListener( 'message', ( event: MessageEvent<WrappedDevtoolReport> ) => {
			if ( event.data?.type === 'gadget-devtools-report' ) {
				postMessage( event.data );
			}
		} );

		// eslint-disable-next-line no-restricted-globals
		addEventListener( 'message', ( event: MessageEvent<WrappedDevtoolMessage> ) => {
			if ( event.data?.type === 'gadget-devtools-message' ) {
				this.postMessage( event.data );
			}
		} );
	}
};

