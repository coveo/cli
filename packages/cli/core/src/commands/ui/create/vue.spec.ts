jest.mock('../../../lib/decorators/preconditions/npx');
jest.mock('../../../lib/decorators/preconditions/node');
jest.mock('@coveo/cli-commons/preconditions/apiKeyPrivilege');
jest.mock('@coveo/cli-commons/preconditions/trackable');
jest.mock('@coveo/cli-commons/preconditions/authenticated');

jest.mock('@coveo/cli-commons/utils/os');
jest.mock('@coveo/cli-commons/config/config');
jest.mock('@coveo/cli-commons/platform/authenticatedClient');
jest.mock('@coveo/platform-client');

jest.mock('../../../lib/utils/process');
jest.mock('../../../lib/oauth/oauth');
jest.mock('../../../lib/utils/misc');
jest.mock('../../../lib/ui/shared');

jest.mock('node:fs');
jest.mock('node:path');
jest.mock('node:process', () => ({
  cwd: () => '/foo/bar',
}));

import {join} from 'node:path';
import {join as posixJoin} from 'node:path/posix';
import {spawnProcess} from '../../../lib/utils/process';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import PlatformClient from '@coveo/platform-client';
import {Config} from '@coveo/cli-commons/config/config';
import {getPackageVersion} from '../../../lib/utils/misc';
import {configurationMock} from '../../../__stub__/configuration';
import {Stats, statSync, readdirSync, mkdirSync, writeFileSync} from 'node:fs';
import {formatAbsolutePath} from '@coveo/cli-commons-dev/testUtils/jestSnapshotUtils';
import {appendCmdIfWindows} from '@coveo/cli-commons/utils/os';
import {promptForSearchHub} from '../../../lib/ui/shared';
import {getFile} from '@coveo/cli-commons-dev/testUtils/fsUtils';
import Vue from './vue';

