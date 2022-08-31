import {CLIBaseError, SeverityLevel} from './CLIBaseError';

export class UnknownError extends CLIBaseError {
  public name = 'Unknown CLI Error';
  public constructor(e?: unknown) {
    super();
    const error = typeof e === 'string' ? new Error(e) : e;
    if (error && error instanceof Error) {
      this.message = error.message;
      // this.stack = error.stack; // TODO: address this issue
      this.name = `Unknown CLI Error - ${error.name}`;
    }
  }
}
