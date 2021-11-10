import {Hook} from '@oclif/config';
import {buildEvent} from '../../lib/decorators/preconditions/trackable';

const hook: Hook<'command_not_found'> = async function (options) {
  this.config.runHook('analytics', {
    event: buildEvent('cancelled operation', {command: options.id}),
  });

  return;
};

export default hook;
