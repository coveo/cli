import {CLIError} from '@oclif/core/lib/errors';
import {Chalk, red, yellow} from 'chalk';
import isUnicodeSupported from 'is-unicode-supported';
export enum SeverityLevel {
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
}

export interface CLIBaseErrorInterface {
  level?: SeverityLevel;
  cause?: Error;
}

interface OClifCLIError extends Omit<CLIError, 'render'> {}

export class CLIBaseError extends Error implements OClifCLIError {
  private static defaultSeverity: SeverityLevel = SeverityLevel.Error;
  public name = 'CLI Error';

  public constructor(
    private error?: string | Error | CLIError,
    private options?: CLIBaseErrorInterface
  ) {
    super(error instanceof Error ? error.message : error, options);
  }
  public get stack(): string {
    return super.stack || '';
  }

  code?: string | undefined;

  public get oclif() {
    return this.error instanceof CLIError ? this.error.oclif : {};
  }

  public get stack(): string {
    return super.stack || '';
  }

  public get severityLevel(): SeverityLevel {
    return this.options?.level || CLIBaseError.defaultSeverity;
  }

  public get bang() {
    let color: Chalk;

    switch (this.severityLevel) {
      case SeverityLevel.Error:
        color = red;
        break;

      case SeverityLevel.Warn:
        color = yellow;
        break;

      default:
        color = red;
        break;
    }
    return color(isUnicodeSupported() ? '›' : '»');
  }
}
