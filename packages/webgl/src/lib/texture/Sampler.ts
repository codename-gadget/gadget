import ContextConsumer, { WithContext } from '../abstracts/ContextConsumer';
import { getSamplingParams, SamplingParams } from './samplingParams';


export type SamplerProps = SamplingParams & WithContext;


/**
 * A Sampler storing sampling parameters for texture access.
 */
export default class Sampler extends ContextConsumer {
	private sampler: WebGLSampler;


	public constructor( {
		context,
		...samplingParams
	}: SamplerProps = {} ) {
		super(
			async () => {
				const { gl } = this;
				const {
					minFilter,
					magFilter,
					wrapS,
					wrapT,
					wrapR,
					minLod,
					maxLod,
					compareMode,
					compareFunc,
				} = getSamplingParams( samplingParams );
				const sampler = gl.createSampler();

				gl.samplerParameteri( sampler, gl.TEXTURE_MIN_FILTER, minFilter );
				gl.samplerParameteri( sampler, gl.TEXTURE_MAG_FILTER, magFilter );
				gl.samplerParameteri( sampler, gl.TEXTURE_WRAP_S, wrapS );
				gl.samplerParameteri( sampler, gl.TEXTURE_WRAP_T, wrapT );
				gl.samplerParameteri( sampler, gl.TEXTURE_WRAP_R, wrapR );
				gl.samplerParameterf( sampler, gl.TEXTURE_MIN_LOD, minLod );
				gl.samplerParameterf( sampler, gl.TEXTURE_MAX_LOD, maxLod );
				gl.samplerParameteri( sampler, gl.TEXTURE_COMPARE_MODE, compareMode );
				gl.samplerParameteri( sampler, gl.TEXTURE_COMPARE_FUNC, compareFunc );

				this.sampler = sampler;
			},
			context,
		);
	}


	/**
	 * Returns the underlying `WebGLSampler` object once ready.
	 *
	 * @returns The underlying `WebGLSampler` object.
	 */
	public async getSampler(): Promise<WebGLSampler> {
		await this.ready;

		return this.sampler;
	}


	/**
	 * Flags the underlying sampler for deletion.
	 */
	public async delete(): Promise<void> {
		await this.ready;

		const { gl, sampler } = this;

		gl.deleteSampler( sampler );
	}
}
