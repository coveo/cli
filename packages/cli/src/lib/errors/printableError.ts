import {cli} from 'cli-ux';
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
    cli.log();
    cli[this.level]('\n' + this.message);
  }
}
