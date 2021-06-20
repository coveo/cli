import type {ChildProcessWithoutNullStreams} from 'child_process';
import type {Condition} from './condition';
import {Action} from './action';
import {When} from './when';

/**
 * ToDo: The Orchestrator is a shell for now. It'll handle the sequential and parallel aspect of the actions in the future
 * e.g. When This Do That, But Also When This2 Do That2, And When That and That2 happened, do That3.
 * This is subject to change in the future, but should not impact the Terminal API.
 */

/**
 * Orchestrate the Actions attached to a process.
 */
export class Orchestrator {
  public actions: Action[];
  public constructor(public process: ChildProcessWithoutNullStreams) {
    this.actions = new Array<Action>();
  }
  public getNewHandle() {
    return new Entrypoint(this);
  }
}

class Entrypoint {
  public constructor(private orchestrator: Orchestrator) {}

  public when(conditionOrCallback: Condition): When {
    const action = new Action(this.orchestrator.process);
    this.orchestrator.actions.push(action);
    return new When(action, conditionOrCallback);
  }
}
