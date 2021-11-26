import {Hook} from '@oclif/core';
import {buildEvent} from '../analytics/eventUtils';

const hook: Hook<'command_not_found'> = async function (options) {
  await this.config.runHook('analytics', {
    event: buildEvent('received error', {
      command: options.id,
      error_type: 'COMMAND NOT FOUND',
    }),
  });
};

export default hook;
