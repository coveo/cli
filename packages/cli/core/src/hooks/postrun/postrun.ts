import {Hook} from '@oclif/core';
import {flush} from '@coveo/cli-commons/lib/analytics/amplitudeClient';

const hook: Hook<'postrun'> = async function (_options) {
  await flush();
};

export default hook;
