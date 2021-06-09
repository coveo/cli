jest.mock('../platform/authenticatedClient');
jest.mock('fs');
jest.mock('fs-extra');

import {
  ResourceSnapshotsModel,
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportResultCode,
  ResourceSnapshotsReportStatus,
  ResourceSnapshotsReportType,
} from '@coveord/platform-client';
import {writeJsonSync, ensureFileSync} from 'fs-extra';
import {join} from 'path';
import {mocked} from 'ts-jest/utils';
import {AuthenticatedClient} from '../platform/authenticatedClient';
import {ISnapshotValidation, Snapshot} from './snapshot';

const mockedAuthenticatedClient = mocked(AuthenticatedClient, true);
const mockedEnsureFileSync = mocked(ensureFileSync);
const mockedWriteJsonSync = mocked(writeJsonSync);
const mockedCreateSnapshotFromFile = jest.fn();
const mockedPushSnapshot = jest.fn();
const mockedDeleteSnapshot = jest.fn();
const mockedGetSnapshot = jest.fn();
const mockedDryRunSnapshot = jest.fn();
const mockedGetClient = jest.fn();

const getReport = (
  snapshotId: string,
  type: ResourceSnapshotsReportType,
  status: ResourceSnapshotsReportStatus,
  resultCode: ResourceSnapshotsReportResultCode
): ResourceSnapshotsReportModel => ({
  id: snapshotId,
  updatedDate: 1622555847000,
  type: type,
  status: status,
  resultCode: resultCode,
  resourcesProcessed: 12,
  resourceOperations: {},
  resourceOperationResults: {},
});

const getSuccessReport = (snapshotId: string): ResourceSnapshotsReportModel =>
  getReport(
    snapshotId,
    ResourceSnapshotsReportType.DryRun,
    ResourceSnapshotsReportStatus.Completed,
    ResourceSnapshotsReportResultCode.Success
  );

const getErrorReport = (snapshotId: string): ResourceSnapshotsReportModel =>
  getReport(
    snapshotId,
    ResourceSnapshotsReportType.DryRun,
    ResourceSnapshotsReportStatus.Completed,
    ResourceSnapshotsReportResultCode.ResourcesInError
  );

const getDummySnapshotModel = (
  orgId: string,
  snapshotId: string,
  reports: ResourceSnapshotsReportModel[] = []
): ResourceSnapshotsModel => ({
  id: snapshotId,
  createdBy: 'user@coveo.com',
  createdDate: 1622555047116,
  targetId: orgId,
  developerNote: 'hello',
  reports: reports,
  synchronizationReports: [],
  contentSummary: {EXTENSION: 1, FIELD: 11},
});

const doMockAuthenticatedClient = () => {
  mockedGetClient.mockImplementation(() =>
    Promise.resolve({
      resourceSnapshot: {
        createFromFile: mockedCreateSnapshotFromFile,
        push: mockedPushSnapshot,
        delete: mockedDeleteSnapshot,
        dryRun: mockedDryRunSnapshot,
        get: mockedGetSnapshot,
      },
    })
  );

  mockedAuthenticatedClient.prototype.getClient.mockImplementation(
    mockedGetClient
  );
};

