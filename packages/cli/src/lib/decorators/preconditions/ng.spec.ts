jest.mock('../../utils/process');
jest.mock('../../utils/misc');
jest.mock('cli-ux');

import {dedent} from 'ts-dedent';
import {mocked} from 'ts-jest/utils';
import {spawnProcessOutput} from '../../utils/process';
import {getFakeCommand} from './testsUtils/utils';
import {cli} from 'cli-ux';

import {IsNgVersionInRange} from './ng';
import type {Command} from '@oclif/command';
import {appendCmdIfWindows} from '../../utils/os';
import {getPackageVersion} from '../../utils/misc';
import {fancyIt} from '../../../__test__/it';

describe('IsNgInstalled', () => {
  const mockedSpawnProcessOutput = mocked(spawnProcessOutput);
  const mockedGetPackageVersion = mocked(getPackageVersion);
  const mockConfirm = () => {
    Object.defineProperty(cli, 'confirm', {value: jest.fn()});
  };

  let fakeCommand: Command;

  beforeAll(() => {
    mockConfirm();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    fakeCommand = getFakeCommand();
    mockedGetPackageVersion.mockReturnValue('1.0.0');
  });

  describe('when ng is not installed', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: 'ENOENT',
        stderr: '',
        stdout: '',
      });
    });

    fancyIt()('should return false and warn', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsNgVersionInRange('>=0.0.1')(fakeCommand)).resolves.toBe(
        false
      );
      expect(fakeCommand.warn).toHaveBeenCalledTimes(3);
      expect(fakeCommand.warn).toHaveBeenNthCalledWith(
        1,
        'foo requires Angular-CLI to run.'
      );
      expect(fakeCommand.warn).toHaveBeenNthCalledWith(
        2,
        dedent`
       Please visit https://angular.io/guide/setup-local#install-the-angular-cli for more detailed installation information.
      `
      );
      expect(fakeCommand.warn).toHaveBeenNthCalledWith(
        3,
        'You can install the Angular-CLI by running npm i -g @angular/cli'
      );
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
      await expect(IsNgVersionInRange('>=0.0.1')(fakeCommand)).resolves.toBe(
        false
      );
      expect(fakeCommand.warn).toHaveBeenCalledTimes(3);
      expect(fakeCommand.warn).toHaveBeenNthCalledWith(
        1,
        dedent`
        foo requires a valid Angular-CLI installation to run.
        An unknown error happened while running ${appendCmdIfWindows`ng`} --version.
        some random error oh no
      `
      );
      expect(fakeCommand.warn).toHaveBeenNthCalledWith(
        2,
        dedent`
        Please visit https://angular.io/guide/setup-local#install-the-angular-cli for more detailed installation information.
      `
      );
      expect(fakeCommand.warn).toHaveBeenNthCalledWith(
        3,
        'You can install the Angular-CLI by running npm i -g @angular/cli'
      );
    });
  });

  describe('when the installed version of ng is lower than the required one', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: '0',
        stderr: '',
        stdout: 'v0.9.0',
      });
    });

    fancyIt()('should return false and warn', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsNgVersionInRange('>=1.0.0')(fakeCommand)).resolves.toBe(
        false
      );
      expect(fakeCommand.warn).toHaveBeenCalledTimes(3);
      expect(fakeCommand.warn).toHaveBeenNthCalledWith(
        1,
        dedent`
        foo needs a Angular-CLI version in this range: ">=1.0.0"
        Version detected: v0.9.0
      `
      );
      expect(fakeCommand.warn).toHaveBeenNthCalledWith(
        2,
        dedent`
      Please visit https://angular.io/guide/setup-local#install-the-angular-cli for more detailed installation information.
      `
      );
      expect(fakeCommand.warn).toHaveBeenNthCalledWith(
        3,
        'You can install the Angular-CLI by running npm i -g @angular/cli'
      );
    });
  });

  describe('when the installed version of ng is above than the required one', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: '0',
        stderr: '',
        stdout: 'v1.1.0',
      });
    });

    fancyIt()('should return true and not warn', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsNgVersionInRange('>=1.0.0')(fakeCommand)).resolves.toBe(
        true
      );
      expect(fakeCommand.warn).toHaveBeenCalledTimes(0);
    });
  });

  describe('when the installed version of ng is the same as the required one', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: '0',
        stderr: '',
        stdout: 'v1.0.0',
      });
    });

    fancyIt()('should return true and not warn', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsNgVersionInRange('>=1.0.0')(fakeCommand)).resolves.toBe(
        true
      );
      expect(fakeCommand.warn).toHaveBeenCalledTimes(0);
    });
  });
});
