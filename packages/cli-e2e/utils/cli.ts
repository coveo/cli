require('isomorphic-fetch');
require('abortcontroller-polyfill');
require('isomorphic-form-data');

import type {ChildProcessWithoutNullStreams} from 'child_process';
import {resolve, join} from 'path';
import {mkdirSync} from 'fs';
import {homedir} from 'os';

import stripAnsi from 'strip-ansi';

import {ProcessManager} from './processManager';
import {readJsonSync} from 'fs-extra';
import PlatformClient, {Environment} from '@coveord/platform-client';

export function isYesNoPrompt(data: string) {
  return data.trimEnd().toLowerCase().endsWith('(y/n):');
}

export function isGenericYesNoPrompt(data: string) {
  let stripedData = data;
  try {
    stripedData = stripAnsi(data.toString());
  } catch (error) {
    console.log('Unable to strip ansi from string', error);
  }
  return /\(y\/n\)[\s:]*$/i.test(stripedData);
}

export function answerPrompt(
  answer: string,
  proc: ChildProcessWithoutNullStreams
) {
  return new Promise<void>((resolve) => {
    if (!proc.stdin.write(answer)) {
      proc.stdin.once('drain', () => resolve());
    } else {
      process.nextTick(() => resolve);
    }
  });
}

export interface ISetupUIProjectOptionsArgs {
  flags?: string[];
}

export function getProjectPath(projectName: string) {
  const uiProjectFolderName = 'ui-projects';
  mkdirSync(join(homedir(), uiProjectFolderName), {recursive: true});
  return join(homedir(), uiProjectFolderName, projectName);
}

export function setupUIProject(
  processManager: ProcessManager,
  commandArgs: string,
  projectName: string,
  options: ISetupUIProjectOptionsArgs = {}
) {
  const versionToTest = process.env.UI_TEMPLATE_VERSION;
  const uniqueProjectName = `${process.env.GITHUB_ACTION}-${projectName}`;
  process.stdout.write('\n********* TODO: TO DELETE ************\n');
  process.stdout.write(uniqueProjectName);
  process.stdout.write('\n********* TODO: TO DELETE ************\n');
  let command = [commandArgs, uniqueProjectName, ...(options.flags || [])];

  if (versionToTest) {
    command = command.concat(['-v', versionToTest]);
    console.log(`Testing with version ${versionToTest} of the template`);
  } else {
    console.log('Testing with published version of the template');
  }

  const buildProcess = processManager.spawn(CLI_EXEC_PATH, command, {
    cwd: resolve(getProjectPath(projectName), '..'),
  });

  return buildProcess;
}

export function getConfig() {
  const pathToConfig = resolve(
    __dirname,
    ...new Array(4).fill('..'),
    '.config',
    '@coveo',
    'cli',
    'config.json'
  );

  return readJsonSync(pathToConfig);
}

export async function deleteAllCliApiKeys() {
  const {organization, accessToken} = getConfig();
  const platformClient = new PlatformClient({
    // TODO: CDX-98: connect to prod environment.
    environment: Environment.dev,
    organizationId: organization,
    accessToken: accessToken,
  });

  const list = await platformClient.apiKey.list();

  const KeysToDelete = list
    .filter(
      (key) =>
        key.displayName?.startsWith(`cli-${process.env.GITHUB_ACTION}-`) &&
        key.description === 'Generated by the Coveo CLI'
    )
    .map((key) => key.id);

  await Promise.all(
    KeysToDelete.map((keyId) => platformClient.apiKey.delete(keyId!))
  );
}

export const CLI_EXEC_PATH = resolve(__dirname, '../../cli/bin/run');
