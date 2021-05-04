import type {
  SpawnOptionsWithoutStdio,
  ChildProcessWithoutNullStreams,
} from 'child_process';
import type {Condition} from './condition';
import type {When} from './when';

import {ProcessManager} from '../processManager';
import {Orchestrator} from './orchestrator';

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
    processManager: ProcessManager = new ProcessManager()
  ) {
    this.childProcess = processManager.spawn(command, args, options);
    // TODO CDX-283: Replace console.log by a file logger.
    if (process.env['COVEO_CLI_E2E_DEBUG']) {
      this.childProcess.stdout.on('data', (data) =>
        console.log(`[STDOUT]${data.toString()}`)
      );
      this.childProcess.stderr.on('data', (data) =>
        console.log(`[STDERR]${data.toString()}`)
      );
      this.childProcess.stdin.on('data', (data) =>
        console.log(`[STDIN]${data.toString()}`)
      );
    }
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
