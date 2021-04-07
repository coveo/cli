import type {ChildProcessWithoutNullStreams} from 'child_process';
import {resolve, join} from 'path';
import {mkdirSync} from 'fs';
import {homedir} from 'os';

import stripAnsi from 'strip-ansi';

import {ProcessManager} from './processManager';

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
  let command = [commandArgs, projectName, ...(options.flags || [])];

  if (versionToTest) {
    command = command.concat(['-v', versionToTest]);
    process.stdout.write(
      `Testing with version ${versionToTest} of the template`
    );
  } else {
    process.stdout.write('Testing with published version of the template');
  }

  const buildProcess = processManager.spawn(CLI_EXEC_PATH, command, {
    cwd: resolve(getProjectPath(projectName), '..'),
  });

  return buildProcess;
}

export const CLI_EXEC_PATH = resolve(__dirname, '../../cli/bin/run');
