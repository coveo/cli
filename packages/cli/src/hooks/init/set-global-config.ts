import {handleTerminationSignals} from './termination-signals';
import {Hook} from '@oclif/core';

const hook: Hook<'init'> = async function (opts) {
  handleTerminationSignals();
  global.config = opts.config;
  process.env[this.config.scopedEnvVarKey('UPDATE_INSTRUCTIONS')] =
    'Use "npm update --global @coveo/cli" to update your npm-based CLI installation.';
};

export default hook;
