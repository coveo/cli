import {
  CLIBaseError,
  SeverityLevel,
} from '@coveo/cli-commons/errors/cliBaseError';

export class ProcessAbort extends CLIBaseError {
  public name = 'Operation Aborted';
  public constructor(message = 'Operation aborted') {
    super(message, {level: SeverityLevel.Info});
  }
}
