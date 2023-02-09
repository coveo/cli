import type {ChildProcess} from 'node:child_process';

export const getStdoutStderrBuffersFromProcess = (
  processToWatch: ChildProcess
) => {
  const stdoutChunks = [];
  const stderrChunks = [];
  processToWatch.stderr.on('data', (data) => stdoutChunks.push(data));
  processToWatch.stdout.on('data', (data) => stderrChunks.push(data));
  return {
    get stdout() {
      return Buffer.concat(stdoutChunks).toString();
    },
    get stderr() {
      return Buffer.concat(stderrChunks).toString();
    },
  };
};
