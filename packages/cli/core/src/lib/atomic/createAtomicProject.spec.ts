jest.mock('node:fs');
import {mkdirSync} from 'node:fs';
jest.mock('node:path');
import {resolve} from 'node:path';

jest.mock('@coveo/cli-commons/platform/authenticatedClient');
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {PlatformEnvironment} from '@coveo/cli-commons/platform/environment';
import {Region} from '@coveo/platform-client';
jest.mock('../utils/process');
import {spawnProcess} from '../utils/process';
jest.mock('../utils/os');
import {appendCmdIfWindows} from '../utils/os';
jest.mock('../utils/misc');
import {getPackageVersion} from '../utils/misc';

import {createAtomicApp, createAtomicLib} from './createAtomicProject';

describe('createAtomicProject', () => {
  const mockedSpawnProcess = jest.mocked(spawnProcess);
  const mockedAppendCmdIfWindows = jest.mocked(appendCmdIfWindows);
  const mockedGetPackageVersion = jest.mocked(getPackageVersion);
  beforeEach(() => {
    jest.resetAllMocks();
    mockedAppendCmdIfWindows.mockImplementation((input) => `${input}`);
    mockedGetPackageVersion.mockReturnValue('1.2.3');
  });

  describe('createAtomicApp()', () => {
    const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);
    const doMockAuthenticatedClient = () => {
      mockedAuthenticatedClient.mockImplementation(
        () =>
          ({
            createImpersonateApiKey: jest.fn(),
            getUsername: () => Promise.resolve('bob@coveo.com'),
          } as unknown as AuthenticatedClient)
      );
    };

    const callOptions = {
      cfg: {
        accessToken: 'someToken',
        environment: PlatformEnvironment.Dev,
        organization: 'bobbyOrg',
        region: Region.AU,
        version: '1.0.0',
      },
      projectName: 'potato',
    };

    beforeEach(() => {
      doMockAuthenticatedClient();
    });

    describe('without options.pageId', () => {
      it('calls `npx @coveo/create-atomic` properly', async () => {
        await createAtomicApp({...callOptions});
        expect(mockedSpawnProcess).toBeCalledTimes(1);
        expect(mockedSpawnProcess.mock.lastCall).toMatchSnapshot();
      });
    });

    describe('with options.pageId', () => {
      it('calls `npx @coveo/create-atomic` properly', async () => {
        await createAtomicApp({...callOptions, pageId: 'pageId'});
        expect(mockedSpawnProcess).toBeCalledTimes(1);
        expect(mockedSpawnProcess.mock.lastCall).toMatchSnapshot();
      });
    });

    describe('with options.initializerVersion set', () => {
      it('calls `npx @coveo/create-atomic` properly', async () => {
        await createAtomicApp({
          ...callOptions,
          initializerVersion: 'test',
          pageId: 'pageId',
        });
        expect(mockedSpawnProcess).toBeCalledTimes(1);
        expect(mockedSpawnProcess.mock.lastCall).toMatchSnapshot();
      });
    });

    describe('without options.initializerVersion', () => {
      it('calls `npx @coveo/create-atomic` properly and calls getPackageVersion', async () => {
        await createAtomicApp({
          ...callOptions,
          initializerVersion: undefined,
          pageId: 'pageId',
        });
        expect(mockedGetPackageVersion).toBeCalledTimes(1);
        expect(mockedSpawnProcess).toBeCalledTimes(1);
        expect(mockedSpawnProcess.mock.lastCall).toMatchSnapshot();
      });
    });
  });

  describe('createAtomicLib()', () => {
    const mockedResolve = jest.mocked(resolve);
    const mockedMkdirSync = jest.mocked(mkdirSync);
    beforeEach(() => {
      mockedResolve.mockImplementation((input) => input);
    });

    it('should initialize the projectDirectory', async () => {
      await createAtomicLib({projectName: 'kewlProject'});

      expect(mockedResolve).toBeCalledTimes(1);
      expect(mockedResolve).toBeCalledWith('kewlProject');
      expect(mockedMkdirSync).toBeCalledTimes(1);
      expect(mockedMkdirSync).toBeCalledWith('kewlProject');
    });

    it('calls `npx @coveo/create-atomic-component-project` properly', async () => {
      await createAtomicLib({projectName: 'kewlProject'});

      expect(mockedSpawnProcess).toBeCalledTimes(1);
      expect(mockedSpawnProcess.mock.lastCall).toMatchSnapshot();
    });
  });
});
