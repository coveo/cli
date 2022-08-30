import {APIError, isAxiosError, isErrorFromAPI} from './APIError';
import {CLIBaseError} from './CLIBaseError';
import {UnknownError} from './unknownError';

export function wrapError(err: unknown): CLIBaseError {
  if (typeof err === 'string') {
    return new CLIBaseError({message: err});
  }

  if (err instanceof CLIBaseError) {
    return err;
  }

  if (err instanceof Error) {
    return new CLIBaseError(err);
  }

  if (isAxiosError(err) || isErrorFromAPI(err)) {
    return new APIError(err);
  }

  return new UnknownError(err);
}
