import type {ActionWith} from './action';

import {Do, DoCallback} from './do';

export type OnTarget = 'stdout' | 'stderr' | 'process';

/**
 * Specialize the 'When' with a target: a stream of the process, or the process itself.
 * Also contains the logic for the compilation of the action and its 'hooking'
 */
export class On {
  private action: ActionWith<'condition' | 'target'>;
  public constructor(action: ActionWith<'condition'>, target: OnTarget) {
    action.target = target;
    if (action.hasKeys<'condition' | 'target'>('condition', 'target')) {
      this.action = action;
      return;
    } else {
      throw 'On "target" invalid.';
    }
  }

  public do(doCallback: DoCallback = () => {}) {
    return new Do(this.action, doCallback);
  }
}
