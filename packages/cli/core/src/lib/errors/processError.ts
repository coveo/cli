import {
  PrintableError,
  SeverityLevel,
} from '@coveo/cli-commons/lib/errors/printableError';

export class ProcessAbort extends PrintableError {
  public name = 'Operation Aborted';
  public constructor(message = 'Operation aborted') {
    super(SeverityLevel.Info);
    this.message = message;
  }
}
