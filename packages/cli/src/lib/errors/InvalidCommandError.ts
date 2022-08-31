import {CLIBaseError} from './CLIBaseError';

export class InvalidCommandError extends CLIBaseError {
  public name = 'Invalid Command Error';
  public constructor(message: string) {
    super(message);
  }
}
