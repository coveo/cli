import {Command} from '@oclif/core';
import {flush} from '../analytics/amplitudeClient';
import {buildEvent} from '../analytics/eventUtils';
import {CLIBaseError} from '../errors/cliBaseError';
import {wrapError} from '../errors/wrapError';

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

type CommandReturn = any;
/**
 *
 * TODO: explain what it does
 *
 * @param {TrackableOptions} [{
 *   eventName,
 *   overrideEventProperties,
 * }={}]
 *
 * @description
 * Make sure to return `return super.catch(err);` if you overwrite the catch methode from the base command
 *
 */
export function Trackable({
  eventName,
  overrideEventProperties,
}: TrackableOptions = {}) {
  return function (
    _target: Command,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<() => Promise<any>>
  ) {
    const originalCommand = descriptor.value!;
    descriptor.value = async function (this: Command, ...cmdArgs: unknown[]) {
      const name = eventName || getEventName(this);
      const properties = {
        ...overrideEventProperties,
        command: this.id,
      };

      if (cmdArgs.length > 0) {
        return trackError.call(this, properties, originalCommand, cmdArgs);
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
  originalCatchCommand: (...args: unknown[]) => Promise<CLIBaseError>,
  args: unknown[]
): Promise<CLIBaseError> {
  for (const arg of args) {
    await this.config.runHook('analytics', {
      event: buildEvent('received error', properties, wrapError(arg)),
    });
  }

  await flush();
  return originalCatchCommand.apply(this, args);
}

function getEventName(target: Command): string {
  return target.id?.replace(/:/g, ' ') || '';
}

// TODO: verify that errors are being tracked
// TODO: verify that errors are being tracked
// TODO: verify that errors are being tracked
// TODO: verify that errors are being tracked
// TODO: verify that errors are being tracked
// TODO: verify that errors are being tracked
