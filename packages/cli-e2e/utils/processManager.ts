import {
  ChildProcessWithoutNullStreams,
  SpawnOptionsWithoutStdio,
  spawn as nativeSpawn,
} from 'child_process';
import fkill from 'fkill';
import {pid} from 'process';
export class ProcessManager {
  private processes: Set<ChildProcessWithoutNullStreams>;
  public constructor() {
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
  private isNumber(value: unknown): value is number {
    return typeof value === 'number';
  }
  public async killAllProcesses() {
    const pids: Array<number> = Array.from(this.processes.values())
      .map((process) => process.pid)
      .filter(this.isNumber);
    const groupPids =
      process.platform === 'win32' ? pids : pids.map((pid) => -pid);
    await fkill(groupPids, {tree: true, force: true, silent: true});
  }
}
