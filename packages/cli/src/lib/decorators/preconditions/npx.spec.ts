jest.mock('../../utils/process');

import * as dedent from 'dedent';
import {constants} from 'os';
import {mocked} from 'ts-jest/utils';
import {spawnProcessOutput} from '../../utils/process';
import {getFakeCommand} from './__tests__/utils.spec';

import {IsNpxInstalled} from './npx';

describe('IsNpxInstalled', () => {
  const mockedSpawnProcessOutput = mocked(spawnProcessOutput);
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when npx is not installed', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: constants.errno.ENOENT,
        stderr: '',
        stdout: '',
      });
    });

    it('should return false and warn', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsNpxInstalled()(fakeCommand)).resolves.toBe(false);
      expect(fakeCommand.warn).toHaveBeenCalledTimes(2);
      expect(fakeCommand.warn).toHaveBeenCalledWith(dedent`
      foo requires npx to run.
      Newer version Node.js comes bundled with npx.
    `);
      expect(fakeCommand.warn).toHaveBeenCalledWith(dedent`
       Please visit https://github.com/coveo/cli/wiki/Node.js,-NPM-and-NPX-requirements for more detailed installation information.
      `);
    });
  });

  describe('when an unknown error happens while checking for npx', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: 1,
        stderr: 'some random error oh no',
        stdout: '',
      });
    });

    it('should return false and warn', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsNpxInstalled()(fakeCommand)).resolves.toBe(false);
      expect(fakeCommand.warn).toHaveBeenCalledTimes(2);
      expect(fakeCommand.warn).toHaveBeenCalledWith(dedent`
        foo requires a valid npx installation to run.
        An unknown error happened while checking for npx with npx --version.
        some random error oh no
      `);
      expect(fakeCommand.warn).toHaveBeenCalledWith(dedent`
        Please visit https://github.com/coveo/cli/wiki/Node.js,-NPM-and-NPX-requirements for more detailed installation information.
      `);
    });
  });

  describe('when npx is installed', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: 0,
        stderr: '',
        stdout: '',
      });
    });

    it('should return true and not warn', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsNpxInstalled()(fakeCommand)).resolves.toBe(true);
      expect(fakeCommand.warn).toHaveBeenCalledTimes(0);
    });
  });
});
