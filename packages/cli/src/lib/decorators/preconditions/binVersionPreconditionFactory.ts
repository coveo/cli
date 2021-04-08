import type Command from '@oclif/command';
import dedent = require('dedent');
import {constants} from 'os';
import {spawnProcessOutput, SpawnProcessOutput} from '../../utils/process';
import {satisfies, validRange} from 'semver';

type VersionPrecondition = (
  neededVersion: string
) => (target: Command) => Promise<boolean>;

export interface IBinVersionPreconditionOptions {
  params?: Array<String>;
  prettyName?: string;
  installLink?: string;
}

const defaultOptions: IBinVersionPreconditionOptions = {
  params: ['--version'],
  installLink:
    'https://github.com/coveo/cli/wiki/Node.js,-NPM-and-NPX-requirements',
};

export function warnHowToInstallBin(
  target: Command,
  options: IBinVersionPreconditionOptions
) {
  target.warn(dedent`
      Please visit ${options.installLink} for more detailed installation information.
    `);
}

export function isMissingBin(output: SpawnProcessOutput) {
  return (
    output.exitCode !== null &&
    Math.abs(output.exitCode) === constants.errno.ENOENT
  );
}

export function getBinVersionPrecondition(
  binaryName: string,
  options: IBinVersionPreconditionOptions = defaultOptions
): VersionPrecondition {
  options = {...defaultOptions, ...options};
  options.prettyName = options.prettyName || binaryName;
  return function IsNodeVersionAbove(versionRange: string) {
    return async function (target: Command) {
      if (!validRange(versionRange)) {
        target.warn(dedent`
          Required version invalid: "${versionRange}".
          Please report this error to Coveo: https://github.com/coveo/cli/issues/new
        `);
        return false;
      }

      const output = await spawnProcessOutput(binaryName, ['--version']);

      if (isMissingBin(output)) {
        target.warn(`${target.id} requires ${options.prettyName} to run.`);
        warnHowToInstallBin(target, options);
        return false;
      }

      if (output.stderr || output.exitCode !== 0) {
        target.warn(dedent`
          ${target.id} requires a valid ${options.prettyName} installation to run.
          An unknown error happened while trying to determine your ${binaryName} version with ${binaryName} --version
          ${output.stderr}
        `);
        warnHowToInstallBin(target, options);
        return false;
      }

      if (satisfies(output.stdout, versionRange)) {
        target.warn(dedent`
          ${target.id} needs a ${options.prettyName} version in this range: "${versionRange}"
          Version detected: ${output.stdout}
        `);
        warnHowToInstallBin(target, options);
        return false;
      }

      return true;
    };
  };
}
