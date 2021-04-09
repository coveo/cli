import {
  ChildProcessWithoutNullStreams,
  SpawnOptionsWithoutStdio,
  spawn as nativeSpawn,
} from 'child_process';

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
    const process = nativeSpawn(command, args, {detached: true, ...options});
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
              exit();
            });
            if (!Number.isInteger(currentProcess.pid)) {
              console.error(
                `Process pid is not a number. Received pid: ${currentProcess.pid}`
              );
              resolve();
            }
            process.kill(-currentProcess.pid);
            resolve();
          })
        );
      });
      current = processIterator.next();
    }

    return Promise.all(promises);
  }
}
