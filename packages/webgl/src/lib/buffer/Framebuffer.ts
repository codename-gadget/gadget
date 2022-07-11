import ContextConsumer, { WithContext } from '../abstracts/ContextConsumer';
import Texture from '../texture/Texture';
import { devLog } from '../utils/log';
import Renderbuffer from './Renderbuffer';


export interface FramebufferProps extends WithContext {
	color: Record<number, Renderbuffer | Texture>;
	depthStencil?: Renderbuffer | Texture,
	stencil?: Renderbuffer | Texture,
	depth?: Renderbuffer | Texture,
}


/**
 * A collection of {@linkcode Texture}s and/or {@linkcode Renderbuffer}s that can be rendered to.
 */
export default class Framebuffer extends ContextConsumer {
	private fbo: WebGLFramebuffer;
	private colorAttachments: number[] = [];

	public constructor( {
		color,
		depthStencil,
		stencil,
		depth,
		context,
	}: FramebufferProps ) {
		super( async () => {
			const { gl } = this;
			const fbo = gl.createFramebuffer();

			const attachments = new Map<number, Renderbuffer | Texture>();
			const colorAttachments: number[] = [];

			Object.entries( color ).forEach( ([index, attachment]) => {
				const key = gl.COLOR_ATTACHMENT0 + parseInt( index, 10 );

				colorAttachments.push( key );
				attachments.set( key, attachment );
			} );

			if ( depthStencil ) {
				attachments.set( gl.DEPTH_STENCIL_ATTACHMENT, depthStencil );

				if ( __DEV_BUILD__ ) {
					const warnMsg = ( name: string ): string => (
						`"${name}" attachment will be ignored, since a "depthStencil" attachement has been specified.`
					);

					if ( depth ) {
						devLog( {
							msg: warnMsg( 'depth' ),
						} );
					}

					if ( stencil ) {
						devLog( {
							msg: warnMsg( 'stencil' ),
						} );
					}
				}
			} else {
				if ( depth ) {
					attachments.set( gl.DEPTH_ATTACHMENT, depth );
				}

				if ( stencil ) {
					attachments.set( gl.STENCIL_ATTACHMENT, stencil );
				}
			}

			const attachmentPromises: Promise<WebGLRenderbuffer | WebGLTexture>[] = [];

			attachments.forEach( ( attachment ) => {
				if ( attachment instanceof Texture ) {
					attachmentPromises.push( attachment.getTexture() );
				} else {
					attachmentPromises.push( attachment.getBuffer() );
				}
			} );

			await Promise.all( attachmentPromises );

			gl.bindFramebuffer( gl.FRAMEBUFFER, fbo );

			attachments.forEach( ( attachment, key ) => {
				if ( attachment instanceof Texture ) {
					gl.framebufferTexture2D(
						gl.FRAMEBUFFER,
						key,
						gl.TEXTURE_2D,
						attachment.getTextureSync(),
						0,
					);
				} else {
					gl.framebufferRenderbuffer(
						gl.FRAMEBUFFER,
						key,
						gl.RENDERBUFFER,
						attachment.getBufferSync(),
					);
				}
			} );

			gl.bindFramebuffer( gl.FRAMEBUFFER, null );

			this.fbo = fbo;
			this.colorAttachments = colorAttachments;
		}, context );
	}


	/**
	 * Checks for Framebuffer completeness, i.e. whether all
	 * attachements have a valid format and can be rendered to.
	 *
	 * @returns `true` if the Framebuffer is complete, `false` otherwise.
	 */
	public async verify(): Promise<boolean> {
		await this.ready;

		const { gl, fbo } = this;

		gl.bindFramebuffer( gl.FRAMEBUFFER, fbo );

		const status = gl.checkFramebufferStatus( gl.FRAMEBUFFER );

		gl.bindFramebuffer( gl.FRAMEBUFFER, null );

		if ( status === gl.FRAMEBUFFER_COMPLETE ) return true;

		if ( __DEV_BUILD__ ) {
			let msg: string;

			switch ( status ) {
				case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
					msg = 'Attachment types are mismatched or not all attachment points are framebuffer attachment complete.';
					break;
				case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
					msg = 'Missing an attachment.';
					break;
				case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
					msg = 'Attachments don\'t have the same dimensions.';
					break;
				case gl.FRAMEBUFFER_UNSUPPORTED:
					msg = 'Attachment format is not supported.';
					break;
				case gl.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE:
					msg = 'Attachments don\'t share the same number of multisamples.';
					break;

				default:
					msg = 'Unknown error.';
			}

			devLog( {
				level: 'error',
				msg: `Framebuffer invalid: ${msg}`,
			} );
		}

		return false;
	}


	/**
	 * Binds the framebuffer to the `gl.FRAMEBUFFER` binding point.
	 *
	 * @returns `true` if the buffer has successfully been bound, `false` otherwise.
	 */
	public bind(): boolean {
		const { gl, fbo, colorAttachments } = this;

		if ( fbo ) {
			gl.bindFramebuffer( gl.FRAMEBUFFER, fbo );
			// TODO: this seems easy to break.
			gl.drawBuffers( colorAttachments );

			return true;
		}

		if ( __DEV_BUILD__ ) {
			devLog( {
				msg: `Trying to bind Framebuffer that ${fbo === null ? 'has been deleted' : 'is not ready yet'}.`,
			} );
		}

		return false;
	}


	// TODO: thoroughly test this
	/**
	 * Clears the specified attachments to the provided values.
	 *
	 * @param param0 - Object specifying the attachements to clear.
	 * @example Clearing depth to 1 and color attachements 1 and 3 to red and green respectively:
	 * ```typescript
	 * myFbo.clear({
	 *     color: {
	 *         1: [1, 0, 0],
	 *         3: [0, 1, 0],
	 *     },
	 *     depth: 1,
	 * });
	 * ```
	 */
	public clear( {
		color = {},
		stencil,
		depth,
	}: {
		color?: Record<number, number[]>;
		stencil?: number,
		depth?: number,
	} ): void {
		const { gl } = this;
		const bound = this.bind();

		if ( !bound ) {
			if ( __DEV_BUILD__ ) {
				devLog( {
					msg: 'The above warning comes from a call to Framebuffer.clear().',
				} );
			}

			return;
		}

		if ( stencil !== undefined && depth !== undefined ) {
			gl.clearBufferfi( gl.DEPTH_STENCIL, 0, depth, stencil );
		} else if ( stencil !== undefined ) {
			gl.clearBufferfv( gl.STENCIL, 0, [stencil]);
		} else if ( depth !== undefined ) {
			gl.clearBufferfv( gl.DEPTH, 0, [depth]);
		}

		Object.entries( color ).forEach( ([index, clearColor]) => {
			const bufferIndex = parseInt( index, 10 );

			gl.clearBufferfv( gl.COLOR, bufferIndex, clearColor );
		} );

		gl.bindFramebuffer( gl.FRAMEBUFFER, null );
	}


	/**
	 * Flags the underlying `WebGLFramebuffer` for deletion.
	 * The buffer cannot be bound afterwards.
	 *
	 * @remarks Note, that __only the framebuffer itself__ is deleted.
	 * The attached textures and renderbuffers remain unchanged and must be deleted manually.
	 */
	public async delete(): Promise<void> {
		await this.ready;

		const { gl, fbo } = this;

		gl.deleteFramebuffer( fbo );
		this.fbo = null;
	}

	// TODO: invalidate
}
