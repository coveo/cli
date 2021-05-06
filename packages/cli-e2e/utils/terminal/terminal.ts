import type {
  SpawnOptionsWithoutStdio,
  ChildProcessWithoutNullStreams,
} from 'child_process';
import type {Condition} from './condition';
import type {When} from './when';

import {ProcessManager} from '../processManager';
import {Orchestrator} from './orchestrator';
import {FileLogger} from '../filelogger';

/**
 * An helper class to manipulate processes that interact with a TTY.
 * You can interact with the TTY using the 'When This Do That' logic.
 * e.g.
 * ```
 * (new Terminal('echo',['helloWorld']))
 *  .when(/helloWorld/)
 *  .on('stdout')
 *  .do(console.log('Hello process!'));
 * ```
 */
export class Terminal {
  private childProcess: ChildProcessWithoutNullStreams;
  public orchestrator: Orchestrator;
  constructor(
    command: string,
    args?: ReadonlyArray<string>,
    options?: SpawnOptionsWithoutStdio,
    processManager: ProcessManager = new ProcessManager(),
    debugName?: string
  ) {
    this.childProcess = processManager.spawn(command, args, options);

    const fileLogger = new FileLogger(
      debugName ?? `${command}-${args?.join('-')}`.replace(/[^\w\d]/g, '-')
    );
    this.childProcess.stdout.pipe(fileLogger.stdout, {end: true});
    this.childProcess.stderr.pipe(fileLogger.stdout, {end: true});
    this.orchestrator = new Orchestrator(this.childProcess);
  }

  /**
   * Specify what condition to monitor
   * @param conditionOrCallback {Condition} the condition that will trigger the action when fulfilled.
   *  It should either be a `RegExp`, a `string`, or a callback acting on a `ChildProcessWithoutNullStreams`.
   * @returns {When}
   */
  public when(conditionOrCallback: Condition): When {
    return this.orchestrator.getNewHandle().when(conditionOrCallback);
  }
}
