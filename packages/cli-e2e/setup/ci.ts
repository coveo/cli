import {mkdirSync, writeFileSync} from 'fs';
import {SCREENSHOTS_PATH} from '../utils/browser';
import {getConfigFilePath} from '../utils/cli';
import {fileSync} from 'tmp';
import {ProcessManager} from '../utils/processManager';

import 'dotenv/config';

import {setProcessEnv, createUiProjectDirectory, startVerdaccio} from './utils';
import {join} from 'path';
import {decrypt} from '../utils/gpg';

export default async function () {
  mkdirSync(SCREENSHOTS_PATH, {recursive: true});
  // runId must start and finish with letters to satisfies Angular.
  setProcessEnv();

  createUiProjectDirectory();
  global.processManager = new ProcessManager();
  await startVerdaccio();

  await restoreCliConfig();
}

async function restoreCliConfig() {
  const cliJSONB64 = process.env.CLI_CONFIG_JSON!;
  const tmpFile = fileSync();
  writeFileSync(
    tmpFile.name,
    Buffer.from(cliJSONB64, 'base64').toString('utf-8')
  );
  const cliJsonConfig = await decrypt(
    tmpFile.name,
    process.env.E2E_TOKEN_PASSPHRASE!
  );
  const cliConfigFilePath = getConfigFilePath();
  mkdirSync(join(cliConfigFilePath, '..'), {recursive: true});
  writeFileSync(cliConfigFilePath, cliJsonConfig);
}
