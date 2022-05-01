import type { SpirvReflection } from '../types/SpirvReflection';
import toGlName from './toGlName';
import { toGlEnum } from './glTypes';


/**
 * Recursively builds a introspection for a given type
 *
 * @param reflection - SPIRV-Cross reflection object to base the introspection on
 * @param typeId - The type to introspect.
 * @param offset - Initial buffer offset.
 * @returns The introspection object.
 * @internal
 */
export default function introspectionForType(
	reflection: Pick<SpirvReflection, 'types'>,
	typeId: string,
	offset = 0,
): Record<string, unknown> {
	if ( typeId in reflection.types ) {
		const type = reflection.types[typeId];
		const introspection: Record<string, unknown> = {};

		type.members.forEach( ( member ) => {
			const name = toGlName( member.name );

			if ( member.array ) {
				const count = member.array[0];
				let currentOffset = offset + member.offset;
				const arrMembers = [];

				for ( let i = 0; i < count; i += 1 ) {
					arrMembers.push( introspectionForType(
						reflection,
						member.type,
						currentOffset,
					) );
					currentOffset += member.array_stride;
				}

				introspection[name] = arrMembers;
			} else {
				introspection[name] = introspectionForType(
					reflection,
					member.type,
					offset + member.offset,
				);
			}
		} );

		return introspection;
	}


	return {
		'@type': toGlEnum( typeId ),
		'@offset': offset,
	};
}
