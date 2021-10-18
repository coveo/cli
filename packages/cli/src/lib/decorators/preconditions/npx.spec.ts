jest.mock('../../utils/process');

import {dedent} from 'ts-dedent';
import {mocked} from 'ts-jest/utils';
import {spawnProcessOutput} from '../../utils/process';
import {getFakeCommand} from './testsUtils/utils';

import {IsNpxInstalled} from './npx';
import {appendCmdIfWindows} from '../../utils/os';
import {fancyIt} from '../../../__test__/it';

describe('IsNpxInstalled', () => {
  const mockedSpawnProcessOutput = mocked(spawnProcessOutput);
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when npx is not installed', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: 'ENOENT',
        stderr: '',
        stdout: '',
      });
    });

    fancyIt()('should return false and warn', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsNpxInstalled()(fakeCommand)).resolves.toBe(false);
      expect(fakeCommand.warn).toHaveBeenCalledTimes(3);
      expect(fakeCommand.warn).toHaveBeenNthCalledWith(
        1,
        'foo requires npx to run.'
      );
      expect(fakeCommand.warn).toHaveBeenNthCalledWith(
        2,
        dedent`
       Please visit https://github.com/coveo/cli/wiki/Node.js,-NPM-and-NPX-requirements for more detailed installation information.
      `
      );
      expect(fakeCommand.warn).toHaveBeenNthCalledWith(
        3,
        'Newer version Node.js comes bundled with npx.'
      );
    });
  });

  describe('when an unknown error happens while checking for npx', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: '1',
        stderr: 'some random error oh no',
        stdout: '',
      });
    });

    fancyIt()('should return false and warn', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsNpxInstalled()(fakeCommand)).resolves.toBe(false);
      expect(fakeCommand.warn).toHaveBeenCalledTimes(3);
      expect(fakeCommand.warn).toHaveBeenCalledWith(dedent`
        foo requires a valid npx installation to run.
        An unknown error happened while running ${appendCmdIfWindows`npx`} --version.
        some random error oh no
      `);
      expect(fakeCommand.warn).toHaveBeenCalledWith(dedent`
        Please visit https://github.com/coveo/cli/wiki/Node.js,-NPM-and-NPX-requirements for more detailed installation information.
      `);
      expect(fakeCommand.warn).toHaveBeenCalledWith(
        'Newer version Node.js comes bundled with npx.'
      );
    });
  });

  describe('when npx is installed', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: '0',
        stderr: '',
        stdout: '',
      });
    });

    fancyIt()('should return true and not warn', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsNpxInstalled()(fakeCommand)).resolves.toBe(true);
      expect(fakeCommand.warn).toHaveBeenCalledTimes(0);
    });
  });
});
