import type Command from '@oclif/command';
import {buildError, buildEvent} from '../../../hooks/analytics/eventUtils';

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
