import type Sampler from '../texture/Sampler';
import type Texture from '../texture/Texture';
import ContextConsumer, { WithContext } from '../abstracts/ContextConsumer';
import { devLog, prodLog } from '../utils/log';


export interface TextureSlotProps extends WithContext {
	/**
	 * Sampler used for sampling `texture`.
	 *
	 * @defaultValue undefined
	 */
	texture?: Texture,

	/**
	 * Sampler used for sampling `texture`.
	 *
	 * @defaultValue undefined
	 */
	sampler?: Sampler

	/**
	 * Texture unit index the texture and sampler should be bound to.
	 *
	 * @defaultValue undefined
	 */
	unit?: number;
}


/**
 * Representation of a `Program`s bindable texture slot.
 *
 * @internal
 */
export default class TextureSlot extends ContextConsumer {
	private texture: Texture;
	private textureReady: boolean;
	private sampler: WebGLSampler = null;
	private unit: number;


	public constructor( {
		texture, sampler, context, unit,
	}: TextureSlotProps = {} ) {
		super( async () => {}, context );

		if ( texture ) this.setTexture( texture );
		if ( sampler ) this.setSampler( sampler );
		if ( typeof unit === 'number' ) this.unit = unit;
	}


	/**
	 * Assigns a given texture to the texture slot.
	 *
	 * @param texture - The texture to assign to the texture slot.
	 */
	public async setTexture( texture: Texture ): Promise<void> {
		this.textureReady = false;
		this.texture = texture;

		await texture.getTexture();
		this.textureReady = true;
	}


	/**
	 * Assigns a given sampler to the texture slot.
	 *
	 * @param sampler - The sampler to assign to the texture slot, or `null` for no sampler.
	 */
	public async setSampler( sampler: Sampler | null ): Promise<void> {
		if ( sampler ) {
			// undefined means that there is supposed to be a sampler in use,
			// but it is not ready yet.
			this.sampler = undefined;
			this.sampler = await sampler.getSampler();
		} else {
			this.sampler = null;
		}
	}


	/**
	 * Binds texture and sampler to the texture unit specified at instantiation.
	 *
	 * @internal
	 * @param debugName - Optional identifier used for debugging.
	 * @returns Index of the bound texture unit if successful, `-1` otherwise.
	 */
	public bind( debugName?: string ): number {
		if ( this.unit !== undefined ) {
			this.bindTo( this.unit, debugName );

			return this.unit;
		}

		if ( __DEV_BUILD__ ) {
			devLog( {
				level: 'error',
				msg: `Cannot call bind() on TextureSlot for ${debugName}: no unit to bind to specified.`,
			} );
		} else {
			prodLog( 'TextureSlot' );
		}

		return -1;
	}


	/**
	 * Binds texture and sampler to the given texture unit.
	 *
	 * @internal
	 * @param unit - Index of the texture unit to bind to.
	 * @param debugName - Optional identifier used for debugging.
	 * @returns `true` if binding was successful, `false` otherwise.
	 */
	public bindTo( unit: number, debugName?: string ): boolean {
		const {
			gl, texture, textureReady, sampler,
		} = this;

		// we're waiting for neither the texture nor the sampler
		if ( gl && textureReady && sampler !== undefined ) {
			gl.activeTexture( gl.TEXTURE0 + unit );
			texture.bindSync();

			gl.bindSampler( unit, sampler );

			return true;
		}

		if ( __DEV_BUILD__ ) {
			let msg = `Trying to bind texture slot for "${debugName ?? '<unknown>'}" `;

			if ( !gl ) {
				msg += 'while its context has not been initialized.';
			} else if ( !texture ) {
				msg += 'with no texture assigned.';
			} else if ( sampler === undefined ) {
				msg += 'while the assigned sampler is not ready.';
			} else if ( !textureReady ) {
				msg += 'while the assigned texture is not ready.';
			}

			devLog( {
				level: 'error',
				msg,
			} );
		}

		return false;
	}
}
