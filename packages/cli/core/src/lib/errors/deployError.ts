import {CLIBaseError} from '@coveo/cli-commons/errors/cliBaseError';
import {getPrettyJsonValidationErrors} from '@coveo/cli-commons/errors/jsonError';
import {ValidationError} from 'jsonschema';

export class DeployConfigError extends CLIBaseError {
  public name = 'Invalid Deploy Config Error';
  public constructor(filePath: string, errors: ValidationError[]) {
    super(`\nParsing: ${filePath}.${getPrettyJsonValidationErrors(errors)}`);
  }
}
