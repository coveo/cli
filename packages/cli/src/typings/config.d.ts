// See https://stackoverflow.com/questions/68322578/recent-updated-version-of-types-node-is-creating-an-error-the-previous-versi
/* eslint-disable no-var */

import {IConfig} from '@oclif/config';
export declare global {
  var config: IConfig;
}
