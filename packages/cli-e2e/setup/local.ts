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
  scaffoldDummyPackages,
  installCli,
} from './utils';
import {join} from 'path';

export default async function () {
  shimNpm();
  useCIConfigIfEnvIncomplete();
  mkdirSync(SCREENSHOTS_PATH, {recursive: true});
  setProcessEnv();
  process.env.npm_config_registry = 'http://localhost:4873';

  createUiProjectDirectory();
  process.env['GITHUB_WORKSPACE'] = join(__dirname, '..', '..', '..');
  global.processManager = new ProcessManager();
  await startVerdaccio();
  await npmLogin();
  scaffoldDummyPackages();
  await publishPackages();
  await installCli();
}
