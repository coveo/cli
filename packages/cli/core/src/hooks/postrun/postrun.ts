import {Hook} from '@oclif/core';
import {flush} from '@coveo/cli-commons/analytics/amplitudeClient';

const hook: Hook<'postrun'> = function (_options) {
  flush();
  return Promise.resolve();
};

export default hook;
