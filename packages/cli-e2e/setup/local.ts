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
} from './utils';

export default async function () {
  ensureMitmProxyInstalled();
  useCIConfigIfEnvIncomplete();
  mkdirSync(SCREENSHOTS_PATH, {recursive: true});
  setProcessEnv();

  createUiProjectDirectory();

  global.processManager = new ProcessManager();
  await startVerdaccio();
  await npmLogin();
  await publishPackages();
}
