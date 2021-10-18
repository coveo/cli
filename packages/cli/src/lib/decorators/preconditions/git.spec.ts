jest.mock('../../utils/process');

import {dedent} from 'ts-dedent';
import {mocked} from 'ts-jest/utils';
import {spawnProcessOutput} from '../../utils/process';
import {getFakeCommand} from './testsUtils/utils';

import {IsGitInstalled} from './git';
import {fancyIt} from '../../../__test__/it';

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

      await expect(IsGitInstalled()(fakeCommand)).resolves.toBe(false);
      expect(fakeCommand.warn).toHaveBeenCalledTimes(2);
      expect(fakeCommand.warn).toHaveBeenNthCalledWith(
        1,
        'foo requires Git to run.'
      );
      expect(fakeCommand.warn).toHaveBeenNthCalledWith(
        2,
        dedent`
       Please visit https://git-scm.com/book/en/v2/Getting-Started-Installing-Git for more detailed installation information.
      `
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

    fancyIt()('should return false and warn', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsGitInstalled()(fakeCommand)).resolves.toBe(false);
      expect(fakeCommand.warn).toHaveBeenCalledTimes(2);
      expect(fakeCommand.warn).toHaveBeenCalledWith(dedent`
        foo requires a valid Git installation to run.
        An unknown error happened while running git --version.
        some random error oh no
      `);
      expect(fakeCommand.warn).toHaveBeenCalledWith(dedent`
        Please visit https://git-scm.com/book/en/v2/Getting-Started-Installing-Git for more detailed installation information.
      `);
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

    fancyIt()('should return true and not warn', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsGitInstalled()(fakeCommand)).resolves.toBe(true);
      expect(fakeCommand.warn).toHaveBeenCalledTimes(0);
    });
  });
});
