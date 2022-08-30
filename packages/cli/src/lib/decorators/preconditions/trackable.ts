import {Command} from '@oclif/core';
import {flush} from '../../../hooks/analytics/analytics';
import {buildError, buildEvent} from '../../../hooks/analytics/eventUtils';
import {CLIBaseError} from '../../errors/CLIBaseError';

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

type CommandReturn = Awaited<ReturnType<Command['run']>> | CLIBaseError;
export function Trackable<T = CommandReturn>({
  eventName,
  overrideEventProperties,
}: TrackableOptions = {}) {
  return function (
    _target: Command,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<() => Promise<T>>
  ) {
    const originalCommand = descriptor.value!;
    descriptor.value = async function (this: Command, ...cmdArgs: unknown[]) {
      const name = eventName || getEventName(this);
      const properties = {
        ...overrideEventProperties,
        command: this.id,
      };

      if (cmdArgs.length > 0) {
        // TODO: not sure we should return here
        await trackError.call(this, properties, originalCommand, cmdArgs);
      } else {
        return trackCommand.call(this, name, properties, originalCommand);
      }
    };
  };
}

async function trackCommand(
  this: Command,
  eventName: string,
  properties: Record<string, unknown>,
  originalRunCommand: CommandReturn
) {
  await this.config.runHook('analytics', {
    event: buildEvent(`started ${eventName}`, properties),
    identify: true,
  });

  const commandResult: CommandReturn = await originalRunCommand.apply(this);

  await this.config.runHook('analytics', {
    event: buildEvent(`completed ${eventName}`, properties),
  });

  return commandResult;
}

async function trackError(
  this: Command,
  properties: Record<string, unknown>,
  originalCatchCommand: (...args: unknown[]) => CommandReturn,
  args: unknown[]
) {
  for (const arg of args) {
    await this.config.runHook('analytics', {
      event: buildEvent('received error', properties, buildError(arg)),
    });
  }

  await flush();
  return originalCatchCommand.apply(this, args);
}

function getEventName(target: Command): string {
  return target.id?.replace(/:/g, ' ') || '';
}
