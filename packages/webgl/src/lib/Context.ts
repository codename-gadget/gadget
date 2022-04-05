import { devLog, prodLog } from './utils/log';


/**
 * The rendering context, tied to a canvas element.
 */
export default class Context {
	private glContextReady: Promise<WebGL2RenderingContext>;
	private resolveContext: ( ctx: WebGL2RenderingContext ) => void;


	public constructor() {
		this.glContextReady = new Promise( ( resolve ) => {
			this.resolveContext = resolve;
		} );
	}


	/**
	 * Ties the context to a given canvas element.
	 * This can only be called once and needs to be called,
	 * before any rendering can take place.
	 *
	 * @param canvas - The canvas element to render to
	 */
	public initialize( canvas: HTMLCanvasElement ): void {
		if ( this.resolveContext ) {
			const ctx = canvas.getContext( 'webgl2' );

			ctx.getExtension( 'OES_texture_float_linear' );

			this.resolveContext( ctx );
			this.resolveContext = null;
		} else if ( __DEV_BUILD__ ) {
			devLog( {
				level: 'error',
				msg: 'Trying to initialized context that has already been initialized.',
			} );
		} else {
			prodLog( 'Context' );
		}
	}


	/**
	 * Returns the WebGL2RenderingContext of the canvas element it's tied to once available.
	 *
	 * @returns The WebGL2RenderingContext
	 */
	public async getGlContext(): Promise<WebGL2RenderingContext> {
		return this.glContextReady;
	}
}

/**
 * Default instance of Context used if no other context is specified.
 */
export const defaultContext = new Context();
