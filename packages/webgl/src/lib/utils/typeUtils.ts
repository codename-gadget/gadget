export type DiscriminatingOr<A, B> = (
	{
		[key in keyof B]?: never
	} & A
) | (
	{
		[key in keyof A]?: never
	} & B
);