describe('Snapshot', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    doMockAuthenticatedClient();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('when the resources are in error', () => {
    let snapshot: Snapshot;
    let initialSnapshotState: ResourceSnapshotsModel;
    const targetOrgId = 'target-org';
    const snapshotId = 'target-org-snapshot-id';

    const doMockGetSnapshotInError = () => {
      const errorReport = getErrorReport(snapshotId);
      const futureSnapshotState = getDummySnapshotModel(
        targetOrgId,
        snapshotId,
        [errorReport]
      );

      mockedGetSnapshot.mockResolvedValueOnce(futureSnapshotState);
    };

    beforeEach(async () => {
      doMockGetSnapshotInError();

      initialSnapshotState = await getDummySnapshotModel(
        targetOrgId,
        snapshotId
      );
      snapshot = new Snapshot(
        initialSnapshotState,
        await new AuthenticatedClient().getClient()
      );
    });

    it('#validate should execute a snapshot dryrun', async () => {
      await snapshot.validate();
      expect(mockedDryRunSnapshot).toHaveBeenCalledWith(
        'target-org-snapshot-id',
        {
          deleteMissingResources: false,
        }
      );
    });

    it('#validate should return false if the report contains an error', async () => {
      const status = await snapshot.validate();
      expect(status.isValid).toBe(false);
    });

    it('#validate should return the error in the detailed report', async () => {
      const status = await snapshot.validate();
      expect(status.report).toEqual(
        expect.objectContaining({
          id: 'target-org-snapshot-id',
          resultCode: 'RESOURCES_IN_ERROR',
          status: 'COMPLETED',
          type: 'DRY_RUN',
        })
      );
    });

    it.todo('should requires synchronization plan');

    it('#latestReport should return an error if detailed report does not exist', () => {
      expect(() => snapshot.latestReport).toThrow(/No detailed report found/);
    });

    it('#latestReport should return detailed report with error', async () => {
      await snapshot.validate();
      const report = snapshot.latestReport;
      expect(report).toEqual(
        expect.objectContaining({
          id: 'target-org-snapshot-id',
          resultCode: 'RESOURCES_IN_ERROR',
          status: 'COMPLETED',
          type: 'DRY_RUN',
        })
      );
    });

    it('#latestReport should ensure the file exists', async () => {
      await snapshot.validate();
      snapshot.saveDetailedReport(join('path', 'to', 'report'));
      expect(mockedEnsureFileSync).toHaveBeenCalledWith(
        join(
          'path',
          'to',
          'report',
          'snapshot-reports',
          'target-org-snapshot-id.json'
        )
      );
    });

    it('#latestReport should save detailed report', async () => {
      await snapshot.validate();
      snapshot.saveDetailedReport(join('path', 'to', 'report'));
      expect(writeJsonSync).toHaveBeenCalledWith(
        join(
          'path',
          'to',
          'report',
          'snapshot-reports',
          'target-org-snapshot-id.json'
        ),
        expect.objectContaining({
          id: 'target-org-snapshot-id',
          resultCode: 'RESOURCES_IN_ERROR',
          status: 'COMPLETED',
          type: 'DRY_RUN',
        }),
        {spaces: 2}
      );
    });
  });

  describe('when the snapshot is successfully created', () => {
    let snapshot: Snapshot;
    let initialSnapshotState: ResourceSnapshotsModel;
    const targetOrgId = 'target-org';
    const snapshotId = 'target-org-snapshot-id';

    const doMockGetSnapshotWithoutError = async () => {
      const successReport = getSuccessReport(snapshotId);
      const futureSnapshotState = await getDummySnapshotModel(
        targetOrgId,
        snapshotId,
        [successReport]
      );

      mockedGetSnapshot.mockResolvedValueOnce(futureSnapshotState);
    };

    beforeEach(async () => {
      doMockGetSnapshotWithoutError();

      initialSnapshotState = await getDummySnapshotModel(
        targetOrgId,
        snapshotId
      );
      snapshot = new Snapshot(
        initialSnapshotState,
        await new AuthenticatedClient().getClient()
      );
    });

    it('#id should return snapshot id', () => {
      expect(snapshot.id).toEqual('target-org-snapshot-id');
    });

    it('#targetId should return snapshot targetId', () => {
      expect(snapshot.targetId).toEqual('target-org');
    });

    it('#latestReport should return snapshot latestReport', async () => {
      await snapshot.validate();
      const report = snapshot.latestReport;
      expect(report).toEqual(
        expect.objectContaining({
          id: 'target-org-snapshot-id',
          resultCode: 'SUCCESS',
          status: 'COMPLETED',
          type: 'DRY_RUN',
        })
      );
    });

    it('#validate should return true', async () => {
      const status = await snapshot.validate();
      expect(status.isValid).toBe(true);
    });

    it('should be deleted', async () => {
      await snapshot.delete();
      expect(mockedDeleteSnapshot).toHaveBeenCalledTimes(1);
      expect(mockedDeleteSnapshot).toHaveBeenCalledWith(
        'target-org-snapshot-id'
      );
    });
  });
});
