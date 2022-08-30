import {APIError, isAxiosError, isErrorFromAPI} from './APIError';

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

  public static wrap(err: unknown): CLIBaseError {
    if (typeof err === 'string') {
      return new CLIBaseError({message: err});
    }

    if (err instanceof CLIBaseError) {
      return err;
    }
    if (isAxiosError(err)) {
      return new APIError(err);
    }
    if (isErrorFromAPI(err)) {
      console.log('----> isErrorFromAPI');

      // TODO: should print the right carrets. Every error should have the default > red symbol. because oclif does not happend it by default on error objects
      // TODO: Should let the user know this is an errro from the API
      // TODO: Should print other stuff than only the message
      /**
       */
    }

    // TODO: catch objects

    // For unknown errors
    if (err instanceof Error) {
      // TODO:
      // const cliError = new CLIBaseError(err.message, err.name, undefined, err);
      // return err;
    }
    // If the original error has a code, use that instead of name.
    // if (hasString(err, 'code')) {
    //   cliError.code = err.code;
    // }
    // return cliError;
    throw err;
  }

  public get severityLevel(): SeverityLevel {
    return this.options.level!;
  }
}
