jest.mock('../../utils/process');

import {dedent} from 'ts-dedent';
import {mocked} from 'jest-mock';
import {spawnProcessOutput} from '../../utils/process';
import {getFakeCommand} from './testsUtils/utils';

import {IsGitInstalled} from './git';
import {fancyIt} from '../../../__test__/it';
import {PreconditionError} from '../../errors/preconditionError';

describe('IsGitInstalled', () => {
  const mockedSpawnProcessOutput = mocked(spawnProcessOutput);
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when git is not installed', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: 'ENOENT',
        stderr: '',
        stdout: '',
      });
    });

    fancyIt()('should return false and warn', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsGitInstalled()(fakeCommand)).rejects.toThrow(
        new PreconditionError(dedent`foo requires Git to run.

      Please visit https://git-scm.com/book/en/v2/Getting-Started-Installing-Git for more detailed installation information.`)
      );
    });
  });

  describe('when an unknown error happens while checking for git', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: '1',
        stderr: 'some random error oh no',
        stdout: '',
      });
    });

    fancyIt()('should throw and warn', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsGitInstalled()(fakeCommand)).rejects.toThrow(
        new PreconditionError(dedent`
        foo requires a valid Git installation to run.
        An unknown error happened while running git --version.
        some random error oh no

        Please visit https://git-scm.com/book/en/v2/Getting-Started-Installing-Git for more detailed installation information.
      `)
      );
    });
  });

  describe('when git is installed', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: '0',
        stderr: '',
        stdout: '',
      });
    });

    fancyIt()('should not throw', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsGitInstalled()(fakeCommand)).resolves.not.toThrow();
    });
  });
});
