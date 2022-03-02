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
import {setOutput} from '@actions/core';

export default async function () {
  mkdirSync(SCREENSHOTS_PATH, {recursive: true});
  // runId must start and finish with letters to satisfies Angular.
  setProcessEnv();

  global.processManager = new ProcessManager();
  await startVerdaccio();
  await npmLogin();
  await publishPackages();

  await authenticateCli();
  outputCliConfig();
}
function outputCliConfig() {
  const cliConfigJson = JSON.stringify(getConfig());
  setOutput(CLI_CONFIG_JSON_CI_KEY, cliConfigJson);
}
