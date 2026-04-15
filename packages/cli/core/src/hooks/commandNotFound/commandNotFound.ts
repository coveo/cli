import {buildEvent} from '@coveo/cli-commons/analytics/eventUtils';
import {Errors, Hook} from '@coveo/cli-commons/compat/oclif';

const hook: Hook<'command_not_found'> = async function (
  this: {config: {runHook: (id: string, payload: unknown) => Promise<void>}},
  options: {id: string}
) {
  await this.config.runHook('analytics', {
    event: buildEvent('received error', {
      command: options.id,
      error_type: 'COMMAND NOT FOUND',
    }),
  });

  throw new Errors.CLIError(`command ${options.id} not found`);
};

export default hook;
