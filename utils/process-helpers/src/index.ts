import type {ChildProcess} from 'node:child_process';

export const getStdoutStderrBuffersFromProcess = (
  processToWatch: ChildProcess
) => {
  const stdoutChunks: Buffer[] = [];
  const stderrChunks: Buffer[] = [];
  processToWatch.stdout?.on('data', (data: Buffer) => stdoutChunks.push(data));
  processToWatch.stderr?.on('data', (data: Buffer) => stderrChunks.push(data));
  return {
    get stdout() {
      return Buffer.concat(stdoutChunks).toString();
    },
    get stderr() {
      return Buffer.concat(stderrChunks).toString();
    },
  };
};
