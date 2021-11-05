jest.mock('../../utils/process');
jest.mock('../../utils/misc');
jest.mock('cli-ux');

import {dedent} from 'ts-dedent';
import {mocked} from 'ts-jest/utils';
import {spawnProcessOutput} from '../../utils/process';
import {getFakeCommand} from './testsUtils/utils';
import {cli} from 'cli-ux';

import {IsNgInstalled} from './ng';
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

      await expect(IsNgInstalled()(fakeCommand)).rejects.toThrow(
        new PreconditionError(dedent`foo requires Angular-CLI to run.

        You can install the Angular-CLI by running npm i -g @angular/cli

        Please visit https://angular.io/guide/setup-local#install-the-angular-cli for more detailed installation information.
       `)
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
      await expect(IsNgInstalled()(fakeCommand)).rejects.toThrow(
        new PreconditionError(dedent`
        foo requires a valid Angular-CLI installation to run.
        An unknown error happened while running ${appendCmdIfWindows`ng`} --version.
        some random error oh no

        You can install the Angular-CLI by running npm i -g @angular/cli

        Please visit https://angular.io/guide/setup-local#install-the-angular-cli for more detailed installation information.
       `)
      );
    });
  });

  describe('when ng is installed', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: '0',
        stderr: '',
        stdout: '',
      });
    });

    fancyIt()('should return true and not warn', async () => {
      await expect(IsNgInstalled()(fakeCommand)).resolves.not.toThrow();
    });
  });
});
