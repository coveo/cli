import type {Event} from '@amplitude/types';
import {validate} from 'jsonschema';
import {
  APIError,
  APIErrorResponse,
  APIErrorSchema,
} from '../../lib/errors/APIError';
import {CLIBaseError} from '../../lib/errors/CLIBaseError';
import {UnknownError} from '../../lib/errors/unknownError';

export function buildEvent(
  eventName: string,
  properties: Record<string, unknown>,
  err?: Error
): Event {
  const analyticsData = {
    event_type: eventName,
    event_properties: {
      ...properties,
      ...errorIdentifier(err),
    },
  };

  return analyticsData;
}

function isErrorFromAPI(arg: unknown): arg is APIErrorResponse {
  try {
    return validate(arg, APIErrorSchema).valid;
  } catch (error) {
    return false;
  }
}

export function buildError(arg: unknown) {
  const isCLIBaseError = arg instanceof CLIBaseError;

  if (isErrorFromAPI(arg)) {
    return new APIError(arg);
  } else if (isCLIBaseError) {
    return arg;
  } else {
    return new UnknownError();
  }
}

function errorIdentifier(err?: Error) {
  return {
    ...(err && {
      error_type: err.name,
    }),
  };
}
