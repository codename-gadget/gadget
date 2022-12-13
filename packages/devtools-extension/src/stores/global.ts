import type { MonitorProps, GroupProps } from '@gdgt/devtools';
import create from 'zustand';
import MonitorController from '../panel/MonitorController';
import useVisibilityStore from './visibility';


type Group = {
	id: string,
	name: string,
	monitors: string[]
};

const useGlobalStore = create<{
	isConnected: boolean,
	origins: string[],
	groups: Group[],
	monitors: Record<string, {
		name: string,
		color: string,
		controller: MonitorController,
	}>,
	addOrigin:( origin: string ) => void,
	propagateOrigins: () => void,
	addMonitor: ( id: string ) => void,
	updateMonitorConfig: ( id: string, props: MonitorProps ) => void,
	resetMonitors: () => void;
	ensureGroupExists: ( id: string ) => void,
	addToGroup: ( id: string, monitor: string ) => void,
	updateGroupConfig: ( id: string, props: GroupProps ) => void,
}>( ( set, get ) => ( {
			isConnected: false,
			origins: [],
			monitors: {},
			groups: [
				{
					id: '_custom',
					name: 'Custom',
					monitors: [],
				},
			],
			addOrigin: ( origin ) => {
				if ( !get().origins.includes( origin ) ) {
					set( {
						origins: [
							...get().origins,
							origin,
						],
					} );

					get().propagateOrigins();
				}
			},
			addMonitor: ( id ) => {
				const controller = new MonitorController();
				const group = id.match( /^(\w+)\// );

				set( {
					monitors: {
						...get().monitors,
						[id]: {
							name: id,
							color: `hsl(${
								controller.baseColor[0]},${
								controller.baseColor[1]}%,${
								controller.baseColor[2]}%)`,
							controller,
						},
					},
				} );

				controller.setConfig( {
					name: id,
				} );

				get().propagateOrigins();

				get().addToGroup( group ? group[1] : '_custom', id );
			},
			updateMonitorConfig: ( id, props ) => {
				const newValue = { ...get().monitors };

				newValue[id].controller.setConfig( props );
				newValue[id].name = props.name;

				set( {
					monitors: newValue,
				} );
			},
			resetMonitors: () => {
				Object.values( get().monitors ).forEach( ( m ) => m.controller.reset() );
			},
			ensureGroupExists: ( id ) => {
				if ( !get().groups.find( ( ( g ) => g.id === id ) ) ) {
					const groups = [
						...get().groups,
						{
							id,
							name: id,
							monitors: [],
						},
					].sort( ( a, b ) => a.id.localeCompare( b.id ) );


					set( {
						groups,
					} );
				}
			},
			addToGroup: ( id, monitor ) => {
				get().ensureGroupExists( id );

				const groups = [...get().groups];
				const index = groups.findIndex( ( g ) => g.id === id );

				groups[index].monitors.push( monitor );
				groups[index].monitors.sort( ( a, b ) => a.localeCompare( b ) );

				set( {
					groups,
				} );
			},
			updateGroupConfig: ( id, props ) => {
				get().ensureGroupExists( id );

				const groups = [...get().groups];
				const index = groups.findIndex( ( g ) => g.id === id );

				groups[index].name = props.name;

				set( {
					groups,
				} );
			},
			propagateOrigins: () => {
				const visibleOrigins = get().origins.filter( ( origin ) => (
					!useVisibilityStore.getState().hiddenOrigins.includes( origin )
				) );

				Object.values( get().monitors ).forEach( ( m ) => {
					m.controller.setVisibleOrigins( visibleOrigins );
				} );
			},
		} ) );


useVisibilityStore.subscribe( ( current, prev ) => {
	if ( prev.hiddenOrigins !== current.hiddenOrigins ) {
		useGlobalStore.getState().propagateOrigins();
	}
} );


export default useGlobalStore;
