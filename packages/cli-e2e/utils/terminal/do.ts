import type {ChildProcessWithoutNullStreams} from 'child_process';
import type EventEmitter from 'events';
import type {Readable} from 'stream';
import type {ActionWith} from './action';

import stripAnsi from 'strip-ansi';

import {
  Condition,
  isConditionPromise,
  isConditionRegExp,
  isConditionString,
} from './condition';

/**
 * An object composed of the three element required to unhook an eventListener from an EventEmitter.
 * (e.g. ChildProcess or Readable stream )
 */
type EventListenerObject = {
  target: EventEmitter;
  event: string;
  listener: (data: Buffer) => void;
};

export type DoCallback =
  | ((process: ChildProcessWithoutNullStreams) => void | Promise<void>)
  | (() => void | Promise<void>);

export class Do implements Promise<void> {
  public promise: Promise<void>;
  private exitFunction: (() => void) | undefined;
  public constructor(
    private action: ActionWith<'condition' | 'target'>,
    doCallback: DoCallback
  ) {
    this.promise = new Promise<void>(this.do(doCallback));
  }

  public then<TResult1 = void, TResult2 = never>(
    onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?:
      | ((reason: string | Error) => TResult2 | PromiseLike<TResult2>)
      | null
  ): Promise<TResult1 | TResult2> {
    return this.promise.then(onfulfilled, onrejected);
  }

  public catch<TResult = never>(
    onrejected?:
      | ((reason: string | Error) => TResult | PromiseLike<TResult>)
      | null
  ): Promise<void | TResult> {
    return this.promise.catch(onrejected);
  }

  public get [Symbol.toStringTag]() {
    return 'Do';
  }

  public finally(onfinally?: (() => void) | null): Promise<void> {
    return this.promise.finally(onfinally);
  }

  /**
   * Bound the `while.do` with an exit condition.
   * If not specified (either with `until` or `once`) the hook will run till the process die.
   * **It is highly recommended to specify one to ensure proper resource cleaning**
   * @param untilCondition {Condition} a condition on which the hook chain (i.e. `where.do.until`) will unhook itself from the terminal.
   * @returns {Promise} an awaitable promise that will resolve when the `untilCondition` is satisfied.
   */
  public until(untilCondition: Condition): Promise<void> {
    let eventListener: EventListenerObject | undefined;
    return new Promise<void>((resolve) => {
      eventListener = this.addTerminalListener(
        untilCondition,
        (_process: ChildProcessWithoutNullStreams, resolve: () => void) => {
          this.exitFunction!();
          resolve();
        },
        resolve
      );
    }).then(() => {
      if (eventListener) {
        this.removeListener(eventListener);
      }
    });
  }

  /**
   * Ensure the `callback` of the do is executed only once.
   * An exit condition should always be specified, either with `until` or `once`.
   * @returns {Promise} an awaitable promise that will resolve when the condition of the `Where` is satisfied and the callback of the `Do` is called.
   */
  public once(): Promise<void> {
    /**
     * Once hooks using exactly the same condition as the do. It ensures to be executed after the `doCallback` because
     * Process & Stream both implements the EventEmitter class and uses it to broadcast on `on`.
     * The EventEmitter class also ensure that the listener are called in FIFO order, which is key for this to work.
     */
    return this.until(this.action.condition);
  }

  /**
   * What to do when the condition is fulfilled
   * @param callback the function to execute.
   *  It receives the process that fulfilled the condition
   *  (or the process owning the stream that fulfilled the condition).
   *  in parameter
   * @returns a promise, extended with an 'until' function.
   */
  private do(callback: DoCallback = () => {}) {
    return (resolve: () => void) => {
      const eventListener = this.addTerminalListener(
        this.action.condition,
        async (process: ChildProcessWithoutNullStreams) => {
          await callback(process);
        },
        resolve
      );

      this.exitFunction = () => {
        if (eventListener) {
          this.removeListener(eventListener);
        }
        resolve();
      };
    };
  }

  private removeListener(eventListener: EventListenerObject) {
    eventListener.target.off(eventListener.event, eventListener.listener);
  }

  private getTarget(): Readable | ChildProcessWithoutNullStreams {
    return this.action.target === 'process'
      ? this.action.process
      : this.action.process[this.action.target];
  }

  private addTerminalListener(
    condition: Condition,
    callback: (
      process: ChildProcessWithoutNullStreams,
      resolve: () => void
    ) => void,
    resolve: () => void
  ) {
    const target: Readable | ChildProcessWithoutNullStreams = this.getTarget();

    let onParams: [string, (data: Buffer) => void] | undefined;
    if (isConditionRegExp(condition)) {
      onParams = [
        'data',
        (data: Buffer) => {
          if (condition.test(stripAnsi(data.toString()).replace(/\n/g, ''))) {
            callback(this.action.process, resolve);
          }
        },
      ];
    }

    if (isConditionString(condition)) {
      onParams = [condition, () => callback(this.action.process, resolve)];
    }

    if (isConditionPromise(condition)) {
      condition.then(() => callback(this.action.process, resolve));
      return;
    }

    if (onParams) {
      target.on(...onParams);
      return {target, event: onParams[0], listener: onParams[1]};
    }

    throw new Error(
      `Terminal Action malformed:\n${JSON.stringify(this.action)}`
    );
  }
}
