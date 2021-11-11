import type {Event} from '@amplitude/types';
import {validate} from 'jsonschema';
import {APIError, APIErrorResponse} from '../../lib/errors/APIError';

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
  /**
   * TODO: CDX-660: Make sure to remove any PII from the Error object.
   *       error.message could contain data that is not allowed to be tracked for non-Trial users
   *       example: orgID, sourceID, ...
   */
  if (arg instanceof Error) {
    return arg;
  }

  if (typeof arg === 'string') {
    return new Error(arg);
  }

  const schema = {
    message: 'string',
    errorCode: 'string',
    requestID: 'string',
  };
  const isErrorFromAPI = validate(arg, schema);
  return isErrorFromAPI
    ? new APIError(arg as APIErrorResponse)
    : new Error('Unknown Error');
}

function errorIdentifier(err?: Error) {
  return {
    ...(err && {
      errorMessage: err.message,
      errorName: err.name,
    }),
  };
}
