import type {ChildProcessWithoutNullStreams} from 'child_process';
import type {Condition} from './condition';
import type {OnTarget} from './on';

type ActionProps = Omit<Action, 'hasKeys'>;
export type ActionWith<T extends keyof ActionProps> = Action &
  Required<Pick<ActionProps, T>>;

/**
 * Data structure representing a 'When This Then Do That' on a process.
 */
export class Action {
  public condition?: Condition;
  public target?: OnTarget;

  public constructor(public process: ChildProcessWithoutNullStreams) {}

  public hasKeys<T extends keyof ActionProps>(
    ...keys: T[]
  ): this is ActionWith<T> {
    for (const key of keys) {
      if (this[key] === undefined) {
        return false;
      }
    }
    return true;
  }
}
