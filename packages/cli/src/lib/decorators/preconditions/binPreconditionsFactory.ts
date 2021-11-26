import type {Command} from '@oclif/core';
import {dedent} from 'ts-dedent';
import {spawnProcessOutput, SpawnProcessOutput} from '../../utils/process';
import {satisfies, validRange} from 'semver';
import {
  PreconditionError,
  PreconditionErrorCategory,
} from '../../errors/preconditionError';

export interface BinPreconditionsOptions {
  params?: Array<string>;
  prettyName: string;
  installLink?: string;
  howToInstallBinText?: string;
}

const defaultOptions: Required<Omit<BinPreconditionsOptions, 'prettyName'>> = {
  params: ['--version'],
  installLink:
    'https://github.com/coveo/cli/wiki/Node.js,-NPM-and-NPX-requirements',
  howToInstallBinText: '',
};

export function getBinVersionPrecondition(
  binaryName: string,
  options: BinPreconditionsOptions,
  versionExtractor: (stdout: string) => string = (stdout) => stdout
) {
  const appliedOptions: Required<BinPreconditionsOptions> = {
    ...defaultOptions,
    ...options,
    prettyName: options.prettyName,
  };
  return function (versionRange: string) {
    return async function (target: Command) {
      if (!validRange(versionRange)) {
        const message = dedent`
          Required version invalid: "${versionRange}".
          Please report this error to Coveo: https://github.com/coveo/cli/issues/new
        `;
        throw new PreconditionError(message, {
          category: PreconditionErrorCategory.InvalidBinVersionRange,
        });
      }

      const output = await spawnProcessOutput(
        binaryName,
        appliedOptions.params
      );

      await checkIfBinIsInstalled(target, binaryName, appliedOptions, output);
      const version = versionExtractor(output.stdout);

      if (!satisfies(version, versionRange)) {
        const message = dedent`
          ${target.id} needs a ${
          appliedOptions.prettyName
        } version in this range: "${versionRange}"
          Version detected: ${version}

          ${warnHowToInstallBin(appliedOptions)}
        `;
        throw new PreconditionError(message, {
          category: PreconditionErrorCategory.InvalidBinVersionRange,
        });
      }
    };
  };
}

export function getBinInstalledPrecondition(
  binaryName: string,
  options: BinPreconditionsOptions
) {
  const appliedOptions: Required<BinPreconditionsOptions> = {
    ...defaultOptions,
    ...options,
    prettyName: options.prettyName,
  };
  return function () {
    return async function (target: Command) {
      const output = await spawnProcessOutput(
        binaryName,
        appliedOptions.params
      );
      await checkIfBinIsInstalled(target, binaryName, appliedOptions, output);
    };
  };
}

async function checkIfBinIsInstalled(
  target: Command,
  binaryName: string,
  options: Required<BinPreconditionsOptions>,
  output: SpawnProcessOutput
): Promise<void | never> {
  if (output.exitCode === 'ENOENT') {
    const warningMessage = dedent`${target.id} requires ${
      options.prettyName
    } to run.

    ${warnHowToInstallBin(options)}`;
    throw new PreconditionError(warningMessage, {
      category: PreconditionErrorCategory.MissingBin,
    });
  }

  if (output.exitCode !== '0') {
    const message = dedent`
      ${target.id} requires a valid ${options.prettyName} installation to run.
      An unknown error happened while running ${binaryName} ${options.params.join(
      ' '
    )}.
      ${output.stderr}

      ${warnHowToInstallBin(options)}
    `;
    throw new PreconditionError(message, {
      category: PreconditionErrorCategory.InvalidBinInstallation,
    });
  }
}

function warnHowToInstallBin(options: BinPreconditionsOptions) {
  const newParagraph = '\n\n';
  const howToInstallMessage = [];
  if (options.howToInstallBinText) {
    howToInstallMessage.push(options.howToInstallBinText);
  }
  howToInstallMessage.push(
    `Please visit ${options.installLink} for more detailed installation information.`
  );
  return howToInstallMessage.join(newParagraph);
}
