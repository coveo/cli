import type Command from '@oclif/command';
import {flush} from '../../../hooks/analytics/analytics';
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
  await this.config.runHook('analytics', {
    event: buildEvent(`started ${eventName}`, properties),
    identify: true,
  });

  await originalRunCommand.apply(this);

  await this.config.runHook('analytics', {
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
  for (let i = 0; i < args.length; i++) {
    await this.config.runHook('analytics', {
      event: buildEvent(`failed ${eventName}`, properties, buildError(args[i])),
    });
  }

  await flush();
  await originalCatchCommand.apply(this, args);
}

function getEventName(target: Command) {
  // TODO: CDX-648: Clean event name
  // return (target.ctor.title || target.id)!.replace(/:/g, ' ');
  return target.id!.replace(/:/g, ' ');
}
