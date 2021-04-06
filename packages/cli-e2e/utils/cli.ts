import {ensureDirSync} from 'fs-extra';
import stripAnsi from 'strip-ansi';
import {ChildProcessWithoutNullStreams} from 'child_process';
import {resolve} from 'path';
import {join} from 'path';
import {ProcessManager} from './processManager';

export function killCliProcess(cliProcess: ChildProcessWithoutNullStreams) {
  const waitForKill = new Promise<void>((resolve) => {
    cliProcess.on('close', () => resolve());
  });
  cliProcess.kill('SIGINT');
  return waitForKill;
}

export function killCliProcessFamily(
  processFamilyPid: ChildProcessWithoutNullStreams
): Promise<void> {
  const waitForKill = new Promise<void>((resolve) => {
    processFamilyPid.on('exit', () => {
      resolve();
    });
  });
  process.kill(-processFamilyPid.pid, 'SIGINT');
  return waitForKill;
}

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
  ensureDirSync(uiProjectFolderName);
  return join(uiProjectFolderName, projectName);
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

export function teardownUIProject(
  cliProcesses: ChildProcessWithoutNullStreams[]
) {
  return Promise.all(cliProcesses.map((ps) => killCliProcessFamily(ps)));
}

export const CLI_EXEC_PATH = resolve(__dirname, '../../cli/bin/run');
