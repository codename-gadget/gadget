import { exec } from 'child_process';


/**
 * Runs a given command and passes a buffer to stdin
 *
 * @param command - The command to run
 * @param stdin - The buffer to pass to stdin
 * @internal
 */
export default async function execWithStdin(
	command: string,
	stdin: Buffer,
): Promise<{
		stdout: string;
		stderr: string;
	}> {
	return new Promise( ( resolve ) => {
		const child = exec( command, ( err, stdout, stderr ) => {
			resolve( {
				stderr,
				stdout,
			} );
		} );

		child.stdin.write( stdin );
		child.stdin.end();
	} );
}
