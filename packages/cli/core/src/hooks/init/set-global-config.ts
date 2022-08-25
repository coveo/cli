import {handleTerminationSignals} from './termination-signals';
import {Hook} from '@oclif/core';
import globalConfig from '@coveo/cli-commons/src/config/globalConfig';

const hook: Hook<'init'> = async function (opts) {
  handleTerminationSignals();
  globalConfig.set(opts.config);
  process.env[this.config.scopedEnvVarKey('UPDATE_INSTRUCTIONS')] =
    'Use "npm update --global @coveo/cli" to update your npm-based CLI installation.';
};

export default hook;
