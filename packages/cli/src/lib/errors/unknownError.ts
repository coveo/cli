import {PrintableError, SeverityLevel} from './printableError';

export class UnknownError extends PrintableError {
  public name = 'Unknown CLI Error';
  public constructor(error?: Error) {
    super(SeverityLevel.Error);
    if (error) {
      this.message = error.message;
      this.stack = error.stack;
      this.name = `Unknown CLI Error - ${error.name}`;
    }
  }
}
