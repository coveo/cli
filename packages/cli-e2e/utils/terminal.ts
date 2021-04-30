import {SpawnOptionsWithoutStdio} from 'child_process';
import {ChildProcessWithoutNullStreams} from 'child_process';
import {Readable} from 'stream';
import stripAnsi from 'strip-ansi';
import {ProcessManager} from './processManager';

type ITerminalSpawnOptions = [
  string,
  ReadonlyArray<string>,
  SpawnOptionsWithoutStdio
];

export class Terminal {
  private process: ChildProcessWithoutNullStreams;
  public orchestrator: Orchestrator;

  constructor(
    private processManager: ProcessManager = new ProcessManager(),
    private spawnOptions: ITerminalSpawnOptions
  ) {
    this.process = processManager.spawn(...spawnOptions);
    this.orchestrator = new Orchestrator(this.process);
  }

  public when(conditionOrCallback: Condition): When {
    return this.orchestrator.getNewHandle().when(conditionOrCallback);
  }
}

class Action {
  public parallelAction?: Action;
  public sequentialAction?: Action;
  public when?: When;
  public on?: On;

  constructor(public process: ChildProcessWithoutNullStreams) {}
}

type DoCallback = (
  process: ChildProcessWithoutNullStreams
) => void | Promise<void>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class When {
  constructor(private action: Action, public condition: Condition) {
    this.action.when = this;
  }
  public on(stream: OnStream) {
    return new On(this.action, stream);
  }
}

function isConditionRegExp(
  condition: Condition | undefined
): condition is RegExp {
  return condition instanceof RegExp;
}

function isConditionString(
  condition: Condition | undefined
): condition is string {
  return typeof condition === 'string';
}

function isConditionFunction(
  condition: Condition | undefined
): condition is ProcessCondition {
  return typeof condition === 'function';
}

const alwaysTrue: ProcessCondition = (
  _process: ChildProcessWithoutNullStreams
) => true;

type OnStream = 'stdout' | 'stderr';

class On {
  constructor(private action: Action, public target: OnStream | 'process') {
    this.action.on = this;
  }

  public do(callback: DoCallback) {
    const condition: Condition = this.action.when?.condition ?? alwaysTrue;
    let exitFunction: () => void;
    const returnObject = this.addDoer(
      condition,
      (process: ChildProcessWithoutNullStreams, resolve: () => void) => {
        callback(process);
        exitFunction = resolve;
      }
    );

    Object.defineProperty(
      returnObject,
      'until',
      (untilCondition: Condition) => {
        this.addDoer(
          untilCondition,
          (process: ChildProcessWithoutNullStreams, resolve: () => void) => {
            exitFunction();
            resolve();
          }
        );
      }
    );
    return returnObject;
  }

  private addDoer(
    condition: Condition,
    callback: (
      process: ChildProcessWithoutNullStreams,
      resolve: () => void
    ) => void
  ) {
    const target: Readable | ChildProcessWithoutNullStreams =
      this.action.on!.target === 'process'
        ? this.action.process
        : this.action.process[this.action.on!.target ?? 'stdout'];

    if (isConditionRegExp(condition)) {
      return new Promise<void>((resolve) => {
        target.on('data', (data) => {
          if (stripAnsi(data.toString()).replace(/\n/g, '').match(condition)) {
            callback(this.action.process, resolve);
          }
        });
      });
    }

    if (isConditionString(condition)) {
      return new Promise<void>((resolve) => {
        target.on(condition, () => callback(this.action.process, resolve));
      });
    }

    if (isConditionFunction(condition)) {
      return new Promise<void>((resolve) => {
        condition(this.action.process, () =>
          callback(this.action.process, resolve)
        );
      });
    }
    throw 'Terminal Action malformed';
  }
}

class Orchestrator {
  public actions: Action[];
  constructor(public process: ChildProcessWithoutNullStreams) {
    this.actions = new Array<Action>();
  }
  public getNewHandle() {
    return new Entrypoint(this);
  }
}

type ProcessCondition = (
  process: ChildProcessWithoutNullStreams,
  callbackIfFulfilled: (
    process: ChildProcessWithoutNullStreams,
    resolve: () => void
  ) => void
) => void;

type Condition = RegExp | string | ProcessCondition;

class Entrypoint {
  constructor(private orchestrator: Orchestrator) {}

  public when(conditionOrCallback: Condition): When {
    const action = new Action(this.orchestrator.process);
    this.orchestrator.actions.push(action);
    return new When(action, conditionOrCallback);
  }
}
