import {mkdirSync, readFileSync, writeFileSync} from 'fs';
import {SCREENSHOTS_PATH} from '../utils/browser';
import {getConfigFilePath} from '../utils/cli';
import {ProcessManager} from '../utils/processManager';

import 'dotenv/config';

import {setProcessEnv, createUiProjectDirectory, startVerdaccio} from './utils';

export default async function () {
  mkdirSync(SCREENSHOTS_PATH, {recursive: true});
  // runId must start and finish with letters to satisfies Angular.
  setProcessEnv();

  createUiProjectDirectory();
  global.processManager = new ProcessManager();
  await startVerdaccio();
  restoreCliConfig();
}

async function restoreCliConfig() {
  writeFileSync(
    getConfigFilePath(),
    readFileSync('decrypted', {encoding: 'utf-8'})
  );
}
