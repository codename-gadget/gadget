import React, { ReactElement } from 'react';


const NoConnection = (): ReactElement => (
	<div className="no-connection">
		<img className="logo" src="../icons/icon.svg" alt="Gadget logo" width="48" height="48" />
		<span>No compatible dev build of gadget could be found on this page.</span>
	</div>
);

export default NoConnection;