describe('ui:create:vue', () => {
  const mockedConfig = jest.mocked(Config);
  const mockedSpawnProcess = jest.mocked(spawnProcess);
  const mockedPlatformClient = jest.mocked(PlatformClient);
  const mockedGetPackageVersion = jest.mocked(getPackageVersion);
  const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);
  const mockedPromptForSearchHub = jest.mocked(promptForSearchHub);
  const mockedStatSync = jest.mocked(statSync);
  const mockedReadDirSync = jest.mocked(readdirSync);
  const mockedMkdirSync = jest.mocked(mkdirSync);
  const mockedWriteFileSync = jest.mocked(writeFileSync);
  const mockAppendCmdIfWindows = jest.mocked(appendCmdIfWindows);
  const mockedPathJoin = jest.mocked(join);
  const fooBarDirectoryMatcher = /(\w:)?(\\|\/)foo(\\|\/)bar(\\|\/)myapp/gm;
  const mockedCreateImpersonateApiKey = jest.fn();

  const doMockSpawnProcess = () => {
    mockedSpawnProcess.mockResolvedValue(0);
  };

  const doMockedGetPackageVersion = () => {
    mockedGetPackageVersion.mockReturnValue('1.0.0');
  };

  const doMockConfiguration = () => {
    mockedConfig.mockImplementation(configurationMock());
  };

  const doMockAuthenticatedClient = () => {
    mockedCreateImpersonateApiKey.mockImplementation((_name: string) =>
      Promise.resolve({value: 'foo'})
    );

    mockedAuthenticatedClient.mockImplementation(
      () =>
        ({
          createImpersonateApiKey: mockedCreateImpersonateApiKey,
          getUsername: () => Promise.resolve('bob@coveo.com'),
          getClient: () =>
            Promise.resolve(
              mockedPlatformClient.getMockImplementation()!({
                accessToken: 'foo',
                organizationId: 'my-org',
              })
            ),
          cfg: mockedConfig.getMockImplementation()!('./'),
        }) as unknown as AuthenticatedClient
    );
  };

  const doMockPlatformClient = () => {
    mockedPlatformClient.mockImplementation(
      () =>
        ({
          initialize: () => Promise.resolve(),
        }) as PlatformClient
    );
  };

  const doMockAppendCmdIfWindows = () => {
    mockAppendCmdIfWindows.mockImplementation(
      (input: TemplateStringsArray) => `${input}`
    );
  };

  const doMockPathJoin = () => {
    mockedPathJoin.mockImplementation(posixJoin);
  };

  const createCommand = (options: {name: string; version: string}) => {
    const command = new Vue(
      [] as string[],
      {
        bin: 'coveo',
        configDir: './',
      } as any
    );
    (command as any).config = {configDir: './'};
    (command as any).log = jest.fn();
    (command as any).error = jest.fn((message: string | Error) => {
      throw message instanceof Error ? message : new Error(message);
    });
    (command as any).parse = jest.fn().mockResolvedValue({
      args: {name: options.name},
      flags: {version: options.version},
    });

    return command;
  };

  const runCommand = async (
    options: {name?: string; version?: string} = {}
  ) => {
    const name = options.name ?? 'myapp';
    const version = options.version ?? '1.0.0';
    const command = createCommand({name, version});
    const dirName = posixJoin('/foo/bar', name);

    command['createDirectory'](dirName);
    await command['initializeProject'](dirName, version);
    await command['installDependencies'](dirName);
    await command['createEnvFile'](dirName);
    command['displayFeedbackAfterSuccess'](name);
  };

  const captureErrorMessage = async (
    options: {name?: string; version?: string} = {}
  ) => {
    try {
      await runCommand(options);
      throw new Error('Expected command to fail');
    } catch (error) {
      return formatAbsolutePath((error as Error).message);
    }
  };

  beforeEach(() => {
    doMockedGetPackageVersion();
    doMockSpawnProcess();
    doMockPlatformClient();
    doMockConfiguration();
    doMockAuthenticatedClient();
    doMockPathJoin();
    doMockAppendCmdIfWindows();
    mockedPromptForSearchHub.mockResolvedValue('default');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when a file with the projectName exists', () => {
    beforeEach(() => {
      mockedStatSync.mockReturnValue({
        isDirectory: () => false,
      } as unknown as Stats);
    });

    it('should exit with an error', async () => {
      await expect(captureErrorMessage()).resolves.toMatchSnapshot();
      expect(mockedSpawnProcess).not.toHaveBeenCalled();
    });
  });

  describe('when a directory with the projectName exists', () => {
    beforeEach(() => {
      mockedStatSync.mockReturnValue({
        isDirectory: () => true,
      } as unknown as Stats);
    });

    describe('when the directory is not empty', () => {
      beforeEach(() => {
        mockedReadDirSync.mockReturnValue([getFile('existing-file')]);
      });

      it('should exit with an error', async () => {
        await expect(captureErrorMessage()).resolves.toMatchSnapshot();
        expect(mockedSpawnProcess).not.toHaveBeenCalled();
      });
    });

    describe('when the directory is empty', () => {
      beforeEach(() => {
        mockedReadDirSync.mockReturnValue([]);
      });

      it('should not try to create the dir', async () => {
        await runCommand();
        expect(mockedMkdirSync).not.toHaveBeenCalled();
      });

      it('should scaffold the project with npm init', async () => {
        await runCommand();
        expect(mockedSpawnProcess).toHaveBeenNthCalledWith(
          1,
          'npm',
          ['init', expect.stringContaining('@coveo/headless-vue')],
          {cwd: '/foo/bar/myapp'}
        );
      });

      it('should install the dependencies', async () => {
        await runCommand();
        expect(mockedSpawnProcess).toHaveBeenNthCalledWith(
          2,
          'npm',
          ['install'],
          {cwd: '/foo/bar/myapp'}
        );
      });

      it('should write the .env file', async () => {
        await runCommand();
        expect(mockedWriteFileSync).toHaveBeenCalledTimes(1);
        expect(mockedWriteFileSync.mock.calls[0]).toMatchSnapshot();
      });
    });
  });

  describe('when the projectName does not exists yet', () => {
    beforeEach(() => {
      mockedStatSync.mockReturnValue(undefined);
    });

    it('should create the dir', async () => {
      await runCommand();
      expect(mockedMkdirSync).toHaveBeenCalledWith(
        expect.stringMatching(fooBarDirectoryMatcher)
      );
    });

    it('should scaffold the project with npm init', async () => {
      await runCommand();
      expect(mockedSpawnProcess).toHaveBeenNthCalledWith(
        1,
        'npm',
        ['init', expect.stringContaining('@coveo/headless-vue')],
        {cwd: '/foo/bar/myapp'}
      );
    });

    it('should install the dependencies', async () => {
      await runCommand();
      expect(mockedSpawnProcess).toHaveBeenNthCalledWith(
        2,
        'npm',
        ['install'],
        {cwd: '/foo/bar/myapp'}
      );
    });

    it('should write the .env file', async () => {
      await runCommand();
      expect(mockedWriteFileSync).toHaveBeenCalledTimes(1);
      expect(mockedWriteFileSync.mock.calls[0]).toMatchSnapshot();
    });
  });
});
