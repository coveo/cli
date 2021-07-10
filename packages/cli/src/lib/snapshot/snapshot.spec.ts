jest.mock('../platform/authenticatedClient');
jest.mock('fs');
jest.mock('fs-extra');

import {
  ResourceSnapshotsModel,
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportType,
} from '@coveord/platform-client';
import {writeJsonSync, ensureFileSync} from 'fs-extra';
import {join, normalize} from 'path';
import {mocked} from 'ts-jest/utils';
import {getDummySnapshotModel} from '../../__stub__/resourceSnapshotsModel';
import {
  getErrorReport,
  getSuccessReport,
} from '../../__stub__/resourceSnapshotsReportModel';
import {AuthenticatedClient} from '../platform/authenticatedClient';
import {Snapshot} from './snapshot';

const mockedAuthenticatedClient = mocked(AuthenticatedClient, true);
const mockedEnsureFileSync = mocked(ensureFileSync);
const mockedCreateSnapshotFromFile = jest.fn();
const mockedPushSnapshot = jest.fn();
const mockedDeleteSnapshot = jest.fn();
const mockedGetSnapshot = jest.fn();
const mockedApplySnapshot = jest.fn();
const mockedDryRunSnapshot = jest.fn();
const mockedGetClient = jest.fn();

const getSuccessDryRunReport = (
  snapshotId: string
): ResourceSnapshotsReportModel =>
  getSuccessReport(snapshotId, ResourceSnapshotsReportType.DryRun);

const getErrorDryRunReport = (
  snapshotId: string
): ResourceSnapshotsReportModel =>
  getErrorReport(snapshotId, ResourceSnapshotsReportType.DryRun);

const getSuccessApplyReport = (
  snapshotId: string
): ResourceSnapshotsReportModel =>
  getSuccessReport(snapshotId, ResourceSnapshotsReportType.Apply);

const getErrorApplyReport = (
  snapshotId: string
): ResourceSnapshotsReportModel =>
  getErrorReport(snapshotId, ResourceSnapshotsReportType.Apply);

const doMockAuthenticatedClient = () => {
  mockedGetClient.mockImplementation(() =>
    Promise.resolve({
      resourceSnapshot: {
        createFromFile: mockedCreateSnapshotFromFile,
        push: mockedPushSnapshot,
        delete: mockedDeleteSnapshot,
        dryRun: mockedDryRunSnapshot,
        get: mockedGetSnapshot,
        apply: mockedApplySnapshot,
      },
    })
  );

  mockedAuthenticatedClient.prototype.getClient.mockImplementation(
    mockedGetClient
  );
};

describe('Snapshot', () => {
  const targetOrgId = 'target-org';
  const snapshotId = 'target-org-snapshot-id';
  beforeEach(() => {
    jest.resetAllMocks();
    doMockAuthenticatedClient();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('when validating resources in error', () => {
    let snapshot: Snapshot;
    let initialSnapshotState: ResourceSnapshotsModel;

    const doMockGetSnapshotInError = () => {
      const validateErrorReport = getErrorDryRunReport(snapshotId);
      const validateSnapshotState = getDummySnapshotModel(
        targetOrgId,
        snapshotId,
        [validateErrorReport]
      );
      const applyErrorReport = getErrorApplyReport(snapshotId);
      const applySnapshotState = getDummySnapshotModel(
        targetOrgId,
        snapshotId,
        [applyErrorReport]
      );

      mockedGetSnapshot
        .mockResolvedValueOnce(validateSnapshotState)
        .mockResolvedValueOnce(applySnapshotState);
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

    it('#validate should return false', async () => {
      const reporter = await snapshot.validate();
      expect(reporter.isSuccessReport()).toBe(false);
    });

    it('#apply should return false', async () => {
      const reporter = await snapshot.apply();
      expect(reporter.isSuccessReport()).toBe(false);
    });

    it('#validate should return the error in the detailed report', async () => {
      const reporter = await snapshot.validate();
      expect(reporter.report).toEqual(
        expect.objectContaining({
          id: 'target-org-snapshot-id',
          resultCode: 'RESOURCES_IN_ERROR',
          status: 'COMPLETED',
          type: 'DRY_RUN',
        })
      );
    });

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
      snapshot.saveDetailedReport(normalize(join('path', 'to', 'report')));
      expect(mockedEnsureFileSync).toHaveBeenCalledWith(
        normalize(
          join(
            'path',
            'to',
            'report',
            'snapshot-reports',
            'target-org-snapshot-id.json'
          )
        )
      );
    });

    it('#latestReport should save detailed report', async () => {
      await snapshot.validate();
      snapshot.saveDetailedReport(normalize(join('path', 'to', 'report')));
      expect(writeJsonSync).toHaveBeenCalledWith(
        normalize(
          join(
            'path',
            'to',
            'report',
            'snapshot-reports',
            'target-org-snapshot-id.json'
          )
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

    const doMockGetSnapshotWithoutError = async () => {
      const successValidateReport = getSuccessDryRunReport(snapshotId);
      const futureValidateSnapshotState = await getDummySnapshotModel(
        targetOrgId,
        snapshotId,
        [successValidateReport]
      );
      const successApplyReport = getSuccessApplyReport(snapshotId);
      const futureApplySnapshotState = await getDummySnapshotModel(
        targetOrgId,
        snapshotId,
        [successApplyReport]
      );

      mockedGetSnapshot
        .mockResolvedValueOnce(futureValidateSnapshotState)
        .mockResolvedValueOnce(futureApplySnapshotState);
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

    it('report should contain the info of the last DryRun operation', async () => {
      const reporter = await snapshot.validate();
      expect(reporter.report.type).toBe(ResourceSnapshotsReportType.DryRun);
    });

    it('report should contain the info of the last Apply operation', async () => {
      const reporter = await snapshot.apply();
      expect(reporter.report.type).toBe(ResourceSnapshotsReportType.Apply);
    });

    it('should refresh the snapshot until the right operation is processed', async () => {
      await snapshot.apply();
      expect(mockedGetSnapshot).toHaveBeenCalledTimes(2);
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
      const reporter = await snapshot.validate();
      expect(reporter.isSuccessReport()).toBe(true);
    });

    it('#apply should apply a snapshot to the target org', async () => {
      await snapshot.apply();
      expect(mockedApplySnapshot).toHaveBeenCalledTimes(1);
      expect(mockedApplySnapshot).toHaveBeenCalledWith(
        'target-org-snapshot-id',
        {deleteMissingResources: false}
      );
    });

    it('#apply should return true', async () => {
      const reporter = await snapshot.apply();
      expect(reporter.isSuccessReport()).toBe(true);
    });

    it('#apply should apply a snapshot with deleteMissingResources flag', async () => {
      await snapshot.apply(true);
      expect(mockedApplySnapshot).toHaveBeenCalledTimes(1);
      expect(mockedApplySnapshot).toHaveBeenCalledWith(
        'target-org-snapshot-id',
        {deleteMissingResources: true}
      );
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
