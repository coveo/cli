jest.mock('./process');

import {mocked} from 'ts-jest/utils';
import {tryGitCommit} from './git';
import {spawnProcess, spawnProcessOutput} from './process';

describe('#tryGitCommit', () => {
  const mockedSpawnProcess = mocked(spawnProcess);
  const mockedSpawnProcessOutput = mocked(spawnProcessOutput);
  const mockIsValidGitRepo = () => {
    mockedSpawnProcessOutput.mockResolvedValue({
      stdout: 'true\n',
      stderr: '',
      exitCode: '0',
    });
  };
  const mockNotAGitRepository = () => {
    mockedSpawnProcessOutput.mockResolvedValue({
      stdout: '',
      stderr:
        'fatal: not a git repository (or any of the parent directories): .git\n',
      exitCode: '128',
    });
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('when the project is not a git repository', () => {
    beforeEach(async () => {
      mockNotAGitRepository();
    });

    it('skip Git commit', async () => {
      await tryGitCommit('path');
      await expect(mockedSpawnProcess).not.toBeCalled();
    });
  });

  describe('when the project is a Git repository', () => {
    beforeEach(async () => {
      mockIsValidGitRepo();
    });

    it('should commit changes', async () => {
      await tryGitCommit('path', 'commit message');
      await expect(mockedSpawnProcess).toHaveBeenNthCalledWith(
        1,
        'git',
        ['add', '-A'],
        {
          stdio: 'ignore',
          cwd: 'path',
        }
      );
      await expect(mockedSpawnProcess).toHaveBeenNthCalledWith(
        2,
        'git',
        ['commit', '-m', 'commit message'],
        {
          stdio: 'ignore',
          cwd: 'path',
        }
      );
    });
  });
});
