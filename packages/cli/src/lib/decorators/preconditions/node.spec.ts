jest.mock('../../utils/process');

import {dedent} from 'ts-dedent';
import {mocked} from 'ts-jest/utils';
import {spawnProcessOutput} from '../../utils/process';
import {getFakeCommand} from './testsUtils/utils';

import {IsNodeVersionInRange} from './node';
import {fancyIt} from '../../../__test__/it';
import {PreconditionError} from '../../errors/preconditionError';

describe('IsNodeVersionInRange', () => {
  const mockedSpawnProcessOutput = mocked(spawnProcessOutput);
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when the requiredVersion is not a semver valid string', () => {
    fancyIt()('should throw', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsNodeVersionInRange('foo')(fakeCommand)).rejects.toThrow(
        new PreconditionError(dedent`
        Required version invalid: "foo".
        Please report this error to Coveo: https://github.com/coveo/cli/issues/new
      `)
      );
    });
  });

  describe('when Node.js is not installed', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: 'ENOENT',
        stderr: '',
        stdout: '',
      });
    });

    fancyIt()('should throw', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsNodeVersionInRange('>=0.0.1')(fakeCommand)).rejects
        .toThrow(dedent`
      foo requires Node.js to run.

      Please visit https://github.com/coveo/cli/wiki/Node.js,-NPM-and-NPX-requirements for more detailed installation information.
      `);
    });
  });

  describe('when an unknown error happens while getting the node version', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: '1',
        stderr: 'some random error oh no',
        stdout: '',
      });
    });

    fancyIt()('should throw', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsNodeVersionInRange('>=0.0.1')(fakeCommand)).rejects
        .toThrow(dedent`
      foo requires a valid Node.js installation to run.
      An unknown error happened while running node --version.
      some random error oh no

      Please visit https://github.com/coveo/cli/wiki/Node.js,-NPM-and-NPX-requirements for more detailed installation information.
      `);
    });
  });

  describe('when the installed version of node is lower than the required one', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: '0',
        stderr: '',
        stdout: 'v0.9.0',
      });
    });

    fancyIt()('should throw', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsNodeVersionInRange('>=1.0.0')(fakeCommand)).rejects
        .toThrow(dedent`
        foo needs a Node.js version in this range: ">=1.0.0"
        Version detected: v0.9.0

        Please visit https://github.com/coveo/cli/wiki/Node.js,-NPM-and-NPX-requirements for more detailed installation information.
      `);
    });
  });

  describe('when the installed version of node is above than the required one', () => {
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
        IsNodeVersionInRange('>=1.0.0')(fakeCommand)
      ).resolves.not.toThrow();
    });
  });

  describe('when the installed version of node is the same as the required one', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: '0',
        stderr: '',
        stdout: 'v1.0.0',
      });
    });

    fancyIt()('should not throw', async () => {
      const fakeCommand = getFakeCommand();

      await expect(
        IsNodeVersionInRange('>=1.0.0')(fakeCommand)
      ).resolves.not.toThrow();
    });
  });
});
