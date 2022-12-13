import React, { ReactElement } from 'react';
import shallow from 'zustand/shallow';
import useGlobalStore from '../stores/global';
import useVisibilityStore from '../stores/visibility';


const Sidebar = (): ReactElement => {
	const [
		hiddenOrigins, setOriginVisibility, visibleMonitors, setMonitorVisibility,
	] = useVisibilityStore(
		( store ) => [
			store.hiddenOrigins,
			store.setOriginVisibility,
			store.visibleMonitors,
			store.setMonitorVisibility,
		],
		shallow,
	);
	const originList = useGlobalStore( ( store ) => store.origins );
	const [monitors, groups] = useGlobalStore( ( store ) => [store.monitors, store.groups], shallow );


	return (
		<aside>
			<img className="logo" src="../icons/icon.svg" alt="Gadget logo" width="48" height="48" />
			<hr />
			<ol className="origins">
				{originList.map( ( origin ) => {
					const isVisible = !hiddenOrigins.includes( origin );

					return (
						<label key={origin} htmlFor={`${origin}-visibility`}>
							<li>
								<input
									type="checkbox"
									id={`${origin}-visibility`}
									checked={isVisible}
									onChange={() => {
										setOriginVisibility( origin, !isVisible );
									}}
								/>
								<span>
									{origin.replace( /^https?:\/\/|\/$/g, '' )}
								</span>
							</li>
						</label>
					);
				} )}
			</ol>
			<hr />
			{groups.map( ( group ) => {
				if ( group.monitors.length < 1 ) return null;

				const fullyVisible = !group.monitors.some( ( m ) => !visibleMonitors.includes( m ) );
				const partiallyVisible = fullyVisible
					? false
					: group.monitors.some( ( m ) => visibleMonitors.includes( m ) );

				return (
					<div key={group.id} className="group">
						<label htmlFor={`${group.id}-visibility`} className="group-header">
							<input
								type="checkbox"
								id={`${group.id}-visibility`}
								checked={fullyVisible}
								ref={( checkbox ) => {
									if ( checkbox ) {
										// eslint-disable-next-line no-param-reassign
										checkbox.indeterminate = partiallyVisible;
									}
								}}
								onChange={() => {
									group.monitors.forEach( ( m ) => {
										setMonitorVisibility( m, !fullyVisible );
									} );
								}}
							/>
							{group.name}
						</label>
						<ol>
							{group.monitors.map( ( id ) => {
								const isVisible = visibleMonitors.includes( id );

								return (
									<label key={id} htmlFor={`${id}-visibility`} style={{ accentColor: monitors[id].color }}>
										<li>
											<input
												type="checkbox"
												id={`${id}-visibility`}
												checked={isVisible}
												onChange={() => {
													setMonitorVisibility( id, !isVisible );
												}}
											/>
											<span>
												{monitors[id].name}
											</span>
										</li>
									</label>
								);
							} )}
						</ol>
					</div>
				);
			} )}
		</aside>
	);
};

export default Sidebar;
