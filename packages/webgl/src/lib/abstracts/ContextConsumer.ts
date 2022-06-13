import Context, { defaultContext } from '../Context';


export interface WithContext {
	/**
	 * Context override
	 *
	 * @defaultValue {@linkcode defaultContext}
	 */
	context?: Context
}


/**
 * Abstract base class for components relying on a WebGL2RenderingContext.
 *
 * @internal
 */
export default abstract class ContextConsumer {
	protected gl: WebGL2RenderingContext;
	protected ready: Promise<void>;


	public constructor(
		ctor: () => Promise<void>,
		context = defaultContext,
	) {
		this.ready = ( async () => {
			this.gl = await context.getGlContext();
			await ctor();
		} )();
	}
}
