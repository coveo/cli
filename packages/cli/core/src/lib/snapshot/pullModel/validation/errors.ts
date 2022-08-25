import {ValidationError} from 'jsonschema';
import {CLIBaseError} from '../../../errors/CLIBaseError';

abstract class BaseSPMError extends CLIBaseError {
  public name = 'Snapshot Pull Model Error';
  private static messageSuffix =
    '\nThis is probably a problem with the Coveo CLI, please report this issue at https://github.com/coveo/cli/issues';
  private messageSuffix: string;
  protected abstract messageBody: string;
  public override get message(): string {
    return `${this.messageBody}${this.messageSuffix}`;
  }
  public constructor(shouldContactCoveo: boolean) {
    super();
    this.messageSuffix = shouldContactCoveo ? BaseSPMError.messageSuffix : '';
  }
}

export class UnknownSPMValidationError extends BaseSPMError {
  public name = 'Unknown Snapshot Pull Model Error';
  protected messageBody: string;
  public constructor(shouldContactCoveo: boolean) {
    super(shouldContactCoveo);
    this.messageBody =
      "An unknown error occured while validating the custom template. Try recreating it from 'empty' or 'full'.";
  }
}

export class InvalidSPMError extends BaseSPMError {
  public name = 'Invalid Snapshot Pull Model Error';
  protected messageBody: string;
  public constructor(shouldContactCoveo: boolean, errors: ValidationError[]) {
    super(shouldContactCoveo);
    this.messageBody = this.getPrettyValidationErrors(errors);
  }
  private getPrettyValidationErrors(errors: ValidationError[]): string {
    const stackToPrettyError = (stack: string) =>
      ` - ${stack.replace(/^instance\./, '')}\n`;
    return errors
      .reduce<string>(
        (errors, error) => (errors += stackToPrettyError(error.stack)),
        '\n'
      )
      .replace(/\n$/, '');
  }
}
