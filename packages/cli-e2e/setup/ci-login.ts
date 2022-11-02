import {mkdirSync} from 'fs';
import {SCREENSHOTS_PATH} from '../utils/browser';
import PlatformClient, {Environment} from '@coveo/platform-client';
import {ProcessManager} from '../utils/processManager';

import 'dotenv/config';

import {
  setProcessEnv,
  authenticateCli,
  shimNpm,
  installCli,
} from './utils/utils';
import {getConfig, getConfigFilePath} from '../utils/cli';
import {exportVariable, setSecret} from '@actions/core';

async function main() {
  shimNpm();
  mkdirSync(SCREENSHOTS_PATH, {recursive: true});
  // runId must start and finish with letters to satisfies Angular.
  setProcessEnv();
  if (process.env.E2E_USE_NPM_REGISTRY) {
    await installCli();
  }
  process.stdout.write(`CLI PATH : ${process.env.CLI_EXEC_PATH}`);
  global.processManager = new ProcessManager();
  await authenticateCli();
  outputCliConfig();
  await ensureOrgIsAwake();
  await global.processManager.killAllProcesses();
}
function outputCliConfig() {
  const config = getConfig();
  setSecret(config.accessToken);
  exportVariable('CLI_CONFIG_PATH', getConfigFilePath());
}

main();

function ensureOrgIsAwake() {
  const config = getConfig();
  const client = new PlatformClient({
    environment: castEnvironmentToPlatformClient(config.environment),
    region: config.region,
    organizationId: config.organization,
    accessToken: config.accessToken!,
  });
  return client.organization.resume();
}

function castEnvironmentToPlatformClient(e: string): Environment {
  switch (e) {
    case 'dev':
      return Environment.dev;
    case 'stg':
      return Environment.stg;
    case 'prod':
      return Environment.prod;
    case 'hipaa':
      return Environment.hipaa;
    default:
      return Environment.prod;
  }
}
