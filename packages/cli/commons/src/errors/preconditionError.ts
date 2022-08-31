import {CLIBaseError, SeverityLevel} from './CLIBaseError';

export interface PreconditionErrorOptions {
  category?: string;
  level?: SeverityLevel;
}

export class PreconditionError extends CLIBaseError {
  public constructor(message: string, options?: PreconditionErrorOptions) {
    super(message, options);
    this.name = 'Precondition Error';
    if (options?.category) {
      this.name += ` - ${options?.category}`;
    }
  }
}
