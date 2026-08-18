jest.mock('node:fs');
jest.mock('../utils/process');
jest.mock('../utils/misc');
jest.mock('@coveo/cli-commons/platform/authenticatedClient');
jest.mock('@coveo/platform-client');
jest.mock('../ui/shared');

import {readFileSync, writeFileSync} from 'node:fs';
import {spawnProcess} from '../utils/process';
import {createAtomicApp} from './createAtomicProject';
import {Configuration} from '@coveo/cli-commons/config/config';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import PlatformClient from '@coveo/platform-client';
import {getPackageVersion} from '../utils/misc';
import {promptForSearchHub} from '../ui/shared';

describe('createAtomicProject', () => {
  const mockedReadFileSync = jest.mocked(readFileSync);
  const mockedWriteFileSync = jest.mocked(writeFileSync);
  const mockedSpawnProcess = jest.mocked(spawnProcess);
  const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);
  const mockedPlatformClient = jest.mocked(PlatformClient);
  const mockedGetPackageVersion = jest.mocked(getPackageVersion);
  const mockedPromptForSearchHub = jest.mocked(promptForSearchHub);

  const mockConfig: Configuration = {
    organization: 'test-org',
    accessToken: 'test-token',
    environment: 'dev',
    region: 'us',
  } as Configuration;

  const originalNodeVersion = process.version;

  beforeEach(() => {
    jest.clearAllMocks();

    mockedGetPackageVersion.mockReturnValue('1.0.0');
    mockedSpawnProcess.mockResolvedValue(0);
    mockedPromptForSearchHub.mockResolvedValue('default');

    mockedPlatformClient.mockImplementation(
      () =>
        ({
          initialize: () => Promise.resolve(),
          search: {
            listSearchHubs: () =>
              Promise.resolve([{id: 'default', name: 'Default'}]),
          },
        } as unknown as PlatformClient)
    );

    mockedAuthenticatedClient.mockImplementation(
      () =>
        ({
          getUsername: () => Promise.resolve('test@example.com'),
          getClient: () =>
            Promise.resolve(
              mockedPlatformClient.getMockImplementation()!({
                accessToken: 'test-token',
                organizationId: 'test-org',
              })
            ),
        } as unknown as AuthenticatedClient)
    );
  });

  afterEach(() => {
    // Restore original Node version
    Object.defineProperty(process, 'version', {
      value: originalNodeVersion,
      writable: true,
    });
  });

  // Helper function to extract written package.json content from mock
  const getWrittenPackageJson = () => {
    return JSON.parse(mockedWriteFileSync.mock.calls[0][1].toString().trim());
  };

  describe('when Node version is < 20.19.0', () => {
    beforeEach(() => {
      // Mock Node version to 20.18.0
      Object.defineProperty(process, 'version', {
        value: 'v20.18.0',
        writable: true,
      });
    });

    it('should patch package.json scripts when project creation succeeds', async () => {
      const mockPackageJson = {
        name: 'test-project',
        scripts: {
          start: 'stencil build --dev --watch --serve',
          build: 'stencil build && node deployment.esbuild.mjs',
        },
      };

      mockedReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      await createAtomicApp({
        projectName: 'test-project',
        cfg: mockConfig,
      });

      expect(mockedReadFileSync).toHaveBeenCalledWith(
        expect.stringContaining('test-project/package.json'),
        'utf8'
      );

      expect(mockedWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('test-project/package.json'),
        expect.stringContaining('--experimental-detect-module'),
        'utf8'
      );

      const writtenContent = getWrittenPackageJson();
      expect(writtenContent.scripts.start).toContain(
        '--experimental-detect-module'
      );
      expect(writtenContent.scripts.build).toContain(
        '--experimental-detect-module'
      );
    });

    it('should not patch package.json if project creation fails', async () => {
      mockedSpawnProcess.mockResolvedValue(1);

      await createAtomicApp({
        projectName: 'test-project',
        cfg: mockConfig,
      });

      expect(mockedReadFileSync).not.toHaveBeenCalled();
      expect(mockedWriteFileSync).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully when patching fails', async () => {
      mockedReadFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await createAtomicApp({
        projectName: 'test-project',
        cfg: mockConfig,
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Could not modify package.json scripts')
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('when Node version is >= 20.19.0', () => {
    beforeEach(() => {
      // Mock Node version to 20.19.0
      Object.defineProperty(process, 'version', {
        value: 'v20.19.0',
        writable: true,
      });
    });

    it('should not patch package.json scripts', async () => {
      await createAtomicApp({
        projectName: 'test-project',
        cfg: mockConfig,
      });

      expect(mockedReadFileSync).not.toHaveBeenCalled();
      expect(mockedWriteFileSync).not.toHaveBeenCalled();
    });
  });

  describe('when Node version is 22.x', () => {
    beforeEach(() => {
      // Mock Node version to 22.0.0
      Object.defineProperty(process, 'version', {
        value: 'v22.0.0',
        writable: true,
      });
    });

    it('should not patch package.json scripts', async () => {
      await createAtomicApp({
        projectName: 'test-project',
        cfg: mockConfig,
      });

      expect(mockedReadFileSync).not.toHaveBeenCalled();
      expect(mockedWriteFileSync).not.toHaveBeenCalled();
    });
  });

  describe('package.json patching logic', () => {
    beforeEach(() => {
      Object.defineProperty(process, 'version', {
        value: 'v20.18.0',
        writable: true,
      });
    });

    it('should correctly replace stencil command in start script', async () => {
      const mockPackageJson = {
        scripts: {
          start: 'stencil build --dev --watch --serve',
        },
      };

      mockedReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      await createAtomicApp({
        projectName: 'test-project',
        cfg: mockConfig,
      });

      const writtenContent = getWrittenPackageJson();
      expect(writtenContent.scripts.start).toBe(
        'node --experimental-detect-module ./node_modules/.bin/stencil build --dev --watch --serve'
      );
    });

    it('should correctly replace stencil command in build script', async () => {
      const mockPackageJson = {
        scripts: {
          build: 'stencil build && node deployment.esbuild.mjs',
        },
      };

      mockedReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      await createAtomicApp({
        projectName: 'test-project',
        cfg: mockConfig,
      });

      const writtenContent = getWrittenPackageJson();
      expect(writtenContent.scripts.build).toBe(
        'node --experimental-detect-module ./node_modules/.bin/stencil build && node deployment.esbuild.mjs'
      );
    });

    it('should not modify scripts that do not contain stencil', async () => {
      const mockPackageJson = {
        scripts: {
          start: 'echo "no stencil here"',
          build: 'tsc',
          test: 'jest',
        },
      };

      mockedReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      await createAtomicApp({
        projectName: 'test-project',
        cfg: mockConfig,
      });

      const writtenContent = getWrittenPackageJson();
      expect(writtenContent.scripts.start).toBe('echo "no stencil here"');
      expect(writtenContent.scripts.build).toBe('tsc');
      expect(writtenContent.scripts.test).toBe('jest');
    });
  });
});
