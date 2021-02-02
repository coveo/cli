/* eslint-disable @typescript-eslint/no-namespace */
import {Hook, IConfig} from '@oclif/config';

declare global {
  namespace NodeJS {
    interface Global {
      config: IConfig;
    }
  }
}

const hook: Hook<'init'> = async function (opts) {
  global.config = opts.config;
};

export default hook;
