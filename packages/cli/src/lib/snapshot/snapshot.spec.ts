jest.mock('../platform/authenticatedClient');
jest.mock('fs');

import {
  ResourceSnapshotsModel,
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportResultCode,
  ResourceSnapshotsReportStatus,
  ResourceSnapshotsReportType,
} from '@coveord/platform-client';
import {mocked} from 'ts-jest/utils';
import {AuthenticatedClient} from '../platform/authenticatedClient';
import {ISnapshotValidation, Snapshot} from './snapshot';

const mockedAuthenticatedClient = mocked(AuthenticatedClient, true);
const mockedCreateSnapshotFromFile = jest.fn();
const mockedPushSnapshot = jest.fn();
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
  beforeAll(() => {
    doMockAuthenticatedClient();
  });

  describe('when the resources are in error', () => {
    let snapshot: Snapshot;
    let initialSnapshotState: ResourceSnapshotsModel;
    let status: ISnapshotValidation;
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
      status = await snapshot.validate();
    });

    it('#validate should execute a snapshot dryrun', async () => {
      expect(mockedDryRunSnapshot).toHaveBeenCalledWith(
        'target-org-snapshot-id',
        {
          deleteMissingResources: false,
        }
      );
    });

    it('#validate should return false if the report contains an error', async () => {
      expect(status.isValid).toBe(false);
    });

    it('#validate should return the error in the detailed report', async () => {
      expect(status.report).toEqual(
        expect.objectContaining({
          id: 'target-org-snapshot-id',
          resultCode: 'RESOURCES_IN_ERROR',
          status: 'COMPLETED',
          type: 'DRY_RUN',
        })
      );
    });

    it.todo('should set a synchronization plan');
  });

  describe('when the validation passes', () => {
    let snapshot: Snapshot;
    let initialSnapshotState: ResourceSnapshotsModel;
    let status: ISnapshotValidation;
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
      status = await snapshot.validate();
    });

    it('#validate should return true', async () => {
      expect(status.isValid).toBe(true);
    });
  });
});
