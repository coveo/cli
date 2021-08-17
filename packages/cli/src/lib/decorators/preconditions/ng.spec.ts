jest.mock('../../utils/process');
jest.mock('../../utils/misc');
jest.mock('cli-ux');

import {dedent} from 'ts-dedent';
import {constants} from 'os';
import {mocked} from 'ts-jest/utils';
import {spawnProcessOutput, spawnProcess} from '../../utils/process';
import {getFakeCommand} from './testsUtils/utils';
import {cli} from 'cli-ux';

import {IsNgInstalled} from './ng';
import type {Command} from '@oclif/command';
import {appendCmdIfWindows} from '../../utils/os';
import {getPackageVersion} from '../../utils/misc';

describe('IsNgInstalled', () => {
  const mockedSpawnProcessOutput = mocked(spawnProcessOutput);
  const mockedSpawnProcess = mocked(spawnProcess);
  const mockedGetPackageVersion = mocked(getPackageVersion);
  const mockedCliUx = mocked(cli, true);
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
        exitCode: constants.errno.ENOENT,
        stderr: 'spawn ng ENOENT',
        stdout: '',
      });
    });

    it('should ask the user if he want to install the Angular CLI now', async () => {
      mockedCliUx.confirm.mockReturnValueOnce(Promise.resolve(false));

      await IsNgInstalled()(fakeCommand);

      expect(mockedCliUx.confirm).toHaveBeenCalledTimes(1);
      expect(mockedCliUx.confirm).toHaveBeenCalledWith(
        dedent`
        You need to have the Angular-CLI installed on your computer before proceeding.
        Do you want to install it now? (y/n)`
      );
    });

    describe('when the user agree to install the Angular CLI', () => {
      beforeEach(() => {
        mockedCliUx.confirm.mockReturnValueOnce(Promise.resolve(true));
      });

      it('should start the installation of @angular/cli', async () => {
        await IsNgInstalled()(fakeCommand);

        expect(mockedSpawnProcess).toHaveBeenCalledWith(
          expect.stringContaining('npm'),
          ['install', '-g', '@angular/cli@1.0.0']
        );
      });

      describe('when the installation is succesful', () => {
        beforeEach(() => {
          mockedSpawnProcess.mockReturnValueOnce(Promise.resolve(0));
        });

        it('should return true and not warn', async () => {
          await expect(IsNgInstalled()(fakeCommand)).resolves.toBe(true);
          expect(fakeCommand.warn).toHaveBeenCalledTimes(0);
        });
      });

      describe('when the installation fails', () => {
        beforeEach(() => {
          mockedSpawnProcess.mockReturnValueOnce(Promise.resolve(1));
        });

        it('should return false and ask the user to install Angular-CLI and retry afteward', async () => {
          await expect(IsNgInstalled()(fakeCommand)).resolves.toBe(false);
          expect(fakeCommand.warn).toHaveBeenCalledTimes(1);
          expect(fakeCommand.warn).toHaveBeenCalledWith(dedent`
          Angular installation failed, ${fakeCommand.id} cannot proceed.
          Please try to install Angular-CLI first then try again.
          `);
        });
      });
    });
  });

  describe('when an unknown error happens while checking for ng', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: 1,
        stderr: 'some random error oh no',
        stdout: '',
      });
    });

    it('should return false and warn', async () => {
      await expect(IsNgInstalled()(fakeCommand)).resolves.toBe(false);
      expect(fakeCommand.warn).toHaveBeenCalledTimes(2);
      expect(fakeCommand.warn).toHaveBeenCalledWith(dedent`
        foo requires a valid Angular-CLI installation to run.
        An unknown error happened while running ${appendCmdIfWindows`ng`} --version.
        some random error oh no
      `);
      expect(fakeCommand.warn).toHaveBeenCalledWith(dedent`
        Please visit https://angular.io/guide/setup-local#install-the-angular-cli for more detailed installation information.
      `);
    });
  });

  describe('when ng is installed', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: 0,
        stderr: '',
        stdout: '',
      });
    });

    it('should return true and not warn', async () => {
      await expect(IsNgInstalled()(fakeCommand)).resolves.toBe(true);
      expect(fakeCommand.warn).toHaveBeenCalledTimes(0);
    });
  });
});
