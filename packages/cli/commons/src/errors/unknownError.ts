import {PrintableError, SeverityLevel} from './printableError';

export class UnknownError extends PrintableError {
  public name = 'Unknown CLI Error';
  public constructor(e?: unknown) {
    super(SeverityLevel.Error);
    const error = typeof e === 'string' ? new Error(e) : e;
    if (error && error instanceof Error) {
      this.message = error.message;
      this.stack = error.stack;
      this.name = `Unknown CLI Error - ${error.name}`;
    }
  }
}
