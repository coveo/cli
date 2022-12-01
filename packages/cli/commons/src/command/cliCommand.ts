import {Command} from '@oclif/core';
import {CLIBaseError} from '../errors/cliBaseError';
import {stopSpinner} from '../utils/ux';
import {wrapError} from '../errors/wrapError';
import {Trackable} from '../preconditions/trackable';

/**
 * A base command to standadize error handling, analytic tracking and logging.
 *
 * @class CLICommand
 * @extends {Command}
 */
export abstract class CLICommand extends Command {
  public abstract run(): PromiseLike<any>;

  /**
   * If you extend or overwrite the catch method in your command class, make sure it returns `return super.catch(err)`
   *
   * @param {*} [err]
   * @see [Oclif Error Handling](https://oclif.io/docs/error_handling)
   */
  @Trackable()
  protected async catch(err?: any): Promise<CLIBaseError | never> {
    // Debug raw error
    this.debug(err);

    // Convert all other errors to CLIBaseErrors for consistency
    const error = wrapError(err);

    // Let oclif handle errors
    throw error;
  }

  protected async finally(arg?: unknown) {
    let error: CLIBaseError | undefined;
    if (arg) {
      error = wrapError(arg);
    }

    try {
      stopSpinner({success: error === undefined});
    } catch {}

    return super.finally(error);
  }

  public get identifier(): string {
    return this.ctor.id;
  }
}
