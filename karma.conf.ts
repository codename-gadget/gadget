import type { Config, ConfigOptions } from 'karma';
import type { KarmaTypescriptConfig } from 'karma-typescript';


type Extendable<T> = T & { [key: string]: unknown };

export default ( config: Config ): void => {
	// types provided by @types/karma are incomplete,
	// so this is needed to get TS to compile
	const conf: Extendable<Partial<ConfigOptions> & {
		karmaTypescriptConfig: KarmaTypescriptConfig,
		client: Extendable<ConfigOptions['client']>,
	}> = {
		plugins: [
			'karma-typescript',
			'karma-jasmine',
			'karma-chrome-launcher',
			'karma-spec-reporter',
		],

		concurrency: 1,

		failOnEmptyTestSuite: false,

		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: __dirname,

		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['jasmine', 'karma-typescript'],

		// list of files to load in the browser
		files: [
			'packages/*/src/**/*.ts',
		],

		exclude: [
			'packages/hlsl-loader/**',
		],

		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			'**/*.ts': ['karma-typescript'],
		},

		karmaTypescriptConfig: {
			include: [
				'packages/*/src',
			],
			exclude: [
				'packages/hlsl-loader',
			],
			bundlerOptions: {
				constants: {
					__DEV_BUILD__: true,
					__VERSION__: '"TESTBUILD"',
				},
			},
			reports: {
				html: '_coverage',
				'text-summary': null,
			},
		},

		reporters: ['karma-typescript', 'spec'],

		specReporter: {
			suppressSkipped: false,
			prefixes: {
				success: '  OK: ',
				failure: 'FAIL: ',
				skipped: 'SKIP: ',
			},
		},

		client: {
			jasmine: {
				random: false,
			},
		},

		browsers: ['ChromeHeadless'],
	};

	config.set( conf as ConfigOptions );
};
