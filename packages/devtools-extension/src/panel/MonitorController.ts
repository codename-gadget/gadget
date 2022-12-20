import type { MonitorProps } from '@gdgt/devtools';


export const graphHeight = 32 * devicePixelRatio;
export const graphPadding = 48 * devicePixelRatio;

const groupTopOffset = 12 * devicePixelRatio;
const textPosition = -graphHeight - 12 * devicePixelRatio;
const textPadding = 12 * devicePixelRatio;

let color = -1;
const colors: [number, number, number][] = [
	[0, 90, 71],
	[15, 90, 71],
	[45, 90, 71],
	[105, 90, 81],
	[225, 90, 70],
];

const getColor = (): [number, number, number] => {
	color += 1;

	if ( color >= colors.length ) {
		color = 0;
	}

	return colors[color];
};

/**
 * @internal
 */
export default class MonitorController {
	private name = 'Unnamed Monitor';
	private type: 'count' | 'rate' = 'count';
	private unit = '';
	private displayValue: number = null;
	private currentValue: Record<string, number> = {};
	private buffers: Record<string, number[]> = {};
	private visibleOrigins: string[] = [];
	private samplesSinceLastTally = 0;
	private lastSampleTime = 0;
	private lastTallyTime = 0;
	private max = 0;
	private topOffset = 0;
	/** HSL color used for total/tally and first graph */
	public baseColor: [number, number, number];


	public constructor() {
		this.baseColor = getColor();
	}


	public setConfig( props: Partial<MonitorProps> ): void {
		this.name = props.name ?? this.name;
		this.type = props.type ?? this.type;
		this.unit = props.unit ?? this.unit;
		this.tally();
	}


	public setVisibleOrigins( origins: string[]): void {
		this.visibleOrigins = origins;
		origins.forEach( ( o ) => this.add( o, 0 ) );
		this.tally();
	}


	private add( origin: string, value: number ): void {
		this.currentValue[origin] = ( this.currentValue[origin] ?? 0 ) + value;
	}


	public increment( origin: string, amount = 1 ): void {
		this.add( origin, amount );
	}


	public decrement( origin: string, amount = 1 ): void {
		this.add( origin, -amount );
	}


	public set( origin: string, value: number ): void {
		this.currentValue[origin] = value;
	}


	private getMaxBufferRange(): number {
		const origins = this.visibleOrigins;
		let range = 0;

		origins.forEach( ( origin ) => {
			range = Math.max( range, this.buffers[origin]?.length ?? 0 );
		} );

		return range;
	}


	private calculateMax(): void {
		const range = this.getMaxBufferRange();
		const origins = this.visibleOrigins;
		let max = 0;

		for ( let i = 0; i < range; i += 1 ) {
			let sampleSum = 0;

			origins.forEach( ( origin ) => {
				sampleSum += this.buffers[origin]?.[i] ?? 0;
			} );

			max = Math.max( max, sampleSum );
		}

		this.max += ( max - this.max ) * 0.125;
	}


	private sortOrigins(): void {
		this.visibleOrigins = this.visibleOrigins.map( ( origin ) => ( {
			origin,
			max: this.buffers[origin] ? Math.max( ...this.buffers[origin]) : 0,
		} ) ).sort( ( a, b ) => a.max - b.max ).map( ( a ) => a.origin );
	}


	public sample(): void {
		const currentTime = performance.now();

		Object.entries( this.currentValue ).forEach( ([origin, value]) => {
			if ( this.buffers[origin] === undefined ) this.buffers[origin] = [];


			if ( this.type === 'rate' ) {
				this.currentValue[origin] = 0;
				this.buffers[origin].unshift( value / ( ( currentTime - this.lastSampleTime ) / 1000 ) );
			} else {
				this.buffers[origin].unshift( value );
			}
		} );
		this.samplesSinceLastTally += 1;
		this.lastSampleTime = currentTime;
	}


	private tally(): void {
		const origins = this.visibleOrigins;
		let total = 0;

		if ( this.type === 'count' ) {
			origins.forEach( ( origin ) => {
				total += this.currentValue[origin] ?? 0;
			} );

			this.displayValue = total;
		} else {
			origins.forEach( ( origin ) => {
				for ( let i = 0; i <= this.samplesSinceLastTally; i += 1 ) {
					total += this.buffers[origin]?.[i] ?? 0;
				}
			} );

			this.displayValue = Math.round( total / this.samplesSinceLastTally );
			if ( Number.isNaN( this.displayValue ) ) this.displayValue = null;
		}

		this.lastTallyTime = performance.now();
		this.samplesSinceLastTally = 0;
	}


