import { devLog, prodLog } from '../utils/log';
import ContextConsumer, { WithContext } from '../abstracts/ContextConsumer';
import Buffer from '../buffer/Buffer';
import { BufferBindingPoint, BufferUsage } from '../buffer/bufferEnums';
import SyncableBuffer from '../buffer/SyncableBuffer';
import {
	Introspection,
	TexturesFromIntrospection,
	UboData,
	UboMember,
	UbosFromIntrospection,
	UnwrappedUbo,
} from './introspection';
import { byteLengthOfUniformType } from './programEnums';
import UniformView from './UniformView';
import TextureSlot from './TextureSlot';


function viewOrListFromIntro(
	valueOrList: UboData,
	parentBuffer: ArrayBuffer,
	glBuffer: SyncableBuffer,
): UniformView<Float32Array> | UnwrappedUbo {
	if (
		typeof valueOrList === 'object'
		&& '@type' in valueOrList
	) {
		const { '@type': type, '@offset': offset } = valueOrList as UboMember;
		const byteLength = byteLengthOfUniformType( type );

		return new UniformView( {
			view: new Float32Array(
				parentBuffer,
				offset,
				byteLength / Float32Array.BYTES_PER_ELEMENT,
			),
			invalidate: () => {
				glBuffer.invalidate(
					offset,
					offset + byteLength,
				);
			},
			upload: () => glBuffer.upload(),
		} );
	}

	if ( Array.isArray( valueOrList ) ) {
		return (
			valueOrList as UboData[]
		).map( ( data ) => (
			viewOrListFromIntro( data, parentBuffer, glBuffer )
		) ) as UnwrappedUbo<UboData[]>;
	}

	const output: Record<string, ReturnType<typeof viewOrListFromIntro>> = {};

	Object.entries( valueOrList ).forEach( ([key, data]) => {
		output[key] = viewOrListFromIntro( data, parentBuffer, glBuffer );
	} );

	return output as UnwrappedUbo;
}


/**
 * @public
 */
export interface ProgramProps<I, O> extends WithContext {
	/**
	 * Vertex shader source code.
	 */
	vertexShader: string;

	/** Fragment shader source code. */
	fragmentShader: string;

	/** Static program reflection, hopefully not written by hand. */
	introspection: I;

	/**
	 * Buffers to use as UBOs instead of new creating program specific ones.
	 */
	ubos?: O
}


/**
 * Representation of a `WebGLProgram` and its UBOs and textures.
 *
 * @public
 */
export default class Program<
	R extends Introspection,
	O extends { [key in keyof R['ubos']]?: Buffer },
> extends ContextConsumer {
	private program: WebGLProgram;
	private blockBuffers: { name: string, buffer: Buffer }[] = [];
	private textureBindings: { location: WebGLUniformLocation, slot: TextureSlot }[] = [];
	private vertexSrc: string;
	private fragmentSrc: string;

	/** Individual member views of UBOs specific to this program. */
	public ubos: UbosFromIntrospection<R, O>;

	/** Texture slots used by this program. */
	public textures: TexturesFromIntrospection<R>;


	public constructor( {
		context,
		introspection,
		ubos: uboOverrides,
		vertexShader,
		fragmentShader,
	}: ProgramProps<R, O> ) {
		const ubos: Record<string, ReturnType<typeof viewOrListFromIntro>> = {};
		const blockBuffers: Program<R, O>['blockBuffers'] = [];
		const bufferPromises: Promise<WebGLBuffer>[] = [];

		// TODO: clean up and document code

		if ( uboOverrides ) {
			Object.entries( uboOverrides ).forEach( ([name, buffer]) => {
				ubos[name] = null;
				blockBuffers.push( { name, buffer } );
				bufferPromises.push( buffer.getBuffer() );
			} );
		}

		if ( introspection.ubos ) {
			Object.entries( introspection.ubos ).forEach( (
				[name, { '@blockSize': size, ...members }],
			) => {
				if ( ubos[name] !== undefined ) return;

				const arrayBuffer = new ArrayBuffer( size );
				const buffer = new SyncableBuffer( {
					context,
					target: BufferBindingPoint.uniformBuffer,
					usage: BufferUsage.dynamicDraw,
					data: arrayBuffer,
				} );


				ubos[name] = viewOrListFromIntro(
					members,
					arrayBuffer,
					buffer,
				);

				blockBuffers.push( { name, buffer } );
				bufferPromises.push( buffer.getBuffer() );
			} );
		}


		const textures: Record<string, TextureSlot> = {};

		if ( introspection.textures ) {
			Object.entries( introspection.textures ).forEach( ([key, { binding }]) => {
				textures[key] = new TextureSlot( {
					context, unit: binding,
				} );
			} );
		}


		super( async () => {
			await Promise.all( bufferPromises );
		}, context );

		this.ubos = ubos as Program<R, O>['ubos'];
		this.blockBuffers = blockBuffers;

		this.textures = textures as Program<R, O>['textures'];

		this.vertexSrc = vertexShader;
		this.fragmentSrc = fragmentShader;

		if ( __DEV_BUILD__ ) {
			[vertexShader, fragmentShader].forEach( ( src ) => {
				if ( !src.startsWith( '#version 300 es' ) ) {
					devLog( {
						msg: 'Shader does not conform to GLSL ES 3.00. The first line needs to be "#version 300 es".',
						groupLabel: 'shader source',
						groupContent: src,
					} );
				}
			} );
		}
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
			gl, program: existingProgram, vertexSrc, fragmentSrc, blockBuffers, textureBindings, textures,
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
				devLog( {
					level: 'error',
					msg: 'Program linking failed',
					groupLabel: 'Info Log',
					expanded: true,
					groupContent: [
						'Program Info Log:',
						gl.getProgramInfoLog( this.program ),
						'Vertex Shader Info Log:',
						gl.getShaderInfoLog( vs ),
						'Fragment Shader Info Log:',
						gl.getShaderInfoLog( fs ),
					],
				} );
			} else {
				prodLog( 'Program' );
			}

			gl.deleteProgram( this.program );
			this.program = null;

			return;
		}

		// TODO: cache program

		blockBuffers.forEach( ( { name }, i ) => {
			gl.uniformBlockBinding(
				this.program,
				gl.getUniformBlockIndex( this.program, name ),
				i,
			);
		} );

		Object.entries( textures ).forEach( ([key, slot]) => {
			const location = gl.getUniformLocation( this.program, key );

			textureBindings.push( {
				location,
				slot,
			} );
		} );
	}


	/**
	 * Sets the program and all UBOs and textures up for usage.
	 *
	 * @returns `true` if the program has been successfully set up, `false` if something went wrong.
	 */
	public use(): boolean {
		const {
			program, gl, blockBuffers, textureBindings,
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

		blockBuffers.forEach( ( { buffer }, i ) => {
			gl.bindBufferBase(
				gl.UNIFORM_BUFFER,
				i,
				buffer.getBufferSync(),
			);
		} );

		// this could (and should?) be done a lot more efficiently.
		textureBindings.forEach( ( { location, slot } ) => {
			const unit = slot.bind(
				__DEV_BUILD__
					? Object.entries( this.textures ).find( ( t ) => slot === t[1])?.[0]
					: undefined,
			);

			gl.uniform1i( location, unit );
		} );

		return true;
	}
}
