jest.mock('@coveord/platform-client');

import {fancyIt} from '@coveo/cli-commons-dev/testUtils/it';
import PlatformClient, {ResourceSnapshotType} from '@coveord/platform-client';
import {
  MissingResourcePrivileges,
  MissingSnapshotPrivilege,
} from '../errors/snapshotErrors';
import {ensureResourceAccess, ensureSnapshotAccess} from './snapshotAccess';

const mockedPlatformClient = jest.mocked(PlatformClient);
const mockedListResourceAccess = jest.fn();
const mockedValidateAccess = jest.fn();

const fakeClient = {
  resourceSnapshot: {
    listResourceAccess: mockedListResourceAccess,
    validateAccess: mockedValidateAccess,
  },
} as unknown as PlatformClient;

const doMockAuthenticatedClient = () => {
  mockedPlatformClient.mockImplementation(() => fakeClient);
};

const doMockSufficientResourceAccess = () => {
  const allResources = Object.values(ResourceSnapshotType);
  mockedListResourceAccess.mockResolvedValueOnce(allResources);
  mockedValidateAccess.mockResolvedValueOnce({allowed: true});
};

const doMockedInsufficientResourceAccess = () => {
  mockedListResourceAccess.mockResolvedValueOnce([
    ResourceSnapshotType.field,
    ResourceSnapshotType.extension,
  ]);
  mockedValidateAccess.mockResolvedValueOnce({allowed: false});
};

describe('SnapshotAccess', () => {
  beforeEach(() => {
    doMockAuthenticatedClient();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when the user is missing privileges', () => {
    beforeEach(() => {
      doMockedInsufficientResourceAccess();
    });

    fancyIt()('#ensureResourceAccess should throw', async () => {
      const unauthorizedResources: ResourceSnapshotType[] = [
        ResourceSnapshotType.source,
        ResourceSnapshotType.mlModel,
      ];

      await expect(() =>
        ensureResourceAccess(fakeClient, unauthorizedResources)
      ).rejects.toThrow(MissingResourcePrivileges);
    });

    fancyIt()('#ensureSnapshotAccess should throw', async () => {
      await expect(() =>
        ensureSnapshotAccess(fakeClient, 'snapshotId')
      ).rejects.toThrow(MissingSnapshotPrivilege);
    });
  });

  describe('when the user has all the required privileges', () => {
    beforeEach(() => {
      doMockSufficientResourceAccess();
    });

    fancyIt()('#ensureResourceAccess should not throw', async () => {
      const authorizedResources: ResourceSnapshotType[] = [
        ResourceSnapshotType.source,
        ResourceSnapshotType.mlModel,
      ];
      await expect(
        ensureResourceAccess(fakeClient, authorizedResources)
      ).resolves.not.toThrow();
    });

    fancyIt()('#ensureSnapshotAccess should not throw', async () => {
      await expect(
        ensureSnapshotAccess(fakeClient, 'snapshotId')
      ).resolves.not.toThrow();
    });
  });
});
