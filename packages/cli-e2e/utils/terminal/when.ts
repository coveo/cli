import type {Condition} from './condition';
import type {Action, ActionWith} from './action';

import {On, OnTarget} from './on';

/**
 * Represent the 'When' of the 'When This Do That'
 */
export class When {
  private action: ActionWith<'condition'>;
  public constructor(action: Action, condition: Condition) {
    action.condition = condition;
    if (action.hasKeys<'condition'>('condition')) {
      this.action = action;
      return;
    }
    throw 'When "condition" invalid.';
  }
  public on(stream: OnTarget) {
    return new On(this.action, stream);
  }
}
