jest.mock('../../utils/process');

import {dedent} from 'ts-dedent';
import {constants} from 'os';
import {mocked} from 'ts-jest/utils';
import {spawnProcessOutput} from '../../utils/process';
import {getFakeCommand} from './testsUtils/utils';

import {IsNpmVersionInRange} from './npm';
import {appendCmdIfWindows} from '../../utils/os';

describe('IsNpmVersionInRange', () => {
  const mockedSpawnProcessOutput = mocked(spawnProcessOutput);
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when the requiredVersion is not a semver valid string', () => {
    it('should return false and warn', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsNpmVersionInRange('foo')(fakeCommand)).resolves.toBe(
        false
      );
      expect(fakeCommand.warn).toHaveBeenCalledTimes(1);
      expect(fakeCommand.warn).toHaveBeenCalledWith(dedent`
        Required version invalid: "foo".
        Please report this error to Coveo: https://github.com/coveo/cli/issues/new
      `);
    });
  });

  describe('when npm is not installed', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: constants.errno.ENOENT,
        stderr: '',
        stdout: '',
      });
    });

    it('should return false and warn', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsNpmVersionInRange('>=0.0.1')(fakeCommand)).resolves.toBe(
        false
      );
      expect(fakeCommand.warn).toHaveBeenCalledTimes(2);
      expect(fakeCommand.warn).toHaveBeenCalledWith('foo requires npm to run.');
      expect(fakeCommand.warn).toHaveBeenCalledWith(dedent`
       Please visit https://github.com/coveo/cli/wiki/Node.js,-NPM-and-NPX-requirements for more detailed installation information.
      `);
    });
  });

  describe('when an unknown error happens while getting the npm version', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: 1,
        stderr: 'some random error oh no',
        stdout: '',
      });
    });

    it('should return false and warn', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsNpmVersionInRange('>=0.0.1')(fakeCommand)).resolves.toBe(
        false
      );
      expect(fakeCommand.warn).toHaveBeenCalledTimes(2);
      expect(fakeCommand.warn).toHaveBeenCalledWith(dedent`
        foo requires a valid npm installation to run.
        An unknown error happened while running ${appendCmdIfWindows`npm`} --version.
        some random error oh no
      `);
      expect(fakeCommand.warn).toHaveBeenCalledWith(dedent`
        Please visit https://github.com/coveo/cli/wiki/Node.js,-NPM-and-NPX-requirements for more detailed installation information.
      `);
    });
  });

  describe('when the installed version of npm is lower than the required one', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: 0,
        stderr: '',
        stdout: 'v0.9.0',
      });
    });

    it('should return false and warn', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsNpmVersionInRange('>=1.0.0')(fakeCommand)).resolves.toBe(
        false
      );
      expect(fakeCommand.warn).toHaveBeenCalledTimes(2);
      expect(fakeCommand.warn).toHaveBeenCalledWith(dedent`
        foo needs a npm version in this range: ">=1.0.0"
        Version detected: v0.9.0
      `);
      expect(fakeCommand.warn).toHaveBeenCalledWith(dedent`
        Please visit https://github.com/coveo/cli/wiki/Node.js,-NPM-and-NPX-requirements for more detailed installation information.
      `);
    });
  });

  describe('when the installed version of npm is above than the required one', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: 0,
        stderr: '',
        stdout: 'v1.1.0',
      });
    });

    it('should return true and not warn', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsNpmVersionInRange('>=1.0.0')(fakeCommand)).resolves.toBe(
        true
      );
      expect(fakeCommand.warn).toHaveBeenCalledTimes(0);
    });
  });

  describe('when the installed version of npm is the same as the required one', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: 0,
        stderr: '',
        stdout: 'v1.0.0',
      });
    });

    it('should return true and not warn', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsNpmVersionInRange('>=1.0.0')(fakeCommand)).resolves.toBe(
        true
      );
      expect(fakeCommand.warn).toHaveBeenCalledTimes(0);
    });
  });
});
