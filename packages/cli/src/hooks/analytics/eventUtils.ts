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

export function buildError(arg: unknown) {
  const isErrorFromAPI = validate(arg, APIErrorSchema).valid;
  const isCLIBaseError = arg instanceof CLIBaseError;

  if (isErrorFromAPI) {
    return new APIError(arg as APIErrorResponse);
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
