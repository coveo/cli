import {
  spawnSync,
  spawn,
  SpawnOptions,
  SpawnSyncOptions,
} from 'node:child_process';
import {dirname, join} from 'node:path';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const npmCliPath = join(dirname(require.resolve('npm')), 'bin', 'npm-cli.js');

export const npmSync = (args: string[], opts?: SpawnSyncOptions) =>
  spawnSync('node', [npmCliPath, ...args], opts);
export const npmAsync = (args: string[], opts?: SpawnOptions) =>
  spawn('node', [npmCliPath, ...args], opts);
