import {appendCmdIfWindows} from './os';
import {spawnProcessOutput, spawnProcessPTY} from './process';
import {parse} from 'semver';
import type {IWindowsPtyForkOptions} from 'node-pty';

export async function npxInPty(
  args: string[],
  options: IWindowsPtyForkOptions = {}
) {
  const npxVersion = await getNpxMajorVersion();
  if (npxVersion >= 7) {
    args.unshift('--yes');
  }
  return spawnProcessPTY(appendCmdIfWindows`npx`, args, options);
}

async function getNpxMajorVersion() {
  const output = await spawnProcessOutput(appendCmdIfWindows`npx`, [
    '--version',
  ]);
  const version = parse(output.stdout.trim());
  if (!version) {
    throw 'Failed to check NPX version.';
  }
  return version.major;
}
