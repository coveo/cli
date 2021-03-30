jest.mock('../../utils/process');

import type Command from '@oclif/command';
import * as dedent from 'dedent';
import {constants} from 'os';
import {mocked} from 'ts-jest/utils';
import {spawnProcessOutput} from '../../utils/process';

import {IsNodeVersionAbove} from './node';

describe('IsNodeVersionAbove', () => {
  const mockedSpawnProcessOutput = mocked(spawnProcessOutput);
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when the requiredVersion is not a semver valid string', () => {
    it('should return false and warn', async () => {
      const fakeCommand = {
        warn: jest.fn(),
      };

      await expect(
        IsNodeVersionAbove('foo')((fakeCommand as unknown) as Command)
      ).resolves.toBe(false);
      expect(fakeCommand.warn).toHaveBeenCalledTimes(1);
      expect(fakeCommand.warn).toHaveBeenCalledWith(dedent`
        Required version invalid: "foo".
        Please report this error to Coveo: https://github.com/coveo/cli/issues/new
      `);
    });
  });

  describe('when Node.js is not installed', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: constants.errno.ENOENT,
        stderr: '',
        stdout: '',
      });
    });

    it('should return false and warn', async () => {
      const fakeCommand = {
        id: 'foo',
        warn: jest.fn(),
      };

      await expect(
        IsNodeVersionAbove('0.0.1')((fakeCommand as unknown) as Command)
      ).resolves.toBe(false);
      expect(fakeCommand.warn).toHaveBeenCalledTimes(2);
      expect(fakeCommand.warn).toHaveBeenCalledWith(
        'foo requires Node.js to run.'
      );
      expect(fakeCommand.warn).toHaveBeenCalledWith(dedent`
       Please visit https://github.com/coveo/cli/wiki/Node.js,-NPM-and-NPX-requirements for more detailed installation information.
      `);
    });
  });

  describe('when an unknown error happens while getting the node version', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: 1,
        stderr: 'some random error oh no',
        stdout: '',
      });
    });

    it('should return false and warn', async () => {
      const fakeCommand = {
        id: 'foo',
        warn: jest.fn(),
      };

      await expect(
        IsNodeVersionAbove('0.0.1')((fakeCommand as unknown) as Command)
      ).resolves.toBe(false);
      expect(fakeCommand.warn).toHaveBeenCalledTimes(2);
      expect(fakeCommand.warn).toHaveBeenCalledWith(dedent`
        foo requires a valid Node.js installation to run.
        An unknown error happened while trying to determine your node version with node --version
        some random error oh no
      `);
      expect(fakeCommand.warn).toHaveBeenCalledWith(dedent`
        Please visit https://github.com/coveo/cli/wiki/Node.js,-NPM-and-NPX-requirements for more detailed installation information.
      `);
    });
  });

  describe('when the installed version of node is lower than the required one', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: 0,
        stderr: '',
        stdout: 'v0.9.0',
      });
    });

    it('should return false and warn', async () => {
      const fakeCommand = {
        id: 'foo',
        warn: jest.fn(),
      };

      await expect(
        IsNodeVersionAbove('1.0.0')((fakeCommand as unknown) as Command)
      ).resolves.toBe(false);
      expect(fakeCommand.warn).toHaveBeenCalledTimes(2);
      expect(fakeCommand.warn).toHaveBeenCalledWith(dedent`
        foo needs a Node.js version greater than 1.0.0
        Version detected: v0.9.0
      `);
      expect(fakeCommand.warn).toHaveBeenCalledWith(dedent`
        Please visit https://github.com/coveo/cli/wiki/Node.js,-NPM-and-NPX-requirements for more detailed installation information.
      `);
    });
  });

  describe('when the installed version of node is above than the required one', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: 0,
        stderr: '',
        stdout: 'v1.1.0',
      });
    });

    it('should return true and not warn', async () => {
      const fakeCommand = {
        id: 'foo',
        warn: jest.fn(),
      };

      await expect(
        IsNodeVersionAbove('1.0.0')((fakeCommand as unknown) as Command)
      ).resolves.toBe(true);
      expect(fakeCommand.warn).toHaveBeenCalledTimes(0);
    });
  });

  describe('when the installed version of node is the same as the required one', () => {
    beforeEach(() => {
      mockedSpawnProcessOutput.mockResolvedValue({
        exitCode: 0,
        stderr: '',
        stdout: 'v1.0.0',
      });
    });

    it('should return true and not warn', async () => {
      const fakeCommand = {
        id: 'foo',
        warn: jest.fn(),
      };

      await expect(
        IsNodeVersionAbove('1.0.0')((fakeCommand as unknown) as Command)
      ).resolves.toBe(true);
      expect(fakeCommand.warn).toHaveBeenCalledTimes(0);
    });
  });
});
