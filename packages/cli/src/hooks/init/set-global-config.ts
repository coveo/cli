import {handleTerminationSignals} from './termination-signals.js';
import {Hook} from '@oclif/core';
import globalConfig from '../../lib/config/globalConfig.js';

const hook: Hook<'init'> = async function (opts) {
  handleTerminationSignals();
  globalConfig.set(opts.config);
  process.env[this.config.scopedEnvVarKey('UPDATE_INSTRUCTIONS')] =
    'Use "npm update --global @coveo/cli" to update your npm-based CLI installation.';
};

export default hook;
