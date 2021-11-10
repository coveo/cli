import type {Event} from '@amplitude/types';
import type Command from '@oclif/command';
import {validate} from 'jsonschema';
import {APIError, APIErrorResponse} from '../../errors/APIError';

export function Trackable(overrideEventProperties?: Record<string, unknown>) {
  return function (
    target: Command,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<() => Promise<void>>
  ) {
    const originalCommand = descriptor.value!;
    descriptor.value = async function (this: Command, ...cmdArgs: unknown[]) {
      const name = getEventName(this);
      const {flags, args} = this.parse(target.ctor);
      const properties = {
        args,
        ...flags,
        ...overrideEventProperties,
        command: this.id,
      };

      if (cmdArgs.length > 0) {
        await trackError.call(this, name, properties, originalCommand, cmdArgs);
      } else {
        await trackCommand.call(this, name, properties, originalCommand);
      }
    };
  };
}

async function trackCommand(
  this: Command,
  eventName: string,
  properties: Record<string, unknown>,
  originalRunCommand: () => Promise<void>
) {
  this.config.runHook('analytics', {
    event: buildEvent(`started ${eventName}`, properties),
  });

  await originalRunCommand.apply(this);

  this.config.runHook('analytics', {
    event: buildEvent(`completed ${eventName}`, properties),
  });
}

async function trackError(
  this: Command,
  eventName: string,
  properties: Record<string, unknown>,
  originalCatchCommand: (...args: unknown[]) => Promise<void>,
  args: unknown[]
) {
  args.forEach((arg) => {
    this.config.runHook('analytics', {
      event: buildEvent(`failed ${eventName}`, properties, buildError(arg)),
    });
  });

  await originalCatchCommand.apply(this, args);
}

function getEventName(target: Command) {
  // TODO: CDX-648: Clean event name
  // return (target.ctor.title || target.id)!.replace(/:/g, ' ');
  return target.id!.replace(/:/g, ' ');
}

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

function buildError(arg: unknown) {
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
