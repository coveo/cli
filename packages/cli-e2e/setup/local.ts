import {mkdirSync} from 'fs';
import {SCREENSHOTS_PATH} from '../utils/browser';

import {ProcessManager} from '../utils/processManager';

import 'dotenv/config';

import {npmLogin} from '../utils/npmLogin';
import {
  useCIConfigIfEnvIncomplete,
  setProcessEnv,
  createUiProjectDirectory,
  startVerdaccio,
  publishPackages,
  shimNpm,
} from './utils';
import {join} from 'path';

export default async function () {
  shimNpm();
  useCIConfigIfEnvIncomplete();
  mkdirSync(SCREENSHOTS_PATH, {recursive: true});
  setProcessEnv();

  createUiProjectDirectory();
  process.env['GITHUB_WORKSPACE'] = join(__dirname, '..', '..', '..');
  global.processManager = new ProcessManager();
  await startVerdaccio();
  await npmLogin();
  await publishPackages();
}
