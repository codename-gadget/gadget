import { devLog, prodLog } from './utils/log';


/**
 * The rendering context, tied to a canvas element.
 *
 * @example Most of the time, you won't need to manually create a context.
 *
 * The {@linkcode defaultContext} is, as the name suggests, the context that is used,
 * unless another one is manually specified. It still needs to be initialized:
 * ```typescript
 * import { defaultContext, Sampler } from '@gdgt/webgl';
 *
 *
 * const canvas = document.createElement( 'canvas' );
 * document.body.appendChild( canvas );
 *
 * defaultContext.initialize( canvas );
 *
 * // All objects created without a specified context are tied to defaultContext:
 * const sampler = new Sampler();
 * // is equivalent to
 * const sampler = new Sampler({ context: defaultContext });
 *
 * // You can also access the underlying WebGL2RenderingContext.
 * // This will resolve once defaultContext has been initialized.
 * const gl = await defaultContext.getGlContext();
 * ```
 *
 * If you'd rather manage your own context, you can do so by providing each
 * object with your context upon instantiation:
 * ```typescript
 * import { Context, Sampler } from '@gdgt/webgl';
 *
 *
 * const canvas = document.createElement( 'canvas' );
 * document.body.appendChild( canvas );
 *
 * const myContext = new Context();
 * myContext.initialize( canvas );
 *
 * const sampler = new Sampler({ context: myContext });
 * ```
 * Remember to do so on __every__ object you create – using objects across
 * multiple contexts is currently __not__ supported.
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
	 * @param options - Additional settings for context creation, passed to the canvas element.
	 * See {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext#contextattributes | WebGLContextAttributes}.
	 * `{ alpha: true }` is used  unless explicitly overwritten.
	 * Note that `{ alpha: false }` can lead to major performance issues on some platforms.
	 */
	public initialize( canvas: HTMLCanvasElement, options: WebGLContextAttributes = {} ): void {
		if ( this.resolveContext ) {
			const ctx = canvas.getContext( 'webgl2', {
				alpha: true,
				...options,
			} );

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
	 * Returns the `WebGL2RenderingContext` of the canvas element it's tied to once available.
	 *
	 * @returns The underlying `WebGL2RenderingContext`.
	 */
	public async getGlContext(): Promise<WebGL2RenderingContext> {
		return this.glContextReady;
	}
}

/**
 * Default instance of {@linkcode Context} used if no other context is specified.
 */
export const defaultContext = new Context();
