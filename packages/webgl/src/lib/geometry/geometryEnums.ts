/* eslint-disable import/prefer-default-export */

/**
 * Enum specifying how a geometry is drawn.
 */
export enum GeometryDrawMode {
	/** Draws a triangle for every three vertices. */
	triangles = 4,

	/** Draws a {@link https://en.wikipedia.org/wiki/Triangle_strip | triangle strip}. */
	triangleStrip = 5,

	/** Draws a {@link https://en.wikipedia.org/wiki/Triangle_fan | triangle fan}. */
	triangleFan = 6,

	/** Draws a 1px line connecting every two veritces. */
	lines = 1,

	/** Draws a 1px line connecting all vertives and connects the last one back to the first. */
	lineLoop = 2,

	/** Draws a 1px line connecting all vertices. */
	lineStrip = 3,

	/** Draws a camera facing quad per vertex. */
	points = 0,
}
