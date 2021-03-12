import stripAnsi from 'strip-ansi';
import type {ChildProcessWithoutNullStreams} from 'child_process';
import {resolve} from 'path';

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
export const CLI_EXEC_PATH = resolve(__dirname, '../../cli/bin/run');
