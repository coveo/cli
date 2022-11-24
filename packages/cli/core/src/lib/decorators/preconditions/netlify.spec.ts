jest.mock('../../utils/process');
jest.mock('../../utils/misc');
jest.mock('../../utils/os');

import {spawnProcessOutput} from '../../utils/process';
import {getFakeCommand} from '@coveo/cli-commons/utils/getFakeCommand';

import {IsNetlifyCliVersionInRange} from './netlify';
import {CliUx} from '@oclif/core';
import {appendCmdIfWindows} from '../../utils/os';
import {getPackageVersion} from '../../utils/misc';
import {fancyIt} from '@coveo/cli-commons-dev/testUtils/it';
import {CLICommand} from '@coveo/cli-commons/command/cliCommand';

describe('IsNgInstalled', () => {
  const mockedSpawnProcessOutput = jest.mocked(spawnProcessOutput);
  const mockedGetPackageVersion = jest.mocked(getPackageVersion);
  const mockedAppendCmdIfWindows = jest.mocked(appendCmdIfWindows);

  const mockAppendCmdIfWindows = () => {
    mockedAppendCmdIfWindows.mockImplementationOnce((input) => `${input}`);
  };

  const mockConfirm = () => {
    Object.defineProperty(CliUx.ux, 'confirm', {value: jest.fn()});
  };
  let fakeCommand: CLICommand;

  beforeAll(() => {
    mockConfirm();
    mockAppendCmdIfWindows();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    fakeCommand = getFakeCommand();
    mockedGetPackageVersion.mockReturnValue('1.0.0');
  });

  describe('when the requiredVersion is not a semver valid string', () => {
    fancyIt()('should throw', async () => {
      const fakeCommand = getFakeCommand();

      await expect(
        IsNetlifyCliVersionInRange('foo')(fakeCommand)
      ).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe('when netlify-cli is not installed', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: 'ENOENT',
        stderr: '',
        stdout: '',
      });
    });

    fancyIt()('should throw', async () => {
      const fakeCommand = getFakeCommand();
      await expect(
        IsNetlifyCliVersionInRange('>=0.0.1')(fakeCommand)
      ).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe('when an unknown error happens while checking for netlify-cli', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: '1',
        stderr: 'some random error oh no',
        stdout: '',
      });
    });

    fancyIt()('should return false and warn', async () => {
      await expect(
        IsNetlifyCliVersionInRange('>=0.0.1')(fakeCommand)
      ).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe('when the installed version of netlify-cli is lower than the required one', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: '0',
        stderr: '',
        stdout: 'netlify-cli/0.9.0',
      });
    });

    fancyIt()('should throw', async () => {
      const fakeCommand = getFakeCommand();

      await expect(
        IsNetlifyCliVersionInRange('>=1.0.0')(fakeCommand)
      ).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe('when the installed version of netlify-cli is above than the required one', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: '0',
        stderr: '',
        stdout: 'netlify-cli/1.1.0',
      });
    });

    fancyIt()('should not throw', async () => {
      const fakeCommand = getFakeCommand();

      await expect(
        IsNetlifyCliVersionInRange('>=1.0.0')(fakeCommand)
      ).resolves.not.toThrow();
    });
  });
});
