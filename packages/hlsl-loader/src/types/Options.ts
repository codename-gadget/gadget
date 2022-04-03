export interface HlslLoaderOptions {
	/**
	 * A list of exports per HLSL file.
	 *
	 * Non-existent entry points will be ignored.
	 *
	 * @example
	 * ```
	 * {
	 *    exports: {
	 *        myVertexExportName: {
	 *            entry: 'myHLSLVertexFunctionName',
	 *            stage: 'vs_6_7',
	 *        },
	 *        myFragmentExportName: {
	 *            entry: 'myHLSLFragmentFunctionName',
	 *            stage: 'ps_6_7',
	 *        }
	 *    }
	 *}
	 * ```
	 */
	exports?: {
		/**
		 * Object specifying an export, the key being the exports name.
		 */
		[exportName: string]: {
			/**
			 * Name of the HLSL function to use as the entry point.
			 */
			entry: string,
			/**
			 * Shader model and -stage to compile to.
			 *
			 * Usually `"vs_6_7"` for vertex- and `"ps_6_7"` for pixel shaders.
			 */
			stage: string,
		}
	};

	/**
	 * Additional directories to search for `#include`d files.
	 * By default, only the directory containing the imported file is considered.
	 *
	 * @defaultValue []
	 */
	includeDirectories?: string[],

	/**
	 * Whether to shorten internal variable names.
	 *
	 * @defaultValue true
	 */
	mangle?: boolean;

	/**
	 * Whether to log the compiled GLSL code to the console.
	 *
	 * May be useful during development.
	 * This is automatically disabled for production builds.
	 *
	 * @defaultValue false
	 */
	logGlsl?: boolean;

	/**
	 * Whether to emit .d.ts files containing declarations for imported HLSL files.
	 *
	 * This is automatically disabled for production builds.
	 *
	 * @defaultValue true
	 */
	generateDeclarations?: boolean
}