	public cullBuffers( maxLength: number ): void {
		Object.values( this.buffers ).forEach( ( buffer ) => {
			buffer.splice( maxLength );
		} );
	}


	public reset(): void {
		this.buffers = {};
		this.currentValue = {};
		this.displayValue = null;
	}


	public draw(
		ctx: CanvasRenderingContext2D,
		listIndex: number,
		hoveredIndex: number | null,
	): void {
		this.calculateMax();
		this.sortOrigins();
		if ( this.type === 'count' || ( this.type === 'rate' && performance.now() - this.lastTallyTime > 300 ) ) {
			this.tally();
		}

		const origins = this.visibleOrigins;
		const { width } = ctx.canvas;
		const hoveredLeft = hoveredIndex && ( hoveredIndex > width * 0.5 );
		const baseColor = `hsl(${this.baseColor[0]}, ${this.baseColor[1]}%, ${this.baseColor[2]}%)`;

		const topOffset = ( listIndex + 1 ) * ( graphHeight + graphPadding ) - groupTopOffset;

		this.topOffset += ( topOffset - this.topOffset ) * 0.125;


		ctx.translate( 0, this.topOffset );
		ctx.lineWidth = 1;

		// range lines
		ctx.strokeStyle = 'rgba(255,255,255,0.1)';
		ctx.beginPath();
		ctx.moveTo( 0, 0 );
		ctx.lineTo( width, 0 );
		ctx.moveTo( 0, -graphHeight );
		ctx.lineTo( width, -graphHeight );
		ctx.stroke();


		// 50% line
		ctx.strokeStyle = 'rgba(255,255,255,0.03)';
		ctx.beginPath();
		ctx.moveTo( 0, -graphHeight / 2 );
		ctx.lineTo( width, -graphHeight / 2 );
		ctx.stroke();

		// monitor name
		ctx.fillStyle = `rgba(255,255,255,${hoveredLeft ? 0.1 : 0.5})`;
		ctx.textAlign = 'left';
		ctx.fillText( this.name, textPadding, textPosition );


		const paths = origins.map( () => []);
		const range = this.getMaxBufferRange();

		// tally/total
		ctx.textAlign = hoveredLeft ? 'left' : 'right';
		ctx.fillStyle = baseColor;
		if ( !hoveredIndex ) {
			ctx.fillText( `${this.displayValue ?? '?'} ${this.unit}`, width - textPadding, textPosition );
		} else if ( range >= hoveredIndex ) {
			let sampleSum = 0;

			for ( let j = 0; j < origins.length; j += 1 ) {
				sampleSum += this.buffers[origins[j]]?.[hoveredIndex] ?? 0;
			}
			ctx.fillText(
				`${Math.round( sampleSum )} ${this.unit}`,
				width - devicePixelRatio - ( hoveredIndex ) + ( hoveredLeft ? textPadding : -textPadding ),
				textPosition,
			);
		}

		for ( let i = 0; i < range; i += 1 ) {
			let sampleSum = 0;

			for ( let j = 0; j < origins.length; j += 1 ) {
				const origin = origins[j];

				sampleSum += this.buffers[origin]?.[i] ?? 0;
				paths[j].push(
					Math.min( 1, sampleSum / this.max )
                    * -( graphHeight - origins.length * devicePixelRatio )
                    - ( ( j + 1 ) * devicePixelRatio ),
				);
			}
		}

		ctx.lineWidth = devicePixelRatio;
		paths.reverse().forEach( ( path, i ) => {
			const lineColor = `hsl(${this.baseColor[0] + 10 * i}, ${this.baseColor[1]}%, ${this.baseColor[2] * ( 1 + i * 0.1 )}%)`;

			ctx.strokeStyle = lineColor;
			ctx.fillStyle = `hsl(${this.baseColor[0] + 10 * i}, ${this.baseColor[1] * 0.25}%, ${this.baseColor[2] * ( 1 + i * 0.1 ) * 0.4}%)`;
			ctx.beginPath();
			ctx.moveTo( width - devicePixelRatio, 0 );
			path.forEach( ( y, x ) => {
				ctx.lineTo( width - devicePixelRatio - x, y );
			} );

			ctx.lineTo( width - devicePixelRatio - ( path.length - 1 ), 0 );

			ctx.stroke();
			ctx.fill();

			if ( hoveredIndex && path.length >= hoveredIndex ) {
				ctx.fillStyle = lineColor;
				ctx.beginPath();
				ctx.arc(
					width - devicePixelRatio - ( hoveredIndex ),
					path[hoveredIndex],
					devicePixelRatio,
					0,
					2 * Math.PI,
				);
				ctx.fill();
			}
		} );


		ctx.resetTransform();
	}
}
