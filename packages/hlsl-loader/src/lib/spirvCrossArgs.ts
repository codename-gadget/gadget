const spirvCrossArgs = [
	// use stdin as input
	'-',

	// compile to GLES 3.0
	'--version 300',
	'--es',

	// optimise resulting code
	'--remove-unused-variables',
];

export default spirvCrossArgs;
