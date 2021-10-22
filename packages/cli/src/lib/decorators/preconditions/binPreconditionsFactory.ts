import type Command from '@oclif/command';
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
  options: BinPreconditionsOptions
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
        throw new PreconditionError(
          message,
          PreconditionErrorCategory.InvalidBinVersionRange
        );
      }

      const output = await spawnProcessOutput(
        binaryName,
        appliedOptions.params
      );

      await checkIfBinIsInstalled(target, binaryName, appliedOptions, output);

      if (!satisfies(output.stdout, versionRange)) {
        const message = dedent`
          ${target.id} needs a ${
          appliedOptions.prettyName
        } version in this range: "${versionRange}"
          Version detected: ${output.stdout}

          ${warnHowToInstallBin(appliedOptions)}
        `;
        throw new PreconditionError(
          message,
          PreconditionErrorCategory.InvalidBinVersionRange
        );
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
    throw new PreconditionError(
      warningMessage,
      PreconditionErrorCategory.MissingBin
    );
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
    throw new PreconditionError(
      message,
      PreconditionErrorCategory.InvalidBinInstallation
    );
  }
}

function warnHowToInstallBin(options: BinPreconditionsOptions) {
  let howToInstallMessage = `Please visit ${options.installLink} for more detailed installation information.`;
  if (options.howToInstallBinText) {
    howToInstallMessage += options.howToInstallBinText;
  }
  return howToInstallMessage;
}
