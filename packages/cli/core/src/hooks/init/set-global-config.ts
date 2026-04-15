import {handleTerminationSignals} from './termination-signals';
import {Hook, Interfaces} from '@coveo/cli-commons/compat/oclif';
import globalConfig from '@coveo/cli-commons/config/globalConfig';

const hook: Hook<'init'> = function (
  this: {config: {scopedEnvVarKey: (name: string) => string}},
  opts: {config: Interfaces.Config}
) {
  handleTerminationSignals();
  globalConfig.set(opts.config);
  process.env[this.config.scopedEnvVarKey('UPDATE_INSTRUCTIONS')] =
    'Use "npm update --global @coveo/cli" to update your npm-based CLI installation.';
  return Promise.resolve();
};

export default hook;
