jest.mock('../../utils/process');

import {dedent} from 'ts-dedent';
import {spawnProcessOutput} from '../../utils/process';
import {getFakeCommand} from './testsUtils/utils';

import {IsNpxInstalled} from './npx';
import {appendCmdIfWindows} from '../../utils/os';
import {fancyIt} from '../../../__test__/it';
import {PreconditionError} from '../../errors/preconditionError';

describe('IsNpxInstalled', () => {
  const mockedSpawnProcessOutput = jest.mocked(spawnProcessOutput);
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

    fancyIt()('should throw', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsNpxInstalled()(fakeCommand)).rejects.toThrow(
        new PreconditionError(dedent`foo requires npx to run.

        Newer version Node.js comes bundled with npx.

        Please visit https://github.com/coveo/cli/wiki/Node.js,-NPM-and-NPX-requirements for more detailed installation information.
        `)
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

    fancyIt()('should throw', async () => {
      const fakeCommand = getFakeCommand();

      await expect(IsNpxInstalled()(fakeCommand)).rejects.toThrow(
        new PreconditionError(dedent`
        foo requires a valid npx installation to run.
        An unknown error happened while running ${appendCmdIfWindows`npx`} --version.
        some random error oh no

        Newer version Node.js comes bundled with npx.

        Please visit https://github.com/coveo/cli/wiki/Node.js,-NPM-and-NPX-requirements for more detailed installation information.
        `)
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

      await expect(IsNpxInstalled()(fakeCommand)).resolves.not.toThrow();
    });
  });
});
