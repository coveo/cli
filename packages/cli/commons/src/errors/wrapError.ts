import {APIError, isAxiosError, isErrorFromAPI} from './apiError';
import {CLIBaseError} from './cliBaseError';
import {UnknownError} from './unknownError';

export function wrapError(err: unknown): CLIBaseError {
  if (typeof err === 'string') {
    return new CLIBaseError(err);
  }

  if (isAxiosError(err) || isErrorFromAPI(err)) {
    return new APIError(err);
  }

  if (err instanceof CLIBaseError) {
    return err;
  }

  if (err instanceof Error) {
    return new CLIBaseError(err);
  }

  return new UnknownError(err);
}
