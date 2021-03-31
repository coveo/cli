import {IConfig} from '@oclif/config';

export declare global {
  namespace NodeJS {
    interface Global {
      config: IConfig;
    }
  }
}
