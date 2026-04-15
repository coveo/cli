import {Hook} from '@coveo/cli-commons/compat/oclif';
import {satisfies} from 'semver';
import dedent from 'ts-dedent';
const hook: Hook<'prerun'> = function (this: {
  config: {pjson: {engines: {node: string}}};
  warn: (message: string) => void;
}) {
  if (!satisfies(process.version, this.config.pjson.engines.node)) {
    this.warn(
      dedent`NodeJS ${process.version} is not supported. The Coveo CLI might malfunction.
      Please update your NodeJS installation to the latest LTS version.`
    );
  }
  return Promise.resolve();
};

export default hook;
