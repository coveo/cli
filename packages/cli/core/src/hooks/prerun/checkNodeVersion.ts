import {Hook} from '@oclif/core';
import {satisfies} from 'semver';
import dedent from 'ts-dedent';
const hook: Hook<'prerun'> = function (opts) {
  if (!satisfies(process.version, this.config.pjson.engines.node)) {
    this.warn(
      dedent`NodeJS ${process.version} is not supported. The Coveo CLI might malfunction.
      Please update your NodeJS installation to the latest LTS version.`
    );
  }
  return Promise.resolve();
};

export default hook;
