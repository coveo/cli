import type Command from '@oclif/command';
import {flush} from '../../../hooks/analytics/analytics';
import {buildError, buildEvent} from '../../../hooks/analytics/eventUtils';

export interface TrackableOptions {
  /**
   * Event name used to identify the command.
   * The expression should go as follows: **(Subject) [Process]?**
   *
   * Ex.: *auth login token*
   * - *auth login* is the **Subject**
   * - *token* is the **Process**
   *
   * If omited, the Command ID will be used to identify all events fired from that same command.
   * For long commands, we recommend populating this value to keep analytic events consistent.
   *
   * Visit https://coveord.atlassian.net/wiki/spaces/RD/pages/2855141440/New+Taxonomy+Definition for more info
   */
  eventName?: string;
  /**
   * Additional properties to be added to all events fired for a particular command.
   */
  overrideEventProperties?: Record<string, unknown>;
}

export function Trackable({
  eventName,
  overrideEventProperties,
}: TrackableOptions = {}) {
  return function (
    _target: Command,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<() => Promise<void>>
  ) {
    const originalCommand = descriptor.value!;
    descriptor.value = async function (this: Command, ...cmdArgs: unknown[]) {
      const name = eventName || getEventName(this);
      const properties = {
        ...overrideEventProperties,
        command: this.id,
      };

      if (cmdArgs.length > 0) {
        await trackError.call(this, properties, originalCommand, cmdArgs);
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
  properties: Record<string, unknown>,
  originalCatchCommand: (...args: unknown[]) => Promise<void>,
  args: unknown[]
) {
  for (let i = 0; i < args.length; i++) {
    await this.config.runHook('analytics', {
      event: buildEvent('received error', properties, buildError(args[i])),
    });
  }

  await flush();
  await originalCatchCommand.apply(this, args);
}

function getEventName(target: Command) {
  return target.id!.replace(/:/g, ' ');
}
