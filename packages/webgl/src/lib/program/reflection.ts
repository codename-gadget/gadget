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

type UboReflection = { [key: string]: UboData, '@blockSize': number };

type AttributeReflection = { type: UniformType, location: number };

type TextureReflection = {
	type: SamplerType,
	binding: number,
};

export type Reflection = {
	attributes: Record<string, AttributeReflection>
	ubos?: Record<string, UboReflection>
	textures?: Record<string, TextureReflection>
};


export type UnwrappedUbo<M extends UboMemberList = UboMemberList> = {
	[key in keyof M]:
	M[key] extends UboMember
		? UniformView<Float32Array>
		: M[key] extends UboMemberList
			? UnwrappedUbo<M[key]>
			: never
};


export type UbosFromReflection<R extends Reflection, O> = {
	[key in Exclude<keyof R['ubos'], keyof O>]: UnwrappedUbo<Omit<R['ubos'][key], '@blockSize'>>
};


export type TexturesFromReflection<R extends Reflection> = {
	[key in keyof R['textures']]: TextureSlot
};
