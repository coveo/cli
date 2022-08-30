import {CLIBaseError, SeverityLevel} from './CLIBaseError';

export class UnknownError extends CLIBaseError {
  public name = 'Unknown CLI Error';
  public constructor(e?: unknown) {
    super({level: SeverityLevel.Error});
    const error = typeof e === 'string' ? new Error(e) : e;
    if (error && error instanceof Error) {
      this.message = error.message;
      this.stack = error.stack;
      this.name = `Unknown CLI Error - ${error.name}`;
    }
  }
}
