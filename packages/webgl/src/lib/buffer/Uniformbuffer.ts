import { WithContext } from '../abstracts/ContextConsumer';
import {
	UboData, UboIntrospection, UboMember, UnwrappedUbo,
} from '../program/introspection';
import { byteLengthOfUniformType } from '../program/programEnums';
import UniformView from './UniformView';
import { BufferBindingPoint, BufferUsage } from './bufferEnums';
import SyncableBuffer from './SyncableBuffer';


export interface UniformbufferProps<U> extends WithContext {
	/**
	 * A static uniform block introspection object, detailing the name,
	 * type and layout of all members.
	 *
	 * @remarks This is automatically exported by `@gdgt/hlsl-loader`.
	 */
	introspection: U
}


/**
 * GPU buffer used as the data source for a uniform block,
 * with CPU-side data representation and individual member views.
 */
export default class Uniformbuffer<
	U extends UboIntrospection = UboIntrospection,
> extends SyncableBuffer {
	/** View of the contained uniforms. */
	public uniforms: UnwrappedUbo<Omit<U, '@blockSize'>>;

	public constructor( {
		introspection: { '@blockSize': size, ...members },
		context,
	}: UniformbufferProps<U> ) {
		const arrayBuffer = new ArrayBuffer( size );

		super( {
			target: BufferBindingPoint.uniformBuffer,
			usage: BufferUsage.dynamicDraw,
			data: arrayBuffer,
			context,
		} );

		this.uniforms = this.createViewOrListFromIntrospection( members ) as Uniformbuffer<U>['uniforms'];
	}


	private createViewOrListFromIntrospection(
		valueOrList: UboData,
	): UniformView<Float32Array> | UnwrappedUbo {
		if (
			typeof valueOrList === 'object'
		&& '@type' in valueOrList
		) {
			const { '@type': type, '@offset': offset } = valueOrList as UboMember;
			const byteLength = byteLengthOfUniformType( type );

			return new UniformView( {
				view: new Float32Array(
					this.data,
					offset,
					byteLength / Float32Array.BYTES_PER_ELEMENT,
				),
				invalidate: () => {
					this.invalidate(
						offset,
						offset + byteLength,
					);
				},
				upload: () => this.upload(),
			} );
		}

		if ( Array.isArray( valueOrList ) ) {
			return (
				valueOrList as UboData[]
			).map( ( data ) => (
				this.createViewOrListFromIntrospection( data )
			) ) as UnwrappedUbo<UboData[]>;
		}

		const output: Record<string, UniformView<Float32Array> | UnwrappedUbo> = {};

		Object.entries( valueOrList ).forEach( ([key, data]) => {
			output[key] = this.createViewOrListFromIntrospection( data );
		} );

		return output as UnwrappedUbo;
	}
}
