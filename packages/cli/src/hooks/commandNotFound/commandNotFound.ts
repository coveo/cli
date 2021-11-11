import {Hook} from '@oclif/config';
import {buildEvent} from '../../lib/decorators/preconditions/trackable';

const hook: Hook<'command_not_found'> = async function (options) {
  this.config.runHook('analytics', {
    event: buildEvent('invalid command', {command: options.id}),
  });
};

export default hook;
