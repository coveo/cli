import {mkdirSync} from 'fs';
import {SCREENSHOTS_PATH} from '../utils/browser';

import {ProcessManager} from '../utils/processManager';

import 'dotenv/config';

import {setProcessEnv, authenticateCli, shimNpm, installCli} from './utils';
import {getConfig, getConfigFilePath} from '../utils/cli';
import {exportVariable, setSecret} from '@actions/core';

async function main() {
  shimNpm();
  mkdirSync(SCREENSHOTS_PATH, {recursive: true});
  // runId must start and finish with letters to satisfies Angular.
  setProcessEnv();
  if (process.env.E2E_USE_NPM_REGISTRY) {
    installCli();
  }
  process.stdout.write(`CLI PATH : ${process.env.CLI_EXEC_PATH}`);
  global.processManager = new ProcessManager();
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
