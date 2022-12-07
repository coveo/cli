import {dedent} from 'ts-dedent';
import {spawnProcessOutput} from '../../utils/process';
import {satisfies, validRange} from 'semver';
import {PreconditionError} from '@coveo/cli-commons/errors/preconditionError';
import {PreconditionFunction} from '@coveo/cli-commons/preconditions';
import {CLICommand} from '@coveo/cli-commons/command/cliCommand';

export enum PreconditionErrorCategoryBin {
  MissingBin = 'Missing Bin',
  InvalidBinInstallation = 'Invalid Bin installation',
  InvalidBinVersionRange = 'Invalid Bin Range',
}

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
  return function (versionRange: string): PreconditionFunction {
    return async function (target: CLICommand) {
      if (!validRange(versionRange)) {
        const message = dedent`
          Required version invalid: "${versionRange}".
          Please report this error to Coveo: https://github.com/coveo/cli/issues/new
        `;
        throw new PreconditionError(message, {
          category: PreconditionErrorCategoryBin.InvalidBinVersionRange,
        });
      }

      const binPath = await getBinPath(binaryName);
      if (binPath === null) {
        const warningMessage = dedent`${target.identifier} requires ${
          options.prettyName
        } to run.
    
        ${warnHowToInstallBin(options)}`;
        throw new PreconditionError(warningMessage, {
          category: PreconditionErrorCategoryBin.MissingBin,
        });
      }
      let commandName = binaryName;

      if (binPath.startsWith('/snap/bin')) {
        appliedOptions.params.unshift('run', binaryName);
        commandName = 'snap';
      }

      const output = await spawnProcessOutput(
        commandName,
        appliedOptions.params
      );
      const version = versionExtractor(output.stdout);

      if (!satisfies(version, versionRange)) {
        const message = dedent`
          ${target.identifier} needs a ${
          appliedOptions.prettyName
        } version in this range: "${versionRange}"
          Version detected: ${version}

          ${warnHowToInstallBin(appliedOptions)}
        `;
        throw new PreconditionError(message, {
          category: PreconditionErrorCategoryBin.InvalidBinVersionRange,
        });
      }
    };
  };
}

export function getBinInstalledPrecondition(
  binaryName: string,
  options: BinPreconditionsOptions
) {
  return function () {
    return async function (target: CLICommand) {
      const binPath = await getBinPath(binaryName);
      if (binPath === null) {
        const warningMessage = dedent`${target.identifier} requires ${
          options.prettyName
        } to run.
    
        ${warnHowToInstallBin(options)}`;
        throw new PreconditionError(warningMessage, {
          category: PreconditionErrorCategoryBin.MissingBin,
        });
      }
    };
  };
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

async function getBinPath(binaryName: string) {
  const output = await spawnProcessOutput(
    process.platform === 'win32' ? 'where.exe' : 'which',
    [binaryName]
  );

  return output.exitCode === '0' ? output.stdout.trim() : null;
}
