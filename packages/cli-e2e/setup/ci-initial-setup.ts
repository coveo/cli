import {mkdirSync} from 'fs';
import {SCREENSHOTS_PATH} from '../utils/browser';

import {ProcessManager} from '../utils/processManager';

import 'dotenv/config';

import {npmLogin} from '../utils/npmLogin';
import {
  setProcessEnv,
  startVerdaccio,
  publishPackages,
  authenticateCli,
} from './utils';
import {getConfig, getConfigFilePath} from '../utils/cli';
import {exportVariable, setSecret} from '@actions/core';

async function main() {
  console.log('HELLO');
  mkdirSync(SCREENSHOTS_PATH, {recursive: true});
  // runId must start and finish with letters to satisfies Angular.
  setProcessEnv();

  global.processManager = new ProcessManager();
  await startVerdaccio();
  await npmLogin();
  await publishPackages();

  await authenticateCli();
  await outputCliConfig();
  await global.processManager.killAllProcesses();
}
async function outputCliConfig() {
  const config = getConfig();
  setSecret(config.accessToken);
  exportVariable('CLI_CONFIG_PATH', getConfigFilePath());
}

main();
