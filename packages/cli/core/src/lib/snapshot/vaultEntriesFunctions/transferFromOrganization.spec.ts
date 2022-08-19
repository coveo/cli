jest.mock('@coveo/cli-commons/lib/platform/authenticatedClient');
jest.mock('../../project/project');
jest.mock('../snapshot');
jest.mock('../snapshotReporter');
jest.mock('@oclif/core/lib/cli-ux/prompt');
jest.mock('@oclif/core/lib/errors/index');
jest.mock('../../errors/vaultErrors');

import PlatformClient, {VaultFetchStrategy} from '@coveord/platform-client';
import {confirm} from '@oclif/core/lib/cli-ux/prompt';
import {warn} from '@oclif/core/lib/errors/index';
import {Configuration} from '@coveo/cli-commons/lib/config/config';
import {SnapshotMissingVaultEntriesFromOriginError} from '../../errors/vaultErrors';
import {AuthenticatedClient} from '@coveo/cli-commons/lib/platform/authenticatedClient';
import {Project} from '../../project/project';
import {Snapshot} from '../snapshot';
import {SnapshotReporter} from '../snapshotReporter';
import {tryTransferFromOrganization} from './transferFromOrganization';

describe('#tryTransferFromOrganization', () => {
  const mockedProject = jest.mocked(Project);
  const mockedSnapshotMissingVaultEntriesFromOriginError = jest.mocked(
    SnapshotMissingVaultEntriesFromOriginError
  );
  const mockedCliConfirm = jest.mocked(confirm);
  const mockedCliWarn = jest.mocked(warn);
  const mockedVaultList = jest.fn();
  const mockedVaultImport = jest.fn();
  const mockedGetClient = jest.fn();
  const mockedGetUserHasAccessToOrg = jest.fn();
  const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);

  const doMockProjectWithOriginOrg = () => {
    mockedProject.mockImplementation(
      () =>
        ({
          getResourceManifest: () => ({orgId: 'someOriginOrg'}),
        } as Partial<Project> as Project)
    );
  };

  const doMockUserAnswerYes = () => {
    mockedCliConfirm.mockResolvedValue(true);
  };

  const doMockUserHasAccessToOriginOrg = () => {
    mockedGetUserHasAccessToOrg.mockResolvedValue(true);
  };

  beforeAll(() => {
    mockedAuthenticatedClient.mockImplementation(
      () =>
        ({
          getUserHasAccessToOrg: mockedGetUserHasAccessToOrg,
          getClient: mockedGetClient.mockImplementation(() =>
            Promise.resolve({
              vault: {list: mockedVaultList, import: mockedVaultImport},
            } as unknown as PlatformClient)
          ),
        } as Partial<AuthenticatedClient> as AuthenticatedClient)
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when there is no origin organization attached to the snapshot', () => {
    beforeEach(() => {
      mockedProject.mockImplementation(
        () =>
          ({
            getResourceManifest: () => null,
          } as Partial<Project> as Project)
      );
    });

    it('should return false', async () => {
      expect(
        await tryTransferFromOrganization({
          reporter: {missingVaultEntries: []} as unknown as SnapshotReporter,
          snapshot: {} as Snapshot,
          projectPath: 'somePathYay',
          cfg: {} as Configuration,
        })
      ).toBe(false);
    });
  });

  describe('when the user refuse to transfer', () => {
    beforeEach(() => {
      doMockProjectWithOriginOrg();
      mockedCliConfirm.mockResolvedValue(false);
    });

    it('should return false', async () => {
      expect(
        await tryTransferFromOrganization({
          reporter: {} as SnapshotReporter,
          snapshot: {} as Snapshot,
          projectPath: 'somePathYay',
          cfg: {} as Configuration,
        })
      ).toBe(false);
    });
  });

  describe('when the user does not have access to the origin organization', () => {
    beforeEach(() => {
      doMockProjectWithOriginOrg();
      doMockUserAnswerYes();
      mockedGetUserHasAccessToOrg.mockResolvedValue(false);
    });

    it('should warn the user about their lack of access', async () => {
      await tryTransferFromOrganization({
        reporter: {} as SnapshotReporter,
        snapshot: {} as Snapshot,
        projectPath: 'somePathYay',
        cfg: {} as Configuration,
      });

      expect(mockedCliWarn).toBeCalledTimes(1);
      expect(mockedCliWarn.mock.calls[0][0]).toMatchSnapshot();
    });

    it('should return false', async () => {
      expect(
        await tryTransferFromOrganization({
          reporter: {} as SnapshotReporter,
          snapshot: {} as Snapshot,
          projectPath: 'somePathYay',
          cfg: {} as Configuration,
        })
      ).toBe(false);
    });
  });

  describe('when all the prechecks are OK', () => {
    beforeEach(() => {
      doMockProjectWithOriginOrg();
      doMockUserAnswerYes();
      doMockUserHasAccessToOriginOrg();
    });

    it('should get all the vault entries from the origin organization', async () => {
      const fakeNumberOfPages = 4;
      mockedVaultList.mockResolvedValue({
        totalPages: fakeNumberOfPages,
        items: [],
      });

      await tryTransferFromOrganization({
        reporter: {missingVaultEntries: []} as unknown as SnapshotReporter,
        snapshot: {} as Snapshot,
        projectPath: 'somePathYay',
        cfg: {} as Configuration,
      });

      expect(mockedVaultList).toBeCalledTimes(4);
      for (let i = 0; i < fakeNumberOfPages; i++) {
        expect(mockedVaultList.mock.calls[i][0]).toMatchObject({page: i});
      }
    });

    describe('when the origin org does not have all the vault entries missing from the target org', () => {
      const fakeOriginVaultEntries = ['foo', 'bar'];
      const fakeMissingVaultEntriesOnTarget = ['baz', 'bar'];
      beforeAll(() => {
        mockedVaultList.mockResolvedValue({
          totalPages: 1,
          items: fakeOriginVaultEntries.map((entryId) => ({key: entryId})),
        });
      });

      it('should warn with a `SnapshotMissingVaultEntriesFromOriginError`', async () => {
        await tryTransferFromOrganization({
          reporter: {
            missingVaultEntries: fakeMissingVaultEntriesOnTarget.map(
              (entryId) => ({vaultEntryId: entryId})
            ),
          } as unknown as SnapshotReporter,
          snapshot: {targetId: 'someTargetId'} as Snapshot,
          projectPath: 'somePathYay',
          cfg: {} as Configuration,
        });
        expect(
          mockedSnapshotMissingVaultEntriesFromOriginError
        ).toBeCalledTimes(1);
        expect(mockedSnapshotMissingVaultEntriesFromOriginError).toBeCalledWith(
          'someOriginOrg',
          'someTargetId',
          ['baz']
        );
        expect(mockedCliWarn).toBeCalledTimes(1);
        expect(mockedCliWarn.mock.calls[0][0]).toBeInstanceOf(
          SnapshotMissingVaultEntriesFromOriginError
        );
      });

      it('should return false', async () => {
        expect(
          await tryTransferFromOrganization({
            reporter: {
              missingVaultEntries: fakeMissingVaultEntriesOnTarget.map(
                (entryId) => ({vaultEntryId: entryId})
              ),
            } as unknown as SnapshotReporter,
            snapshot: {targetId: 'someTargetId'} as Snapshot,
            projectPath: 'somePathYay',
            cfg: {} as Configuration,
          })
        ).toBe(false);
      });
    });

    describe('when the origin org does have all the vault entries from the target org', () => {
      const fakeOriginVaultEntries = ['foo', 'bar', 'baz'];
      const fakeMissingVaultEntriesOnTarget = ['baz', 'bar'];
      beforeAll(() => {
        mockedVaultList.mockResolvedValue({
          totalPages: 1,
          items: fakeOriginVaultEntries.map((entryId) => ({key: entryId})),
        });
      });

      it('should try to transfer the vault entries from the origin org to the destination org', async () => {
        await tryTransferFromOrganization({
          reporter: {
            missingVaultEntries: fakeMissingVaultEntriesOnTarget.map(
              (entryId) => ({vaultEntryId: entryId})
            ),
          } as unknown as SnapshotReporter,
          snapshot: {
            id: 'someSnapshotId',
            targetId: 'someTargetId',
          } as Snapshot,
          projectPath: 'somePathYay',
          cfg: {} as Configuration,
        });
        expect(mockedGetClient).toBeCalledTimes(2);
        expect(mockedGetClient).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({
            organization: 'someOriginOrg',
          })
        );
        expect(mockedGetClient).toHaveBeenNthCalledWith(
          2,
          expect.objectContaining({
            organization: 'someTargetId',
          })
        );
        expect(mockedVaultImport).toBeCalledTimes(1);
        expect(mockedVaultImport).toBeCalledWith(
          'someSnapshotId',
          'someOriginOrg',
          VaultFetchStrategy.onlyMissing
        );
      });

      describe('when the transfer fails', () => {
        beforeEach(() => {
          mockedVaultImport.mockRejectedValueOnce('ohno!');
        });

        it('should warn the user and bubble up the error from the backend', async () => {
          await tryTransferFromOrganization({
            reporter: {
              missingVaultEntries: fakeMissingVaultEntriesOnTarget.map(
                (entryId) => ({vaultEntryId: entryId})
              ),
            } as unknown as SnapshotReporter,
            snapshot: {} as Snapshot,
            projectPath: 'somePathYay',
            cfg: {} as Configuration,
          });
          expect(mockedCliWarn).toBeCalledTimes(2);
          expect(mockedCliWarn).toHaveBeenNthCalledWith(2, 'ohno!');
        });

        it('should return false', async () => {
          expect(
            await tryTransferFromOrganization({
              reporter: {
                missingVaultEntries: fakeMissingVaultEntriesOnTarget.map(
                  (entryId) => ({vaultEntryId: entryId})
                ),
              } as unknown as SnapshotReporter,
              snapshot: {} as Snapshot,
              projectPath: 'somePathYay',
              cfg: {} as Configuration,
            })
          ).toBe(false);
        });
      });

      describe('when the transfer is succesful', () => {
        it('should return true', async () => {
          expect(
            await tryTransferFromOrganization({
              reporter: {
                missingVaultEntries: fakeMissingVaultEntriesOnTarget.map(
                  (entryId) => ({vaultEntryId: entryId})
                ),
              } as unknown as SnapshotReporter,
              snapshot: {} as Snapshot,
              projectPath: 'somePathYay',
              cfg: {} as Configuration,
            })
          ).toBe(true);
        });
      });
    });
  });
});
