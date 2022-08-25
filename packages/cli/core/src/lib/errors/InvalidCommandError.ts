import {CLIBaseError} from './CLIBaseError';

export class InvalidCommandError extends CLIBaseError {
  public name = 'Invalid Command Error';
  public constructor(reason: string) {
    super(reason);
  }
}
