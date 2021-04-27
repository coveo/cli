import type Command from '@oclif/command';
import {dedent} from 'ts-dedent';
import {constants} from 'os';
import {spawnProcessOutput, SpawnProcessOutput} from '../../utils/process';
import {satisfies, validRange} from 'semver';

export interface IBinPreconditionsOptions {
  params?: Array<string>;
  prettyName?: string;
  installLink?: string;
  howToInstallBinText?: string;
}

const defaultOptions: Required<Omit<IBinPreconditionsOptions, 'prettyName'>> = {
  params: ['--version'],
  installLink:
    'https://github.com/coveo/cli/wiki/Node.js,-NPM-and-NPX-requirements',
  howToInstallBinText: '',
};

export function getBinVersionPrecondition(
  binaryName: string,
  options?: IBinPreconditionsOptions
) {
  const appliedOptions: Required<IBinPreconditionsOptions> = {
    ...defaultOptions,
    ...options,
    prettyName: options?.prettyName || binaryName,
  };
  return function (versionRange: string) {
    return async function (target: Command) {
      if (!validRange(versionRange)) {
        target.warn(dedent`
          Required version invalid: "${versionRange}".
          Please report this error to Coveo: https://github.com/coveo/cli/issues/new
        `);
        return false;
      }

      const output = await spawnProcessOutput(
        binaryName,
        appliedOptions.params
      );

      if (!isBinInstalled(target, binaryName, appliedOptions, output)) {
        return false;
      }

      if (!satisfies(output.stdout, versionRange)) {
        target.warn(dedent`
          ${target.id} needs a ${appliedOptions.prettyName} version in this range: "${versionRange}"
          Version detected: ${output.stdout}
        `);
        warnHowToInstallBin(target, appliedOptions);
        return false;
      }

      return true;
    };
  };
}

export function getBinInstalledPrecondition(
  binaryName: string,
  options?: IBinPreconditionsOptions
) {
  const appliedOptions: Required<IBinPreconditionsOptions> = {
    ...defaultOptions,
    ...options,
    prettyName: options?.prettyName ?? binaryName,
  };
  return function () {
    return async function (target: Command) {
      const output = await spawnProcessOutput(
        binaryName,
        appliedOptions.params
      );
      return isBinInstalled(target, binaryName, appliedOptions, output);
    };
  };
}

function isBinInstalled(
  target: Command,
  binaryName: string,
  options: Required<IBinPreconditionsOptions>,
  output: SpawnProcessOutput
) {
  if (isBinFileMissing(output)) {
    target.warn(`${target.id} requires ${options.prettyName} to run.`);
    warnHowToInstallBin(target, options);
    return false;
  }

  if (output.exitCode !== 0) {
    target.warn(dedent`
      ${target.id} requires a valid ${options.prettyName} installation to run.
      An unknown error happened while running ${binaryName} ${options.params.join(
      ' '
    )}.
      ${output.stderr}
    `);
    warnHowToInstallBin(target, options);
    return false;
  }

  return true;
}

function warnHowToInstallBin(
  target: Command,
  options: IBinPreconditionsOptions
) {
  target.warn(
    `Please visit ${options.installLink} for more detailed installation information.`
  );
  if (options.howToInstallBinText) {
    target.warn(options.howToInstallBinText);
  }
}

function isBinFileMissing(output: SpawnProcessOutput) {
  return (
    output.exitCode !== null &&
    Math.abs(output.exitCode) === constants.errno.ENOENT
  );
}
