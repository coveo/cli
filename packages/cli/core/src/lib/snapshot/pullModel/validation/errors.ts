import {ValidationError} from 'jsonschema';
import {CLIBaseError} from '@coveo/cli-commons/errors/cliBaseError';
import {getPrettyJsonValidationErrors} from '@coveo/cli-commons/errors/jsonError';

abstract class BaseSPMError extends CLIBaseError {
  public name = 'Snapshot Pull Model Error';
  private static messageSuffix =
    '\nThis is probably a problem with the Coveo CLI, please report this issue at https://github.com/coveo/cli/issues';
  public constructor(message: string, shouldContactCoveo: boolean) {
    super(`${message}${shouldContactCoveo ? BaseSPMError.messageSuffix : ''}`);
  }
}

export class UnknownSPMValidationError extends BaseSPMError {
  public name = 'Unknown Snapshot Pull Model Error';
  public constructor(shouldContactCoveo: boolean) {
    super(
      "An unknown error occured while validating the custom template. Try recreating it from 'empty' or 'full'.",
      shouldContactCoveo
    );
  }
}

export class InvalidSPMError extends BaseSPMError {
  public name = 'Invalid Snapshot Pull Model Error';
  public constructor(shouldContactCoveo: boolean, errors: ValidationError[]) {
    super(getPrettyJsonValidationErrors(errors), shouldContactCoveo);
  }
}
