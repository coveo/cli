import {Hook} from '@coveo/cli-commons/compat/oclif';
import {flush} from '@coveo/cli-commons/analytics/amplitudeClient';

const hook: Hook<'postrun'> = function (_options: unknown) {
  flush();
  return Promise.resolve();
};

export default hook;
