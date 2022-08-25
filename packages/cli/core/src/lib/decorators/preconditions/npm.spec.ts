jest.mock('../../utils/process');

import {dedent} from 'ts-dedent';
import {spawnProcessOutput} from '../../utils/process';
import {getFakeCommand} from './testsUtils/utils';

import {IsNpmVersionInRange} from './npm';
import {appendCmdIfWindows} from '../../utils/os';
import {fancyIt} from '../../../__test__/it';

describe('IsNpmVersionInRange', () => {
  const mockedSpawnProcessOutput = jest.mocked(spawnProcessOutput);
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when the requiredVersion is not a semver valid string', () => {
    fancyIt()('should return false and warn', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsNpmVersionInRange('foo')(fakeCommand)).rejects.toThrow(
        dedent`
        Required version invalid: "foo".
        Please report this error to Coveo: https://github.com/coveo/cli/issues/new
      `
      );
    });
  });

  describe('when npm is not installed', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: 'ENOENT',
        stderr: '',
        stdout: '',
      });
    });

    fancyIt()('should return false and warn', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsNpmVersionInRange('>=0.0.1')(fakeCommand)).rejects.toThrow(
        dedent`foo requires npm to run.

       Please visit https://github.com/coveo/cli/wiki/Node.js,-NPM-and-NPX-requirements for more detailed installation information.
      `
      );
    });
  });

  describe('when an unknown error happens while getting the npm version', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: '1',
        stderr: 'some random error oh no',
        stdout: '',
      });
    });

    fancyIt()('should return false and warn', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsNpmVersionInRange('>=0.0.1')(fakeCommand)).rejects.toThrow(
        dedent`
        foo requires a valid npm installation to run.
        An unknown error happened while running ${appendCmdIfWindows`npm`} --version.
        some random error oh no

        Please visit https://github.com/coveo/cli/wiki/Node.js,-NPM-and-NPX-requirements for more detailed installation information.
      `
      );
    });
  });

  describe('when the installed version of npm is lower than the required one', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: '0',
        stderr: '',
        stdout: 'v0.9.0',
      });
    });

    fancyIt()('should return false and warn', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsNpmVersionInRange('>=1.0.0')(fakeCommand)).rejects
        .toThrow(dedent`
        foo needs a npm version in this range: ">=1.0.0"
        Version detected: v0.9.0

        Please visit https://github.com/coveo/cli/wiki/Node.js,-NPM-and-NPX-requirements for more detailed installation information.
      `);
    });
  });

  describe('when the installed version of npm is above than the required one', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: '0',
        stderr: '',
        stdout: 'v1.1.0',
      });
    });

    fancyIt()('should return true and not warn', async () => {
      const fakeCommand = getFakeCommand();

      await expect(
        IsNpmVersionInRange('>=1.0.0')(fakeCommand)
      ).resolves.not.toThrow();
    });
  });

  describe('when the installed version of npm is the same as the required one', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: '0',
        stderr: '',
        stdout: 'v1.0.0',
      });
    });

    fancyIt()('should return true and not warn', async () => {
      const fakeCommand = getFakeCommand();

      await expect(
        IsNpmVersionInRange('>=1.0.0')(fakeCommand)
      ).resolves.not.toThrow();
    });
  });
});
