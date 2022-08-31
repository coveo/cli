import {CLIBaseError, SeverityLevel} from './CLIBaseError';

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

export class PreconditionError extends CLIBaseError {
  public constructor(message: string, options?: PreconditionErrorOptions) {
    super(message, options);
    this.name = 'Precondition Error';
    if (options?.category) {
      this.name += ` - ${options?.category}`;
    }
  }
}
