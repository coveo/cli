import {
  ChildProcessWithoutNullStreams,
  SpawnOptionsWithoutStdio,
} from 'child_process';

import spawn from 'spawn-command';

export class ProcessManager {
  private processes: Set<ChildProcessWithoutNullStreams>;
  constructor() {
    this.processes = new Set<ChildProcessWithoutNullStreams>();
  }

  public spawn(
    command: string,
    args?: ReadonlyArray<string>,
    options?: SpawnOptionsWithoutStdio
  ): ChildProcessWithoutNullStreams {
    const process = spawn(`${command} ${args?.join(' ')}`, {
      detached: true,
      ...options,
    });
    process.on('exit', this.onExit(process));
    this.processes.add(process);
    return process;
  }

  private onExit = (process: ChildProcessWithoutNullStreams) => () => {
    this.processes.delete(process);
  };

  public async killAllProcesses() {
    const promises: Promise<void>[] = [];
    const processIterator = this.processes.values();
    let current = processIterator.next();
    while (!current.done) {
      const currentProcess = current.value;
      currentProcess.removeAllListeners('exit');
      await new Promise<void>((resolve) => {
        promises.push(
          new Promise<void>((exit) => {
            currentProcess.on('exit', () => {
              this.onExit(currentProcess)();
              exit();
            });
            if (!Number.isInteger(currentProcess.pid)) {
              console.error(
                `Process pid is not a number. Received pid: ${currentProcess.pid}`
              );
              return resolve();
            }
            process.kill(
              (process.platform === 'win32' ? +1 : -1) * currentProcess.pid
            );
            resolve();
          })
        );
      });
      current = processIterator.next();
    }

    return Promise.all(promises);
  }
}
