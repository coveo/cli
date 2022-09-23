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
  shimNpm,
} from './utils/utils';
import {join} from 'path';
import {
  scaffoldDummyPackages,
  publishPackages,
  uplinkMissingPackages,
} from './utils/verdaccio';

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
  scaffoldDummyPackages();
  await publishPackages();
  await uplinkMissingPackages();
}
