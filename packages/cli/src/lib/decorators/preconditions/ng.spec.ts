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
import {PreconditionError} from '../../errors/preconditionError';

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

  describe('when the requiredVersion is not a semver valid string', () => {
    fancyIt()('should throw', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsNgVersionInRange('foo')(fakeCommand)).rejects.toThrow(
        new PreconditionError(dedent`
        Required version invalid: "foo".
        Please report this error to Coveo: https://github.com/coveo/cli/issues/new
      `)
      );
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
      await expect(IsNgVersionInRange('>=0.0.1')(fakeCommand)).rejects.toThrow(
        dedent`foo requires Angular-CLI to run.

        You can install the Angular-CLI by running npm i -g @angular/cli

        Please visit https://angular.io/guide/setup-local#install-the-angular-cli for more detailed installation information.
       `
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
      await expect(IsNgVersionInRange('>=0.0.1')(fakeCommand)).rejects.toThrow(
        dedent`
        foo requires a valid Angular-CLI installation to run.
        An unknown error happened while running ${appendCmdIfWindows`ng`} --version.
        some random error oh no

        You can install the Angular-CLI by running npm i -g @angular/cli

        Please visit https://angular.io/guide/setup-local#install-the-angular-cli for more detailed installation information.
       `
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

    fancyIt()('should throw', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsNgVersionInRange('>=1.0.0')(fakeCommand)).rejects.toThrow(
        dedent`
        foo needs a Angular-CLI version in this range: ">=1.0.0"
        Version detected: v0.9.0
        
        You can install the Angular-CLI by running npm i -g @angular/cli
        
        Please visit https://angular.io/guide/setup-local#install-the-angular-cli for more detailed installation information.
        `
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

    fancyIt()('should not throw', async () => {
      const fakeCommand = getFakeCommand();

      await expect(
        IsNgVersionInRange('>=1.0.0')(fakeCommand)
      ).resolves.not.toThrow();
    });
  });
});
