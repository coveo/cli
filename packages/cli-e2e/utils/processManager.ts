import {
  ChildProcessWithoutNullStreams,
  SpawnOptionsWithoutStdio,
  spawn as nativeSpawn,
} from 'child_process';
import fkill from 'fkill';
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

  public async killAllProcesses() {
    const pids: Array<number> = Array.from(this.processes.values())
      .map(
        process.platform === 'win32'
          ? (process) => process.pid || 0
          : (process) => -(process.pid || 0)
      )
      .filter((pid) => pid !== 0);
    await fkill(pids, {tree: true, force: true, silent: true});
  }
}
