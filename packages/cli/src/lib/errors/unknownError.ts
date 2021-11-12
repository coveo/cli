import {CLIBaseError} from './CLIBaseError';

export class UnknownError extends CLIBaseError {
  public name = 'Unknown CLI Error';
  public constructor() {
    super();
  }
}
