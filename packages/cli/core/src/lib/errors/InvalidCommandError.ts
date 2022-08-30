import {CLIBaseError} from '@coveo/cli-commons/src/errors/cliBaseError';

export class InvalidCommandError extends CLIBaseError {
  public name = 'Invalid Command Error';
  public constructor(reason: string) {
    super(reason);
  }
}
