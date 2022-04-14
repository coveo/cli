import {mkdirSync} from 'fs';
import {SCREENSHOTS_PATH} from '../utils/browser';
import {ProcessManager} from '../utils/processManager';

import {
  setProcessEnv,
  createUiProjectDirectory,
  startVerdaccio,
  restoreCliConfig,
  shimNpm,
  installCli,
} from './utils';

export default async function () {
  shimNpm();
  mkdirSync(SCREENSHOTS_PATH, {recursive: true});
  // runId must start and finish with letters to satisfies Angular.
  setProcessEnv();
  if (process.env.E2E_USE_NPM_REGISTRY) {
    installCli();
  }
  process.stdout.write(`CLI PATH : ${process.env.CLI_EXEC_PATH}`);
  createUiProjectDirectory();
  global.processManager = new ProcessManager();
  if (!(process.env.E2E_USE_NPM_REGISTRY === 'true')) {
    await startVerdaccio();
  }
  restoreCliConfig();
}
