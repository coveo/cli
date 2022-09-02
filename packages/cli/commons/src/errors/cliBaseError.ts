import {CLIError} from '@oclif/core/lib/errors';
import {Chalk, red, yellow, cyan} from 'chalk';

export enum SeverityLevel {
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
}

export interface CLIBaseErrorInterface {
  level?: SeverityLevel;
  cause?: Error;
}

export class CLIBaseError extends Error {
  private static defaultSeverity: SeverityLevel = SeverityLevel.Error;
  public name = 'CLI Error';

  public constructor(
    private error?: string | Error | CLIError,
    private options?: CLIBaseErrorInterface
  ) {
    super(error instanceof Error ? error.message : error, options);
  }

  public get oclif() {
    return this.error instanceof CLIError ? this.error.oclif : {};
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

      case SeverityLevel.Info:
        color = cyan;
        break;

      default:
        color = red;
        break;
    }
    return color(process.platform === 'win32' ? '»' : '›');
  }
}
