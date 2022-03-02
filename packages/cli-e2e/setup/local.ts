import {mkdirSync} from 'fs';
import {SCREENSHOTS_PATH} from '../utils/browser';

import {ProcessManager} from '../utils/processManager';

import 'dotenv/config';

import {npmLogin} from '../utils/npmLogin';
import {
  ensureMitmProxyInstalled,
  useCIConfigIfEnvIncomplete,
  setProcessEnv,
  createUiProjectDirectory,
  startVerdaccio,
  publishPackages,
  authenticateCli,
} from './utils';

export default async function () {
  if (!process.env.CI) {
    ensureMitmProxyInstalled();
    useCIConfigIfEnvIncomplete();
  }
  mkdirSync(SCREENSHOTS_PATH, {recursive: true});
  // runId must start and finish with letters to satisfies Angular.
  setProcessEnv();

  createUiProjectDirectory();

  global.processManager = new ProcessManager();
  await startVerdaccio();
  await npmLogin();
  await publishPackages();

  if (process.env.CI) {
    await authenticateCli();
  }
}
