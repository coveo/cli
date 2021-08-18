import {spawn, SpawnOptions} from 'child_process';
import {spawn as ptySpawn, IWindowsPtyForkOptions} from 'node-pty';

function isErrnoException(error: Error): error is NodeJS.ErrnoException {
  return Object.hasOwnProperty.call(error, 'errno');
}

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

export interface SpawnProcessOutput {
  stdout: string;
  stderr: string;
  exitCode?: string;
}

export async function spawnProcessOutput(
  command: string,
  args: string[],
  options: SpawnOptions = {}
): Promise<SpawnProcessOutput> {
  return new Promise((resolve) => {
    const output: SpawnProcessOutput = {
      stdout: '',
      stderr: '',
    };

    const child = spawn(command, args, options);

    child.stdout?.on('data', (d) => {
      output.stdout += d;
    });

    child.stderr?.on('data', (d) => {
      output.stderr += d;
    });

    const closeListener = (code: number | null) => {
      output.exitCode = Number.isInteger(code) ? String(code) : undefined;
      resolve(output);
    };

    child.on('close', closeListener);

    child.on('error', (e) => {
      output.stderr += e.message;
      if (isErrnoException(e) && e.code) {
        child.off('close', closeListener);
        output.exitCode = e.code;
        resolve(output);
      }
    });
  });
}

export function spawnProcessPTY(
  command: string,
  args: string[],
  options: IWindowsPtyForkOptions = {}
) {
  const ptyProcess = ptySpawn(command, args, {
    name: 'xterm-color',
    cols: process.stdout.columns,
    rows: process.stdout.rows,
    cwd: options.cwd ?? process.cwd(),
    useConpty: false,
  });

  return ptyProcess;
}
