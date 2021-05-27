import {
  ChildProcessWithoutNullStreams,
  SpawnOptionsWithoutStdio,
  spawn as nativeSpawn,
} from 'child_process';
import {recurseProcessKillWindows} from './windowsProcessKiller';

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
    const process = nativeSpawn(command, args, {
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
    for (
      let current = processIterator.next();
      !current.done;
      current = processIterator.next()
    ) {
      const currentProcess = current.value;
      await new Promise<void>((resolve) => {
        promises.push(
          new Promise<void>((exit) => {
            currentProcess.removeAllListeners('exit').on('exit', () => {
              this.onExit(currentProcess)();
              exit();
            });
            if (!Number.isInteger(currentProcess.pid)) {
              console.error(
                `Process pid is not a number. Received pid: ${currentProcess.pid}`
              );
              return resolve();
            }
            if (process.platform === 'win32') {
              recurseProcessKillWindows(currentProcess.pid);
            } else {
              process.kill(-currentProcess.pid);
            }
            resolve();
          })
        );
      });
    }
    await Promise.all(promises);
  }
}
