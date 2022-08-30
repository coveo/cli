import type {Event} from '@amplitude/types';
import {CLIBaseError} from '../../lib/errors/CLIBaseError';

export function buildEvent(
  eventName: string,
  properties: Record<string, unknown>,
  err?: CLIBaseError
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

function errorIdentifier(err?: Error) {
  return {
    ...(err && {
      error_type: err.name,
    }),
  };
}
