import {copyFileSync, mkdirSync} from 'fs';
import {SCREENSHOTS_PATH} from '../utils/browser';
import {getConfigFilePath} from '../utils/cli';
import {ProcessManager} from '../utils/processManager';

import {setProcessEnv, createUiProjectDirectory, startVerdaccio} from './utils';
import {dirname, join, resolve} from 'path';
import {npm} from '../utils/npm';
import {Terminal} from '../utils/terminal/terminal';

export default async function () {
  mkdirSync(SCREENSHOTS_PATH, {recursive: true});
  // runId must start and finish with letters to satisfies Angular.
  setProcessEnv();

  createUiProjectDirectory();
  global.processManager = new ProcessManager();
  await startVerdaccio();
  const args = [...npm(), 'cache', 'ls', '@coveo/create-atomic'];
  await new Terminal(
    args.shift()!,
    args,
    {cwd: resolve(join(__dirname, '..'))},
    global.processManager!,
    'npm-cache'
  )
    .when('exit')
    .on('process')
    .do()
    .once();
  restoreCliConfig();
}

async function restoreCliConfig() {
  mkdirSync(dirname(getConfigFilePath()), {recursive: true});
  copyFileSync('decrypted', getConfigFilePath());
}
