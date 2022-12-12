import { devLog, prodLog } from '../utils/log';
import ContextConsumer, { WithContext } from '../abstracts/ContextConsumer';
import Buffer from '../buffer/Buffer';
import SyncableBuffer from '../buffer/SyncableBuffer';
import {
	Introspection,
	TexturesFromIntrospection,
	UbosFromIntrospection,
	UnwrappedUbo,
} from './introspection';
import TextureSlot from './TextureSlot';
import Uniformbuffer from '../buffer/Uniformbuffer';


export interface ProgramProps<I, O> extends WithContext {
	/**
	 * Vertex shader source code.
	 *
	 * @remarks The shader is expected to be GLES 3.0 compatible.
	 */
	vertexShader: string;

	/**
	 * Fragment shader source code.
	 *
	 * @remarks The shader is expected to be GLES 3.0 compatible.
	 */
	fragmentShader: string;

	/**
	 * Static program introspection object, detailing UBO layouts and texture usage.
	 *
	 * @remarks This is automatically exported by `@gdgt/hlsl-loader`.
	 */
	introspection: I;

	/**
	 * Existing buffers to be (re)used as UBOs.
	 * Every UBO defined in the introspection and not present in this list
	 * is considered program specific and will be automatically created.
	 *
	 * @remarks Members will not be accessible via the programs `ubo` property.
	 */
	ubos?: O
}


/**
 * Representation of a `WebGLProgram`, its UBOs and textures.
 *
 * @typeParam I - Type representation of the static program introspection,
 * inferred from {@linkcode ProgramProps.introspection}.
 * @typeParam O - List of UBOs external to this program.
 * Inferred from {@linkcode ProgramProps.introspection} and {@linkcode ProgramProps.ubos}.
 * @example
 * Using `@gdgt/hlsl-loader` you can create a program like this:
 * ```typescript
 * import { Program } from '@gdgt/webgl';
 * import * as myShader from './myShader.hlsl';
 *
 * const program = new Program( myShader );
 *
 * // you can now compile the program...
 * await program.compile();
 *
 * // ... and use it afterwards
 * program.use();
 * someGeometry.draw();
```
 */
export default class Program<
	I extends Introspection = Introspection,
	O extends { [key in keyof I['ubos']]?: Buffer } = Record<never, never>,
