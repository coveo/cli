import {CliUx} from '@oclif/core';
import {CLIBaseError} from './CLIBaseError';

export enum SeverityLevel {
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
}

export class PrintableError extends CLIBaseError {
  public constructor(public level: SeverityLevel) {
    super();
  }

  public print() {
    CliUx.ux.log();
    CliUx.ux[this.level]('\n' + this.message);
  }
}
