jest.mock('../../utils/process.js');
jest.mock('../../utils/misc.js');
jest.mock('../../utils/os.js');

import {spawnProcessOutput} from '../../utils/process.js';
import {getFakeCommand} from '@coveo/cli-commons-dev/testUtils/utils';

import {IsNgVersionInRange} from './ng.js';
import {Command, CliUx} from '@oclif/core';
import {appendCmdIfWindows} from '../../utils/os.js';
import {getPackageVersion} from '../../utils/misc.js';
import {fancyIt} from '@coveo/cli-commons-dev/testUtils/it';

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
  let fakeCommand: Command;

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
        IsNgVersionInRange('foo')(fakeCommand)
      ).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe('when ng is not installed', () => {
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
        IsNgVersionInRange('>=0.0.1')(fakeCommand)
      ).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe('when an unknown error happens while checking for ng', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: '1',
        stderr: 'some random error oh no',
        stdout: '',
      });
    });

    fancyIt()('should return false and warn', async () => {
      await expect(
        IsNgVersionInRange('>=0.0.1')(fakeCommand)
      ).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe('when the installed version of ng is lower than the required one', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: '0',
        stderr: '',
        stdout: 'Angular CLI: 0.9.0',
      });
    });

    fancyIt()('should throw', async () => {
      const fakeCommand = getFakeCommand();

      await expect(
        IsNgVersionInRange('>=1.0.0')(fakeCommand)
      ).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe('when the installed version of ng is above than the required one', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: '0',
        stderr: '',
        stdout: 'Angular CLI: 1.1.0',
      });
    });

    fancyIt()('should not throw', async () => {
      const fakeCommand = getFakeCommand();

      await expect(
        IsNgVersionInRange('>=1.0.0')(fakeCommand)
      ).resolves.not.toThrow();
    });
  });
});
