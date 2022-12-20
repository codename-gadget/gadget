import React, {
	ReactElement,
	useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import shallow from 'zustand/shallow';
import { graphHeight, graphPadding } from '../panel/MonitorController';
import useGlobalStore from '../stores/global';
import useVisibilityStore from '../stores/visibility';


const totalGraphHeight = ( graphHeight + graphPadding ) / devicePixelRatio;

const Canvas = (): ReactElement => {
	const canvas = useRef<HTMLCanvasElement>();
	const wrapper = useRef<HTMLCanvasElement>();
	const context = useRef<CanvasRenderingContext2D>();
	const hoverX = useRef<number>( null );
	const windowHeight = useRef<number>( null );
	const pageXOffset = useRef( 0 );
	const [width, setWidth] = useState( 0 );
	const [height, setHeight] = useState( 0 );
	const [monitors, groups] = useGlobalStore( ( state ) => [state.monitors, state.groups], shallow );
	const [
		visibleMonitors,
	] = useVisibilityStore(
		( store ) => [
			store.visibleMonitors,
		],
		shallow,
	);
	const drawableMonitors = groups.map( ( g ) => g.monitors )
		.flat()
		.filter( ( m ) => visibleMonitors.includes( m ) );

	useLayoutEffect( () => {
		const observer = new ResizeObserver( ([entry]): void => {
			setWidth( entry.contentRect.width * devicePixelRatio );
			setHeight( entry.contentRect.height * devicePixelRatio );
			pageXOffset.current = entry.target.getBoundingClientRect().x;
		} );

		observer.observe( wrapper.current );

		context.current = canvas.current.getContext( '2d' );

		const windowResizeCallback = (): void => {
			windowHeight.current = window.innerHeight;
		};

		window.addEventListener( 'resize', windowResizeCallback );
		windowResizeCallback();

		return () => {
			observer.disconnect();
			window.removeEventListener( 'resize', windowResizeCallback );
		};
	}, []);

	useEffect( () => {
		const ctx = context.current;
		let raf: number;
		const loop = (): void => {
			Object.values( monitors ).forEach( ( m ) => {
				m.controller.sample();
				m.controller.cullBuffers( ( width - devicePixelRatio * 2 ) * 2 );
			} );


			ctx.clearRect( 0, 0, width, height );
			ctx.font = `${12 * devicePixelRatio}px sans-serif`;
			ctx.lineJoin = 'round';
			ctx.lineCap = 'round';

			const gridShift = 1 - ( ( performance.now() / 1000 ) % 1 );

			ctx.lineWidth = 1;
			ctx.strokeStyle = 'rgba(255,255,255,0.025)';
			ctx.beginPath();


			for ( let x = 30 * gridShift; x < width; x += 30 ) {
				ctx.moveTo( x, 0 );
				ctx.lineTo( x, height );
			}
			ctx.stroke();

			const hoveredIndex = hoverX.current
				? width - Math.round( hoverX.current * devicePixelRatio )
				: null;

			const topEdge = window.scrollY;
			const bottomEdge = topEdge + windowHeight.current;

			drawableMonitors.forEach( ( id, i ) => {
				if ( bottomEdge < totalGraphHeight * i || topEdge > totalGraphHeight * ( i + 1 ) ) return;
				monitors[id].controller.draw( ctx, i, hoveredIndex );
			} );


			if ( hoveredIndex ) {
				ctx.strokeStyle = 'rgba(255,255,255,0.1)';
				ctx.beginPath();
				ctx.moveTo( width - hoveredIndex - devicePixelRatio, 0 );
				ctx.lineTo( width - hoveredIndex - devicePixelRatio, height );
				ctx.stroke();
			}

			raf = requestAnimationFrame( loop );
		};

		raf = requestAnimationFrame( loop );

		return () => {
			cancelAnimationFrame( raf );
		};
	}, [width, height, monitors, drawableMonitors]);

	return (
		<main
			ref={wrapper}
			onPointerLeave={() => {
				hoverX.current = null;
			}}
			onPointerMove={( e ) => {
				hoverX.current = e.clientX - pageXOffset.current;
			}}
			style={{
				height: drawableMonitors.length * totalGraphHeight,
				minHeight: '100vh',
			}}
		>
			<canvas ref={canvas} width={width} height={height} />
		</main>
	);
};

export default Canvas;
