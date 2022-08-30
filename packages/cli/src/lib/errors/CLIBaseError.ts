export enum SeverityLevel {
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
}

export interface CLIBaseErrorInterface {
  message?: string;
  level?: SeverityLevel;
}

export class CLIBaseError extends Error {
  private static defaultOptions: CLIBaseErrorInterface = {
    level: SeverityLevel.Error,
  };

  private options: CLIBaseErrorInterface;

  public name = 'CLI Error';

  public constructor(options?: CLIBaseErrorInterface) {
    super(options?.message);
    this.options = {...CLIBaseError.defaultOptions, ...options};
  }

  public get severityLevel(): SeverityLevel {
    return this.options.level!;
  }
}
