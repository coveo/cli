jest.mock('./process');
jest.mock('./os');

import {mocked} from 'ts-jest/utils';
import {npxInPty} from './npx';
import {appendCmdIfWindows} from './os';
import {spawnProcessOutput, spawnProcessPTY} from './process';

describe('#npxInPty', () => {
  const mockedSpawnProcessOutput = mocked(spawnProcessOutput);
  const mockedSpawnProcessPTY = mocked(spawnProcessPTY);
  const mockNpxVersion = (output: string) =>
    mockedSpawnProcessOutput.mockResolvedValue({
      exitCode: '0',
      stdout: output,
      stderr: '',
    });
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('when npx --version returned string is not a semantic version', () => {
    beforeEach(async () => {
      mockNpxVersion('this is not a version');
    });

    it('should throw an Error', async () => {
      await expect(npxInPty([])).rejects.toEqual(
        'Failed to check NPX version.'
      );
    });
  });

  describe('when npx --version returned a version greater or equal to 7', () => {
    beforeEach(async () => {
      mockNpxVersion('7.0.0');
    });

    it('should spawn npx with the --yes flag', async () => {
      await npxInPty(['potato']);

      expect(mockedSpawnProcessPTY).toHaveBeenCalledWith(
        appendCmdIfWindows`npx`,
        ['--yes', 'potato'],
        {}
      );
    });
  });

  describe('when npx --version returned a version lesser than 7', () => {
    beforeEach(async () => {
      mockNpxVersion('6.0.0');
    });

    it('should spawn npx without the --yes flag', async () => {
      await npxInPty(['potato']);

      expect(mockedSpawnProcessPTY).toHaveBeenCalledWith(
        appendCmdIfWindows`npx`,
        ['potato'],
        {}
      );
    });
  });
});
