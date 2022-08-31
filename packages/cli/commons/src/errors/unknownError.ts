import {CLIBaseError} from '@coveo/cli-commons/src/errors/cliBaseError';

export class UnknownError extends CLIBaseError {
  public name = 'Unknown CLI Error';
  public constructor(e?: unknown) {
    super(
      e instanceof Error
        ? {...e, name: `${UnknownError.name} - ${e.name}`}
        : undefined
    );
  }
}
