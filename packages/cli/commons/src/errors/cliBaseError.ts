import {CLIError} from '@oclif/core/lib/errors';
import {Chalk, red, yellow} from 'chalk';

export enum SeverityLevel {
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
}

export interface CLIBaseErrorInterface {
  level?: SeverityLevel;
  cause?: Error;
}

interface OClifCLIError extends Omit<CLIError, 'render' | 'bang' | 'oclif'> {}

export class CLIBaseError extends Error implements OClifCLIError {
  private static readonly defaultSeverity: SeverityLevel = SeverityLevel.Error;
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

  public get severityLevel(): SeverityLevel {
    return this.options?.level || CLIBaseError.defaultSeverity;
  }

  /**
   * Specific to internal oclif error handling
   */
  private get oclif() {
    return this.error instanceof CLIError ? this.error.oclif : {};
  }

  /**
   * Used by oclif to pretty print the error
   */
  private get bang() {
    let color: Chalk;

    switch (this.severityLevel) {
      case SeverityLevel.Warn:
        color = yellow;
        break;

      case SeverityLevel.Error:
      default:
        color = red;
        break;
    }
    return color('»');
  }
}
