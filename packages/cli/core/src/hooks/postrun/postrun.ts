import {Hook} from '@oclif/core';
import {flush} from '@coveo/cli-commons/analytics/amplitudeClient';

const hook: Hook<'postrun'> = async function (_options) {
  flush();
};

export default hook;
