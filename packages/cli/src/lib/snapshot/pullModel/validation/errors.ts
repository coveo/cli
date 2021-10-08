import {ValidationError} from 'jsonschema';

export abstract class BaseSPMError extends Error {
  private static messageSuffix =
    'This is probably a problem with the Coveo CLI, please report this issue at https://github.com/coveo/cli/issues';
  private messageSuffix: string;
  protected abstract messageBody: string;
  public get message(): string {
    return `${this.messageBody}\n${this.messageSuffix}`;
  }
  public constructor(shouldContactCoveo: boolean) {
    super(
      "An unknown error occured while validating the custom template. Try recreating it from 'empty' or 'full'."
    );
    this.messageSuffix = shouldContactCoveo ? BaseSPMError.messageSuffix : '';
  }
}

export class UnknownSPMValidationError extends BaseSPMError {
  protected messageBody: string;
  public constructor(shouldContactCoveo: boolean) {
    super(shouldContactCoveo);
    this.messageBody =
      "An unknown error occured while validating the custom template. Try recreating it from 'empty' or 'full'";
  }
}

export class InvalidSPMError extends BaseSPMError {
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
