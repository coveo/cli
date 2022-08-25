import {buildEvent} from '@coveo/cli-commons/src/analytics/eventUtils';
import {Hook} from '@oclif/core';
import {CLIError} from '@oclif/core/lib/errors';

const hook: Hook<'command_not_found'> = async function (options) {
  await this.config.runHook('analytics', {
    event: buildEvent('received error', {
      command: options.id,
      error_type: 'COMMAND NOT FOUND',
    }),
  });

  throw new CLIError(`command ${options.id} not found`);
};

export default hook;
