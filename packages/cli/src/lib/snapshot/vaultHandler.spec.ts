jest.mock('open');
jest.mock('fs-extra');
jest.mock('../../lib/platform/authenticatedClient');

import {ResourceSnapshotType} from '@coveord/platform-client';
import {VaultEntryAttributes} from './snapshotReporter';
import {VaultHandler} from './vaultHandler';
import {AuthenticatedClient} from '../platform/authenticatedClient';
import {readJsonSync, rmSync, writeJsonSync} from 'fs-extra';
import open from 'open';
import {CliUx} from '@oclif/core';

const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);
const mockedCreate = jest.fn();
const mockedPrompt = jest.fn();
const mockedWriteJsonSync = jest.mocked(writeJsonSync);
const mockedReadJsonSync = jest.mocked(readJsonSync);
const mockedRmSync = jest.mocked(rmSync);
const mockedOpen = jest.mocked(open);
const mockedCliUx = jest.spyOn(CliUx.ux, 'warn');

const doMockPrompt = () => {
  Object.defineProperty(CliUx.ux, 'prompt', {value: mockedPrompt});
};
const doMockAuthenticatedClient = () => {
  mockedAuthenticatedClient.mockImplementation(
    () =>
      ({
        getClient: () => Promise.resolve({vault: {create: mockedCreate}}),
      } as unknown as AuthenticatedClient)
  );
};

describe('VaultHandler', () => {
  const vaultEntryFile = 'myorgid-vault.json';
  const vault = new VaultHandler('myorgid');
  const anyKey = 'a';
  const abortKey = 'q';

  beforeAll(() => {
    doMockPrompt();
    doMockAuthenticatedClient();
  });

  beforeEach(async () => {
    const vaultEntries: VaultEntryAttributes[] = [
      {
        vaultEntryId: 'sitemap_yyyyyy-configuration.json.path',
        resourceName: 'sitemap_yyyyyy',
        resourceType: ResourceSnapshotType.source,
      },
      {
        vaultEntryId: 'web_xxxxxx-configuration.json.path',
        resourceName: 'web_xxxxxx',
        resourceType: ResourceSnapshotType.source,
      },
    ];
    await vault.createEntries(vaultEntries);
  });

  afterAll(() => {
    mockedPrompt.mockReset();
    mockedReadJsonSync.mockReset();
  });

  describe('when the vault entries are valid', () => {
    beforeAll(() => {
      mockedReadJsonSync.mockReturnValue({
        'sitemap_yyyyyy-configuration.json.path': 'secret',
        'web_xxxxxx-configuration.json.path': 'another-secret',
      });
      mockedPrompt.mockReturnValue(anyKey);
    });

    it('#createEntries should create a file with missing vault entries', () => {
      expect(mockedWriteJsonSync).toHaveBeenCalledWith(
        expect.stringContaining(vaultEntryFile),
        {
          'sitemap_yyyyyy-configuration.json.path': '',
          'web_xxxxxx-configuration.json.path': '',
        },
        {spaces: 4}
      );
    });

    it('#createEntries should open the right file', () => {
      expect(mockedOpen).toHaveBeenCalledWith(
        expect.stringContaining(vaultEntryFile)
      );
    });

    it('#createEntries should send as many requests as there is entries to create', () => {
      expect(mockedCreate).toHaveBeenCalledTimes(2);
    });

    it('#createEntries should delete file', () => {
      expect(mockedRmSync).toBeCalledWith(
        expect.stringContaining(vaultEntryFile)
      );
    });

    it.each([
      {
        idx: 1,
        jsonPath: 'configuration.json.path',
        resourceName: 'sitemap_yyyyyy',
        key: 'sitemap_yyyyyy-configuration.json.path',
        value: 'secret',
      },
      {
        idx: 2,
        jsonPath: 'configuration.json.path',
        resourceName: 'web_xxxxxx',
        key: 'web_xxxxxx-configuration.json.path',
        value: 'another-secret',
      },
    ])(
      '#createEntries should send requests to create vault entries',
      ({idx, jsonPath, key, resourceName, value}) => {
        expect(mockedCreate).toHaveBeenNthCalledWith(idx, {
          attributeReferences: [
            {
              jsonPath,
              resourceName,
              resourceType: 'SOURCE',
            },
          ],
          key,
          organizationId: 'myorgid',
          value,
          valueType: 'STRING',
          vaultVisibilityType: 'STRICT',
        });
      }
    );
  });

  describe('when the user does not fill all the vault entries values', () => {
    beforeAll(() => {
      mockedReadJsonSync
        .mockReturnValueOnce({
          'sitemap_yyyyyy-configuration.json.path': '',
          'web_xxxxxx-configuration.json.path': '',
        })
        .mockReturnValueOnce({
          'sitemap_yyyyyy-configuration.json.path': 'secret',
          'web_xxxxxx-configuration.json.path': 'another-secret',
        });
      mockedPrompt.mockReturnValue(anyKey);
    });

    it('#createEntries should warn the user about missing vault entries', () => {
      expect(mockedCliUx).toMatchSnapshot();
    });
  });

  describe('when the user refuses to create missing vault entries', () => {
    beforeAll(() => {
      mockedPrompt.mockReturnValue(abortKey);
    });

    it('#createEntries should not create vault entries', () => {
      expect(mockedCreate).not.toHaveBeenCalled();
    });
  });
});
