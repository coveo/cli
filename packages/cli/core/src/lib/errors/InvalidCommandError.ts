import {CLIBaseError} from '@coveo/cli-commons/lib/errors/cliBaseError';

export class InvalidCommandError extends CLIBaseError {
  public name = 'Invalid Command Error';
  public constructor(reason: string) {
    super(reason);
  }
}
