import {CLIBaseError} from './CLIBaseError';

export class InvalidProjectError extends CLIBaseError {
  public name = 'Invalid Project Error';
  public constructor(path: string, reason: string) {
    super(`${path} is not a valid project: ${reason}`);
  }
}
