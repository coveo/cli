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
  CLI_CONFIG_JSON_CI_KEY,
} from './utils';
import {getConfig} from '../utils/cli';
import {setOutput, setSecret} from '@actions/core';

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
  outputCliConfig();
  await global.processManager.killAllProcesses();
}
function outputCliConfig() {
  const config = getConfig();
  setSecret(config.accessToken);
  const cliConfigJson = JSON.stringify(config);
  setOutput(CLI_CONFIG_JSON_CI_KEY, cliConfigJson);
}

main();
