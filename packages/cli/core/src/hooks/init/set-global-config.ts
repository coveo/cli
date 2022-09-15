import {handleTerminationSignals} from './termination-signals';
import {Hook} from '@oclif/core';
import globalConfig from '@coveo/cli-commons/config/globalConfig';

const hook: Hook<'init'> = function (opts) {
  handleTerminationSignals();
  globalConfig.set(opts.config);
  process.env[this.config.scopedEnvVarKey('UPDATE_INSTRUCTIONS')] =
    'Use "npm update --global @coveo/cli" to update your npm-based CLI installation.';
};

export default hook;
