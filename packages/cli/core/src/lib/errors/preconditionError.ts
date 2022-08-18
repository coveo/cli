import {PrintableError, SeverityLevel} from './printableError';

export enum PreconditionErrorCategory {
  MissingBin = 'Missing Bin',
  InvalidBinInstallation = 'Invalid Bin installation',
  InvalidBinVersionRange = 'Invalid Bin Range',
  MissingPlatformPrivilege = 'Missing Platform Privilege',
  Authentication = 'Authentication',
}

export interface PreconditionErrorOptions {
  category?: PreconditionErrorCategory;
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
