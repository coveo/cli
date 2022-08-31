import {CLIBaseError} from '@coveo/cli-commons/src/errors/cliBaseError';

export class InvalidCommandError extends CLIBaseError {
  public name = 'Invalid Command Error';
  public constructor(message: string) {
    super(message);
  }
}
