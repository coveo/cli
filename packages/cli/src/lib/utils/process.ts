import {spawn, SpawnOptions} from 'child_process';
import {error} from 'console';

/**
 *
 * @private
 * @param {string} command The command to run
 * @param {string[]} args List of string arguments
 * @param {SpawnOptions} [options={}]
 * @returns {Promise<number>} A promise of the the child process exit code
 */
export function spawnProcess(
  command: string,
  args: string[],
  options: SpawnOptions = {}
): Promise<number> {
  return new Promise((resolve, reject) => {
    spawn(command, args, {
      stdio: ['inherit', 'inherit', 'inherit'],
      ...options,
    }).on('close', (code) => {
      if (code !== 0) {
        // TODO: inject logger decorator so this util method can log
        // this.debug(
        //   `Following command has failed: ${command} ${args.join(' ')}`
        // );

        // Any error message triggered by the execution of the subprocess will be
        // displayed since the terminal is shared by both parent and child processes.
        // So no need to bubble up the error.
        reject(code);
      } else {
        resolve(0);
      }
    });
  });
}

export async function spawnProcessStdio(
  command: string,
  args: string[],
  options: SpawnOptions = {}
): Promise<{stdout: string; stderr: string}> {
  return new Promise((resolve) => {
    const stdio = {stdout: '', stderr: ''};
    const child = spawn(command, args, options);

    child.stdout.on('data', (d) => {
      stdio.stdout += d;
    });

    child.stderr.on('data', (d) => {
      stdio.stderr += d;
    });

    child.on('error', (e) => {
      stdio.stderr += e.message;
      resolve(stdio);
    });

    child.on('close', () => {
      resolve(stdio);
    });
  });
}
