import {mkdirSync} from 'fs';
import {SCREENSHOTS_PATH} from '../utils/browser';
import {ProcessManager} from '../utils/processManager';

import {
  setProcessEnv,
  createUiProjectDirectory,
  startVerdaccio,
  restoreCliConfig,
} from './utils';
import {dirname} from 'path';

export default async function () {
  mkdirSync(SCREENSHOTS_PATH, {recursive: true});
  // runId must start and finish with letters to satisfies Angular.
  setProcessEnv();

  createUiProjectDirectory();
  global.processManager = new ProcessManager();
  await startVerdaccio();
  restoreCliConfig();
}
