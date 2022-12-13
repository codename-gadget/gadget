import create from 'zustand';
import { persist } from 'zustand/middleware';


const useVisibilityStore = create( persist<{
	hiddenOrigins: string[],
	visibleMonitors: string[],
	setOriginVisibility:( id: string, visible: boolean ) => void,
	setMonitorVisibility:( id: string, visible: boolean ) => void,
}>( ( set, get ) => ( {
			hiddenOrigins: [],
			visibleMonitors: [],
			setOriginVisibility: ( id, visible ) => {
				if ( visible && get().hiddenOrigins.includes( id ) ) {
					const hiddenOrigins = [...get().hiddenOrigins];

					hiddenOrigins.splice( hiddenOrigins.findIndex( ( o ) => o === id ), 1 );

					set( {
						hiddenOrigins,
					} );
				} else if ( !visible && !get().hiddenOrigins.includes( id ) ) {
					const hiddenOrigins = [...get().hiddenOrigins];

					hiddenOrigins.push( id );

					set( {
						hiddenOrigins,
					} );
				}
			},
			setMonitorVisibility: ( id, visible ) => {
				if ( !visible && get().visibleMonitors.includes( id ) ) {
					const visibleMonitors = [...get().visibleMonitors];

					visibleMonitors.splice( visibleMonitors.findIndex( ( o ) => o === id ), 1 );

					set( {
						visibleMonitors,
					} );
				} else if ( visible && !get().visibleMonitors.includes( id ) ) {
					const visibleMonitors = [...get().visibleMonitors];

					visibleMonitors.push( id );

					set( {
						visibleMonitors,
					} );
				}
			},
		} ) ) );

export default useVisibilityStore;
