import {bold} from 'chalk';
import {APIError, isAxiosError, isErrorFromAPI} from './APIError';
import {CLIBaseError} from './CLIBaseError';
import {UnknownError} from './unknownError';

export function wrapError(err: unknown): CLIBaseError {
  if (typeof err === 'string') {
    return new CLIBaseError(err);
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

export function prettyPrintError(err: CLIBaseError): CLIBaseError {
  // const name = bold(err.name);
  const name = err.name;
  const message = ['', err.message.replace(/^\n/, '')].join('\n');

  const error = new CLIBaseError(message, {
    cause: err.cause,
    level: err.severityLevel,
  });
  error.name = name;

  return error;
}
