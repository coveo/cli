import {PrintableError, SeverityLevel} from './printableError';

export enum PreconditionErrorCategory {
  MissingBin = 'Missing Bin',
  InvalidBinInstallation = 'Invalid Bin installation',
  InvalidBinVersionRange = 'Invalid Bin Range',
  MissingPlatformPrivilege = 'Missing Platform Privilege',
  Authentication = 'Authentication',
}

export class PreconditionError extends PrintableError {
  public constructor(
    public message: string,
    public category?: PreconditionErrorCategory
  ) {
    super(SeverityLevel.Warn);
    this.name = 'Precondition Error';
    if (this.category) {
      this.name += ` - ${this.category}`;
    }
  }
}
