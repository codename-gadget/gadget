import { devLog } from './lib/utils/log';


if ( __DEV_BUILD__ ) {
	devLog( {
		level: 'warn',
		msg: `using @gdgt/webgl dev build version ${
			__VERSION__
		}, be sure to swap this for the production build before publishing!\n`,
	} );
} else {
	// eslint-disable-next-line no-console
	console.log( `@gdgt/webgl v${__VERSION__}` );
}


export { default as Context, defaultContext } from './lib/Context';


export { default as Buffer, BufferProps } from './lib/buffer/Buffer';
export { default as SyncableBuffer } from './lib/buffer/SyncableBuffer';
export {
	BufferDataType,
	BufferBindingPoint,
	BufferUsage,
} from './lib/buffer/bufferEnums';


export { default as Geometry, GeometryProps } from './lib/geometry/Geometry';
export { GeometryDrawMode } from './lib/geometry/geometryEnums';


export { default as Sampler, SamplerProps } from './lib/texture/Sampler';
export { default as Texture, TextureProps } from './lib/texture/Texture';
export {
	TextureMagFilter,
	TextureMinFilter,
	TextureCompareMode,
	TextureCompareFunc,
	TextureWrap,
	TextureDataType,
	TextureFormat,
	TextureStorageFormat,
} from './lib/texture/textureEnums';


export { default as Program, ProgramProps } from './lib/program/Program';
export { UniformType } from './lib/program/programEnums';
