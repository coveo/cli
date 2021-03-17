import {ensureDirSync} from 'fs-extra';
import stripAnsi from 'strip-ansi';
import {ChildProcessWithoutNullStreams, spawn} from 'child_process';
import {resolve} from 'path';
import {EOL} from 'os';
import {join} from 'path';

export function killCliProcess(cliProcess: ChildProcessWithoutNullStreams) {
  const waitForKill = new Promise<void>((resolve) => {
    cliProcess.on('close', () => resolve());
  });
  cliProcess.kill('SIGINT');
  return waitForKill;
}

export function killCliProcessFamily(
  cliProcessLeader: ChildProcessWithoutNullStreams
) {
  const waitForKill = new Promise<void>((resolve) => {
    cliProcessLeader.on('close', () => resolve());
  });
  process.kill(-cliProcessLeader.pid);
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
  return stripedData.match(/\(y\/n\)[\s:]*$/i) !== null;
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
  timeout?: number;
}

export async function setupUIProject(
  uiCommand: string,
  projectName: string,
  cliProcesses: ChildProcessWithoutNullStreams[],
  options: ISetupUIProjectOptionsArgs = {}
) {
  const uiProjectFolderName = 'ui-projects';
  ensureDirSync(uiProjectFolderName);
  const defaultOptions: ISetupUIProjectOptionsArgs = {flags: [], timeout: 15e3};
  options = Object.assign(defaultOptions, options);

  const createProjectPromise = new Promise<void>((resolve) => {
    const buildProcess = spawn(
      CLI_EXEC_PATH,
      [uiCommand, projectName, ...(options.flags || [])],
      {
        cwd: uiProjectFolderName,
      }
    );

    buildProcess.stdout.on('close', async () => {
      resolve();
    });
    buildProcess.stdout.on('data', async (data) => {
      if (isGenericYesNoPrompt(data.toString())) {
        await answerPrompt(`y${EOL}`, buildProcess);
      }
    });
  });

  await createProjectPromise;

  return new Promise<void>((resolve) => {
    const startServerProcess = spawn('npm', ['run', 'start'], {
      cwd: join(uiProjectFolderName, projectName),
      detached: true,
    });

    cliProcesses.push(startServerProcess);
    setTimeout(() => {
      resolve();
    }, options.timeout);
  });
}

export async function teardownUIProject(
  cliProcesses: ChildProcessWithoutNullStreams[]
) {
  return Promise.all(
    cliProcesses.map((cliProcess) => killCliProcessFamily(cliProcess))
  );
}

export const CLI_EXEC_PATH = resolve(__dirname, '../../cli/bin/run');
