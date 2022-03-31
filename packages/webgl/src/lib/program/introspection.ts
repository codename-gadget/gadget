import type { SamplerType } from '../texture/textureEnums';
import type { UniformType } from './programEnums';
import type TextureSlot from './TextureSlot';
import type UniformView from './UniformView';


export type UboMember = {
	'@type': UniformType;
	'@offset': number;
};

export type UboData =
UboMember | UboMemberList | number;

type UboMemberList = UboData[] | { [key: string]: UboData };

type UboIntrospection = { [key: string]: UboData, '@blockSize': number };

type AttributeIntrospection = { type: UniformType, location: number };

type TextureIntrospection = {
	type: SamplerType,
	binding: number,
};

export type Introspection = {
	attributes: Record<string, AttributeIntrospection>
	ubos?: Record<string, UboIntrospection>
	textures?: Record<string, TextureIntrospection>
};


export type UnwrappedUbo<M extends UboMemberList = UboMemberList> = {
	[key in keyof M]:
	M[key] extends UboMember
		? UniformView<Float32Array>
		: M[key] extends UboMemberList
			? UnwrappedUbo<M[key]>
			: never
};


export type UbosFromIntrospection<I extends Introspection, O> = {
	[key in Exclude<keyof I['ubos'], keyof O>]: UnwrappedUbo<Omit<I['ubos'][key], '@blockSize'>>
};


export type TexturesFromIntrospection<I extends Introspection> = {
	[key in keyof I['textures']]: TextureSlot
};
