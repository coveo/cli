import {Hook} from '@oclif/config';

const hook: Hook<'init'> = async function (opts) {
  global.config = opts.config;
  process.env[this.config.scopedEnvVarKey('UPDATE_INSTRUCTIONS')] =
    'Use "npm update --global @coveo/cli" to update npm-based installations.';
};

export default hook;
