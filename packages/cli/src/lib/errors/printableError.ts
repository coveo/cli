import {cli} from 'cli-ux';

export enum SeverityLevel {
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
}

export class PrintableError extends Error {
  public constructor(public level: SeverityLevel) {
    super();
  }

  public print() {
    cli.log();
    cli[this.level]('\n' + this.message);
  }
}
