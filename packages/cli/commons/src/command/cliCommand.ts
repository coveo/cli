import {CliUx, Command} from '@oclif/core';
import {CLIBaseError, SeverityLevel} from '../errors/cliBaseError';
import {stopSpinner} from '../utils/ux';
import {wrapError} from '../errors/wrapError';
import {Trackable} from '../preconditions/trackable';

export abstract class CLICommand extends Command {
  public abstract run(): PromiseLike<any>;

  @Trackable()
  protected async catch(err?: any): Promise<CLIBaseError | never> {
    // Debug raw error
    this.debug(err);

    // Convert all other errors to CLIBaseErrors for consistency
    let error = wrapError(err);

    return this.isFatalError(error)
      ? this.handleFatalError(error)
      : this.handleNonFatalError(error);
  }

  protected async finally(err: Error | undefined) {
    try {
      stopSpinner(err);
    } catch {}

    return super.finally(err);
  }

  private isFatalError(error: CLIBaseError): boolean {
    return error.severityLevel === SeverityLevel.Error;
  }

  private handleNonFatalError(error: CLIBaseError): CLIBaseError {
    CliUx.ux.log();
    CliUx.ux[error.severityLevel]('\n' + error.message);
    return error;
  }

  private handleFatalError(error: CLIBaseError): never {
    // Let oclif handle errors
    throw error;
  }
}
