import {Hook} from '@oclif/config';
import {flush} from '../analytics/analytics';

const hook: Hook<'postrun'> = async function (_options) {
  await flush();
};

export default hook;
