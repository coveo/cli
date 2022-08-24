import {PrintableError, SeverityLevel} from './printableError';

export interface PreconditionErrorOptions {
  category?: string;
  level?: SeverityLevel;
}

export class PreconditionError extends PrintableError {
  public constructor(
    public message: string,
    public options?: PreconditionErrorOptions
  ) {
    super(options?.level || SeverityLevel.Error);
    this.name = 'Precondition Error';
    if (this.options?.category) {
      this.name += ` - ${this.options?.category}`;
    }
  }
}
