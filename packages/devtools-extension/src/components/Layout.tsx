import React, { ReactElement } from 'react';
import useGlobalStore from '../stores/global';
import Canvas from './Canvas';
import NoConnection from './NoConnection';
import Sidebar from './Sidebar';


const Layout = (): ReactElement => {
	const isConnected = useGlobalStore( ( state ) => state.isConnected );

	return (
		isConnected ? (
			<div className="wrapper">
				<Sidebar />
				<Canvas />
			</div>
		) : <NoConnection />
	);
};

export default Layout;
