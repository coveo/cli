import {constants} from 'os';
import * as dedent from 'dedent';

import type Command from '@oclif/command';
import {valid as isVersionValid, lt as isVersionLessThan} from 'semver';

import {SpawnProcessOutput, spawnProcessOutput} from '../../utils/process';

const linkToReadme =
  'https://github.com/coveo/cli/wiki/Node.js,-NPM-and-NPX-requirements';

export function IsNodeVersionAbove(requiredVersion: string) {
  return async function (target: Command) {
    if (!isVersionValid(requiredVersion)) {
      target.warn(dedent`
        Required version invalid: "${requiredVersion}".
        Please report this error to Coveo: https://github.com/coveo/cli/issues/new
      `);
      return false;
    }

    const output = await spawnProcessOutput('node', ['--version']);

    if (isMissingExecutable(output)) {
      target.warn(`${target.id} requires Node.js to run.`);
      warnHowToInstallNode(target);
      return false;
    }

    if (output.stderr || output.exitCode !== 0) {
      target.warn(dedent`
        ${target.id} requires a valid Node.js installation to run.
        An unknown error happened while trying to determine your node version with node --version
        ${output.stderr}
      `);
      warnHowToInstallNode(target);
      return false;
    }

    if (isVersionLessThan(output.stdout, requiredVersion)) {
      target.warn(dedent`
        ${target.id} needs a Node.js version greater than ${requiredVersion}
        Version detected: ${output.stdout}
      `);
      warnHowToInstallNode(target);
      return false;
    }

    return true;
  };
}

export function warnHowToInstallNode(target: Command) {
  target.warn(dedent`
    Please visit ${linkToReadme} for more detailed installation information.
  `);
}

export function isMissingExecutable(output: SpawnProcessOutput) {
  return (
    output.exitCode !== null &&
    Math.abs(output.exitCode) === constants.errno.ENOENT
  );
}
