import {CLIBaseError} from './cliBaseError';
import {dedent} from 'ts-dedent';

export class InternalError extends CLIBaseError {
  public name = 'Internal CLI Error';
  public constructor(message: string) {
    super();
    this.message = dedent`
      Internal CLI Error, please report to Coveo
      
      Message:
        ${message}`;
  }
}
