import stripAnsi from 'strip-ansi';
import {ChildProcessWithoutNullStreams, spawn} from 'child_process';
import {resolve} from 'path';
import {EOL} from 'os';

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

export async function setupUIProject(
  commandArgs: string,
  projectName: string,
  cliProcesses: ChildProcessWithoutNullStreams[]
) {
  const createProjectPromise = new Promise<void>((resolve) => {
    const versionToTest = process.env.UI_TEMPLATE_VERSION;
    let command = [commandArgs, projectName];
    if (versionToTest) {
      command = command.concat(['-v', versionToTest]);
      process.stdout.write(
        `Testing with version ${versionToTest} of the template`
      );
    } else {
      process.stdout.write('Testing with published version of the template');
    }
    const buildProcess = spawn(CLI_EXEC_PATH, command);

    buildProcess.stdout.on('close', async () => {
      resolve();
    });
    buildProcess.stdout.on('data', async (data) => {
      if (stripAnsi(data.toString()).indexOf('Pick an action:') !== -1) {
        await new Promise<void>((resolve) => {
          if (buildProcess.stdin.write(`\u001b[B${EOL}`)) {
            buildProcess.stdin.once('drain', () => resolve());
          } else {
            process.nextTick(() => resolve);
          }
        });
      }
      if (isGenericYesNoPrompt(data.toString())) {
        await answerPrompt(`y${EOL}`, buildProcess);
      }
    });
  });

  await createProjectPromise;
  const startServerProcess = spawn('npm', ['run', 'start'], {
    cwd: projectName,
    detached: true,
  });

  cliProcesses.push(startServerProcess);
  await new Promise<void>((resolve) => {
    startServerProcess.stdout.on('data', async (data) => {
      if (stripAnsi(data.toString()).indexOf('App running at:') !== -1) {
        resolve();
      }
    });
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