> extends ContextConsumer {
	private program: WebGLProgram;
	private uniformBuffers: { name: string, buffer: Buffer | SyncableBuffer }[] = [];
	private vertexSrc: string;
	private fragmentSrc: string;

	/** Individual member views of UBOs specific to this program. */
	public ubos: UbosFromIntrospection<I, O>;

	/** Texture slots used by this program. */
	public textures: TexturesFromIntrospection<I>;


	public constructor( {
		context,
		introspection,
		ubos: uboOverrides,
		vertexShader,
		fragmentShader,
	}: ProgramProps<I, O> ) {
		const ubos: Record<string, UnwrappedUbo> = {};
		const uniformBuffers: Program<I, O>['uniformBuffers'] = [];
		const bufferPromises: Promise<WebGLBuffer>[] = [];

		// TODO: clean up and document code

		if ( uboOverrides ) {
			Object.entries( uboOverrides ).forEach( ([name, buffer]) => {
				ubos[name] = null;
				uniformBuffers.push( { name, buffer } );
				bufferPromises.push( buffer.getBuffer() );
			} );
		}

		if ( introspection.ubos ) {
			Object.entries( introspection.ubos ).forEach( (
				[name, blockIntrospection],
			) => {
				if ( ubos[name] !== undefined ) return;

				const buffer = new Uniformbuffer( {
					context,
					introspection: blockIntrospection,
				} );

				ubos[name] = buffer.uniforms;

				uniformBuffers.push( { name, buffer } );
				bufferPromises.push( buffer.getBuffer() );
			} );
		}


		const textures: Record<string, TextureSlot> = {};

		if ( introspection.textures ) {
			Object.entries( introspection.textures ).forEach( ([key, { binding }]) => {
				textures[key] = new TextureSlot( {
					context,
					unit: binding,
				} );
			} );
		}


		super( async () => {
			await Promise.all( bufferPromises );
		}, context );

		this.ubos = ubos as Program<I, O>['ubos'];
		this.uniformBuffers = uniformBuffers;

		this.textures = textures as Program<I, O>['textures'];

		this.vertexSrc = vertexShader;
		this.fragmentSrc = fragmentShader;

		if ( __DEV_BUILD__ ) {
			[vertexShader, fragmentShader].forEach( ( src ) => {
				if ( !src.startsWith( '#version 300 es' ) ) {
					devLog( {
						msg: 'Shader does not conform to GLSL ES 3.00. The first line needs to be "#version 300 es".',
						groups: {
							'Shader source': {
								content: src,
							},
						},
					} );
				}
			} );
		}
	}


	/**
	 * Instructs the program to use the given `buffer` as the source
	 * for the uniform block with the given `name`.
	 *
	 * @remarks Note that this will not call `delete()` on the previously assigned buffer.
	 * This will have to be done manually, to avoid the accumulation of orphaned buffers.
	 * @param name - Name of the uniform block.
	 * @param buffer - Buffer to use as the data source.
	 * @returns `true` if the operation was successful, `false` otherwise.
	 */
	public setUbo<
		U extends keyof I['ubos'] = keyof I['ubos'],
	>( name: U, buffer: Uniformbuffer<I['ubos'][U]> ): boolean {
		const uboIndex = this.uniformBuffers.findIndex( ( u ) => u.name === name );

		if ( uboIndex > -1 ) {
			this.uniformBuffers[uboIndex].buffer = buffer;

			// if the ubo was represented by an external override,
			// no view exists. Only update to the new view, if we had one previously.
			if ( name in this.ubos ) {
				( this.ubos as unknown )[name] = buffer.uniforms;
			}

			return true;
		} if ( __DEV_BUILD__ ) {
			devLog( {
				msg: `UBO '${
					String( name )
				}' does not exist on this program. Known UBOs: ${
					this.uniformBuffers
						.map( ( u ) => `'${u.name}'` )
						.join( ', ' )
				}.`,
			} );
		}

		return false;
	}


	/**
	 * Calls `upload()` on all uniform buffers.
	 */
	public async uploadUbos(): Promise<void> {
		const { uniformBuffers } = this;

		await Promise.all( uniformBuffers.map( ( { buffer } ) => {
			if ( buffer instanceof SyncableBuffer ) {
				return buffer.upload();
			}

			return Promise.resolve();
		} ) );
	}


	/**
	 * Calls `uploadSync()` on all uniform buffers.
	 * This is only usable after all buffers have been initialized.
	 */
	public uploadUbosSync(): void {
		const { uniformBuffers } = this;

		uniformBuffers.forEach( ( { buffer } ) => {
			if ( buffer instanceof SyncableBuffer ) {
				buffer.uploadSync();
			}
		} );
	}


	/**
	 * Returns the underlying `WebGLProgram`, once ready.
	 *
	 * If the program was not compiled before calling `getProgram()`,
	 * it will be compiled implicitly. Ideally, you should `await compile()` first.
	 *
	 * @returns The underlying `WebGLProgram`
	 */
	public async getProgram(): Promise<WebGLProgram> {
		await this.ready;

		if ( !this.program ) {
			if ( __DEV_BUILD__ ) {
				devLog( {
					msg: 'getProgram() was called before the program was compiled or finished compiling. This implicitly compiles the program, which may lead to unexpected behavour. Await compile() first to avoid this.',
				} );
			}
			await this.compile();
		}

		return this.program;
	}


	/**
	 * Compiles the program.
	 *
	 * This is fairly expensive, since it compiles both shaders, links the program and
	 * sets up all uniform buffers and textures.
	 */
	public async compile(): Promise<void> {
		await this.ready;

		const {
			gl,
			program: existingProgram,
			vertexSrc,
			fragmentSrc,
			uniformBuffers,
			textures,
		} = this;

		if ( existingProgram ) return;

		const compileShader = ( type: number, src: string ): WebGLShader => {
			const shader = gl.createShader( type );

			gl.shaderSource( shader, src );
			gl.compileShader( shader );

			return shader;
		};

		this.program = gl.createProgram();

		const vs = compileShader( gl.VERTEX_SHADER, vertexSrc );
		const fs = compileShader( gl.FRAGMENT_SHADER, fragmentSrc );

		gl.attachShader( this.program, vs );
		gl.attachShader( this.program, fs );
		gl.linkProgram( this.program );

		if ( !gl.getProgramParameter( this.program, gl.LINK_STATUS ) ) {
			if ( __DEV_BUILD__ ) {
				const programInfo = gl.getProgramInfoLog( this.program );

				devLog( {
					level: 'error',
					msg: 'Program linking failed',
					groups: {
						'Info Log': {
							expanded: true,
							content: [
								'Program LINK_STATUS: failed',
								programInfo ? `Program info log: \n${programInfo}` : 'No further info provided.',

								...[vs, fs].map( ( shader ) => {
									const compileStatus = gl.getShaderParameter( shader, gl.COMPILE_STATUS );

									const output = [
										`\n${
											shader === vs ? 'Vertex' : 'Fragment'
										} shader COMPILE_STATUS: ${compileStatus ? 'compiled' : 'failed'}`,
									];

									if ( !compileStatus ) {
										const infoLog = gl.getShaderInfoLog( shader );

										output.push(
											infoLog
												? `Shader info log: \n${infoLog}`
												: 'No further info provided.',
										);
									}

									return output;
								} ),
							].flat().join( '\n' ),
						},
						'Vertex shader source': {
							content: gl.getShaderSource( vs ),
						},
						'Fragment shader source': {
							content: gl.getShaderSource( fs ),
						},
					},
				} );
			} else {
				prodLog( 'Program linking failed' );
			}

			gl.deleteProgram( this.program );
			gl.deleteShader( vs );
			gl.deleteShader( fs );
			this.program = null;

			return;
		}

		// TODO: cache program

		uniformBuffers.forEach( ( { name }, i ) => {
			gl.uniformBlockBinding(
				this.program,
				gl.getUniformBlockIndex( this.program, name ),
				i,
			);
		} );


		gl.useProgram( this.program );

		Object.entries( textures ).forEach( ([key, slot]) => {
			const location = gl.getUniformLocation( this.program, key );

			gl.uniform1i( location, slot.getUnit() );
		} );

		gl.useProgram( null );
	}


	/**
	 * Sets the program and all UBOs and textures up for usage.
	 *
	 * @returns `true` if the program has been successfully set up, `false` if something went wrong.
	 */
	public use(): boolean {
		const {
			program, gl, uniformBuffers, textures,
		} = this;

		if ( !program ) {
			if ( __DEV_BUILD__ ) {
				devLog( {
					msg: 'Attempting to use uncompiled program. This will silently fail in production.',
				} );
			}

			return false;
		}


		gl.useProgram( program );

		uniformBuffers.forEach( ( { buffer }, i ) => {
			gl.bindBufferBase(
				gl.UNIFORM_BUFFER,
				i,
				buffer.getBufferSync(),
			);
		} );

		Object.values( textures ).forEach( ( slot ) => {
			slot.bind(
				__DEV_BUILD__
					? Object.entries( this.textures ).find( ( t ) => slot === t[1])?.[0]
					: undefined,
			);
		} );

		return true;
	}
}
