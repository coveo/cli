import {CLIBaseError, SeverityLevel} from './CLIBaseError';

export class ProcessAbort extends CLIBaseError {
  public name = 'Operation Aborted';
  public constructor(message = 'Operation aborted') {
    super({level: SeverityLevel.Info});
    this.message = message;
  }
}
