import {CLIBaseError, SeverityLevel} from './cliBaseError';
import dedent from 'ts-dedent';

export class InvalidCommandError extends CLIBaseError {
  public name = 'Invalid CLI Command';
  public constructor(cause: string) {
    super('', {level: SeverityLevel.Error});
    this.message = dedent`
      An error has been found in the CLI, please report this error to Coveo.
      
      Cause:
      ${this.cause}

      Stack:
      ${this.stack}
      `;
  }
}
