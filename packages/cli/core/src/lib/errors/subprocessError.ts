import {CLIBaseError} from '@coveo/cli-commons/errors/cliBaseError';

export class SubprocessError extends CLIBaseError {
  public constructor(public name: string, message: string) {
    super(message);
  }
}
